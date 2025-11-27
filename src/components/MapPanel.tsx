// --- File: src/components/MapPanel.tsx ---

import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  CircleMarker,
  Polyline,
  Popup,
  useMapEvent,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { MapPin, Flag, XCircle, Route as RouteIcon } from "lucide-react";
import { ROUTE_CHECKPOINTS } from "../data/routeCheckpoints";

// Fix default icon paths for Leaflet markers
// (some bundlers require this so default markers render correctly)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// --- Type Definitions ---
type Pt = { lat: number; lon: number };
type RouteStatus = "idle" | "loading" | "success" | "error";

export type RouteInfo = {
  distance?: number;
  duration?: number;
  osrmMessage?: string;
};

type PresetRoute = {
  label: string;
  start: Pt | null;
  dest: Pt | null;
  coords: [number, number][];
  info: RouteInfo;
  status: RouteStatus;
};

// --- Preset routes (exported for use elsewhere) ---
const PRESET_ROUTES: Record<string, PresetRoute> = {
  Patiala_Chandigarh: {
    label: "Patiala to Chandigarh (Short)",
    start: { lat: 30.3398, lon: 76.3869 },
    dest: { lat: 30.7333, lon: 76.7794 },
    coords: [
      [30.3398, 76.3869],
      [30.45, 76.55],
      [30.6, 76.65],
      [30.7333, 76.7794],
    ],
    info: {
      distance: 65000,
      duration: 4500,
      osrmMessage: "Patiala to Chandigarh (Preset).",
    },
    status: "success",
  },
  Mumbai_Pune_Simulated: {
    label: "Mumbai to Pune (Long)",
    start: { lat: 19.076, lon: 72.8777 },
    dest: { lat: 18.5204, lon: 73.8567 },
    coords: [
      [19.076, 72.8777],
      [18.9, 73.2],
      [18.7, 73.5],
      [18.6, 73.7],
      [18.5204, 73.8567],
    ],
    info: {
      distance: 150000,
      duration: 8000,
      osrmMessage: "Mumbai to Pune (Simulated Preset).",
    },
    status: "success",
  },
  Interactive: {
    label: "Custom Route (Click Map)",
    start: null,
    dest: null,
    coords: [],
    info: { osrmMessage: "Select points on the map to create a custom route." },
    status: "idle",
  },
};

export { PRESET_ROUTES };
export type RouteKey = keyof typeof PRESET_ROUTES;

// --- Props ---
export interface MapPanelProps {
  activeRouteKey: RouteKey;
  setActiveRouteKey: Dispatch<SetStateAction<RouteKey>>;
  onUpdateRouteInfo: (info: RouteInfo | null) => void;
  onUpdateRouteStatus: (status: RouteStatus) => void;
}

// --- Helpers ---

/**
 * Adjusts the map view to fit the route's bounding box.
 */
function MapViewFitter({ routeCoords }: { routeCoords: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords as any);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [routeCoords, map]);

  return null;
}

/**
 * ClickHandler enables map click events for setting custom points.
 */
function ClickHandler({
  mode,
  onMapClick,
}: {
  mode: "start" | "dest" | null;
  onMapClick: (lat: number, lon: number) => void;
}) {
  useMapEvent("click", (e: any) => {
    if (!mode) return;
    const { lat, lng } = e.latlng;
    onMapClick(lat, lng);
  });
  return null;
}

// --- Main Component ---
export default function MapPanel({
  activeRouteKey: propActiveRouteKey,
  setActiveRouteKey: propSetActiveRouteKey,
  onUpdateRouteInfo,
  onUpdateRouteStatus,
}: MapPanelProps) {
  const activeRouteKey = propActiveRouteKey;
  const setActiveRouteKey = propSetActiveRouteKey;

  const [interactiveStart, setInteractiveStart] = useState<Pt | null>(null);
  const [interactiveDest, setInteractiveDest] = useState<Pt | null>(null);
  const [interactiveRouteCoords, setInteractiveRouteCoords] = useState<[number, number][]>([]);
  const [interactiveMode, setInteractiveMode] = useState<"start" | "dest" | null>("start");
  const mountedRef = useRef(true);

  const isInteractive = activeRouteKey === "Interactive";

  // Safe preset lookups (guarded)
  const presetRoute = PRESET_ROUTES[activeRouteKey] ?? PRESET_ROUTES["Interactive"];
  const presetRouteInfo = presetRoute.info;
  const presetRouteStatus = presetRoute.status;

  // Sync preset route details to parent when not interactive
  useEffect(() => {
    if (!isInteractive) {
      onUpdateRouteInfo(presetRouteInfo ?? null);
      onUpdateRouteStatus(presetRouteStatus ?? "idle");
    }
    // we intentionally depend on isInteractive and activeRouteKey/presetRouteInfo
  }, [activeRouteKey, isInteractive, presetRouteInfo, presetRouteStatus, onUpdateRouteInfo, onUpdateRouteStatus]);

  const start = isInteractive ? interactiveStart : presetRoute.start;
  const dest = isInteractive ? interactiveDest : presetRoute.dest;
  const routeCoords = isInteractive ? interactiveRouteCoords : presetRoute.coords ?? [];

  // Default map center
  const mapCenter: [number, number] = start ? [start.lat, start.lon] : [30.3398, 76.3869];

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch OSRM route only in interactive mode when both points exist
  useEffect(() => {
    if (!isInteractive || !interactiveStart || !interactiveDest) {
      setInteractiveRouteCoords([]);
      onUpdateRouteInfo(null);
      onUpdateRouteStatus("idle");
      return;
    }

    onUpdateRouteStatus("loading");
    onUpdateRouteInfo(null);

    const url = `https://router.project-osrm.org/route/v1/driving/${interactiveStart.lon},${interactiveStart.lat};${interactiveDest.lon},${interactiveDest.lat}?overview=full&geometries=geojson`;
    let cancelled = false;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled || !mountedRef.current) return;

        if (data.code !== "Ok") {
          onUpdateRouteStatus("error");
          onUpdateRouteInfo({ osrmMessage: data.message || `OSRM Error: ${data.code}` });
          setInteractiveRouteCoords([]);
          return;
        }

        const route = data.routes?.[0];
        if (!route) {
          onUpdateRouteStatus("error");
          onUpdateRouteInfo({ osrmMessage: "No route found between these points." });
          setInteractiveRouteCoords([]);
          return;
        }

        try {
          const raw: number[][] = route.geometry?.coordinates || [];
          // OSRM returns [lon, lat], so convert to [lat, lon]
          const coords: [number, number][] = raw.map((c) => [c[1], c[0]]);

          onUpdateRouteInfo({
            distance: route.distance,
            duration: route.duration,
            osrmMessage: "Route calculated successfully.",
          });
          setInteractiveRouteCoords(coords);
          onUpdateRouteStatus("success");
        } catch (e: any) {
          onUpdateRouteStatus("error");
          onUpdateRouteInfo({ osrmMessage: "Error processing route data structure." });
          setInteractiveRouteCoords([]);
        }
      })
      .catch((error: any) => {
        onUpdateRouteStatus("error");
        onUpdateRouteInfo({ osrmMessage: `Network or API failure: ${error?.message ?? error}` });
        setInteractiveRouteCoords([]);
      });

    return () => {
      cancelled = true;
    };
  }, [interactiveStart, interactiveDest, isInteractive, onUpdateRouteInfo, onUpdateRouteStatus]);

  // --- Handlers ---
  function handleMapClick(lat: number, lon: number) {
    if (interactiveMode === "start") {
      setInteractiveStart({ lat, lon });
      setInteractiveDest(null);
      setInteractiveMode("dest");
    } else if (interactiveMode === "dest") {
      setInteractiveDest({ lat, lon });
      setInteractiveMode(null);
    }
  }

  function handleRouteSelect(key: RouteKey) {
    setActiveRouteKey(key);
    if (key === "Interactive") {
      // Reset interactive state when switching back
      setInteractiveStart(null);
      setInteractiveDest(null);
      setInteractiveRouteCoords([]);
      onUpdateRouteInfo(null);
      onUpdateRouteStatus("idle");
      setInteractiveMode("start");
    }
  }

  function clearInteractive() {
    setInteractiveStart(null);
    setInteractiveDest(null);
    setInteractiveRouteCoords([]);
    onUpdateRouteInfo(null);
    onUpdateRouteStatus("idle");
    setInteractiveMode("start");
  }

  return (
    <div className="h-full min-h-0 relative bg-gray-50 shadow-lg rounded-xl overflow-hidden">
      {/* Controls Panel (Top Right) */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-gray-100">
        <div className="flex items-center gap-2">
          <RouteIcon size={16} className="text-gray-500" />
          <select
            className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            value={activeRouteKey}
            onChange={(e) => handleRouteSelect(e.target.value as RouteKey)}
          >
            {Object.keys(PRESET_ROUTES).map((key) => (
              <option key={key} value={key}>
                {PRESET_ROUTES[key as RouteKey].label}
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Mode Buttons */}
        {isInteractive && (
          <div className="flex gap-2 border-t pt-2 mt-2 border-gray-200">
            <button
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                interactiveMode === "start"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setInteractiveMode("start")}
              title="Click on the map to set the starting point"
              type="button"
            >
              <MapPin size={16} /> Start
            </button>

            <button
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                interactiveMode === "dest"
                  ? "bg-green-600 text-white shadow-md hover:bg-green-700"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setInteractiveMode("dest")}
              title="Click on the map to set the destination point"
              type="button"
            >
              <Flag size={16} /> Dest
            </button>

            <button
              className="flex items-center justify-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
              onClick={clearInteractive}
              title="Clear interactive points and route"
              type="button"
            >
              <XCircle size={16} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Map Container */}
      <MapContainer key={activeRouteKey} center={mapCenter} zoom={6} className="w-full h-full z-10">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {isInteractive && <ClickHandler mode={interactiveMode} onMapClick={handleMapClick} />}

        <MapViewFitter routeCoords={routeCoords as [number, number][]} />

        {/* Start Marker */}
        {start && (
          <Marker
            position={[start.lat, start.lon]}
            draggable={isInteractive}
            eventHandlers={{
              dragend: (e: any) => {
                const p = e.target.getLatLng();
                if (isInteractive) setInteractiveStart({ lat: p.lat, lon: p.lng });
              },
            }}
          >
            <Popup>
              <div className="font-semibold text-blue-600">Start Point {isInteractive && "(Draggable)"}</div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {dest && (
          <Marker
            position={[dest.lat, dest.lon]}
            draggable={isInteractive}
            eventHandlers={{
              dragend: (e: any) => {
                const p = e.target.getLatLng();
                if (isInteractive) setInteractiveDest({ lat: p.lat, lon: p.lng });
              },
            }}
          >
            <Popup>
              <div className="font-semibold text-green-600">Destination {isInteractive && "(Draggable)"}</div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoords && routeCoords.length > 0 && <Polyline positions={routeCoords as [number, number][]} color="#0066ff" weight={6} opacity={0.9} />}

        {/* Checkpoint markers */}
        {(ROUTE_CHECKPOINTS as any)[activeRouteKey]?.map((p: any) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lon]}
            radius={6}
            pathOptions={{
              color: p.reached ? "#16a34a" : "#9ca3af",
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="font-semibold">{p.label}</div>
              <div className="text-xs text-gray-600">{p.reached ? p.timestamp || "Reached" : "Pending"}</div>
            </Popup>
          </CircleMarker>
        )) || null}
      </MapContainer>
    </div>
  );
}

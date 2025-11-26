// --- File: src/components/MapPanel.tsx (MODIFIED) ---

import { useEffect, useState, useRef } from "react";
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
// Icon fix imports
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import {
  MapPin,
  Flag,
  XCircle,
  Clock,
  Ruler,
  Info,
  AlertTriangle,
  Loader,
  Route,
} from "lucide-react";
// We need to export PRESET_ROUTES so Dashboard can manage state
import { ROUTE_CHECKPOINTS } from "../data/routeCheckpoints";

// Fix default icon paths for Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// --- Type Definitions ---
type Pt = { lat: number; lon: number };
type RouteStatus = "idle" | "loading" | "success" | "error";
// Define PRESET_ROUTES here to export it
const PRESET_ROUTES = {
  // 1. Patiala to Chandigarh (short route)
  Patiala_Chandigarh: {
    label: "Patiala to Chandigarh (Short)",
    start: { lat: 30.3398, lon: 76.3869 },
    dest: { lat: 30.7333, lon: 76.7794 },
    // Simplified GeoJSON coordinates (Lat, Lon format)
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
    status: "success" as RouteStatus,
  },
  // 2. Sample Long Route (e.g., Mumbai to Pune)
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
    status: "success" as RouteStatus,
  },
  // 3. Interactive/Custom Mode (requires user input)
  Interactive: {
    label: "Custom Route (Click Map)",
    start: null,
    dest: null,
    coords: [],
    info: { osrmMessage: "Select points on the map to create a custom route." },
    status: "idle" as RouteStatus,
  },
};
// Export PRESET_ROUTES and RouteKey type to be used by Dashboard.tsx
export { PRESET_ROUTES };
export type RouteKey = keyof typeof PRESET_ROUTES;

// Default route key to load on initial render
const INITIAL_ROUTE_KEY: RouteKey = "Patiala_Chandigarh";

// --- Helper Components ---

/**
 * Adjusts the map view to fit the route's bounding box.
 */
function MapViewFitter({ routeCoords }: { routeCoords: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [routeCoords, map]);

  return null;
}

/**
 * Helper to get the map instance for external handlers (like zooming to a checkpoint).
 */
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

// --- Formatting Helpers (KEPT AS IS) ---
const formatDuration = (seconds: number | undefined) => {
  if (typeof seconds !== "number") return "—";
  return `${Math.ceil(seconds / 60)} min`;
};

const formatDistance = (meters: number | undefined) => {
  if (typeof meters !== "number") return "—";
  return `${(meters / 1000).toFixed(2)} km`;
};

// --- Main Component ---

export default function MapPanel() {
  // Local active route state (MapPanel is self-contained)
  const [activeRouteKey, setActiveRouteKey] =
    useState<RouteKey>(INITIAL_ROUTE_KEY);

  // State for interactive mode (used when activeRouteKey is 'Interactive')
  const [interactiveStart, setInteractiveStart] = useState<Pt | null>(null);
  const [interactiveDest, setInteractiveDest] = useState<Pt | null>(null);
  const [interactiveRouteCoords, setInteractiveRouteCoords] = useState<
    [number, number][]
  >([]);
  const [interactiveRouteInfo, setInteractiveRouteInfo] = useState<{
    distance?: number;
    duration?: number;
    osrmMessage?: string;
  } | null>(null);
  const [interactiveMode, setInteractiveMode] = useState<
    "start" | "dest" | null
  >("start");
  const [interactiveStatus, setInteractiveStatus] =
    useState<RouteStatus>("idle");

  const mountedRef = useRef(true);

  // --- Dynamic Route Selection ---

  const isInteractive = activeRouteKey === "Interactive";

  const start = isInteractive
    ? interactiveStart
    : PRESET_ROUTES[activeRouteKey].start;
  const dest = isInteractive
    ? interactiveDest
    : PRESET_ROUTES[activeRouteKey].dest;
  const routeCoords = isInteractive
    ? interactiveRouteCoords
    : PRESET_ROUTES[activeRouteKey].coords;
  const routeInfo = isInteractive
    ? interactiveRouteInfo
    : PRESET_ROUTES[activeRouteKey].info;
  const routeStatus = isInteractive
    ? interactiveStatus
    : PRESET_ROUTES[activeRouteKey].status;

  const mapCenter: [number, number] = start
    ? [start.lat, start.lon]
    : ([30.3398, 76.3869] as [number, number]); // Default center if no point is set

  // --- Lifecycle and Route Fetch (Only runs for Interactive mode) ---
  // ... (useEffect for API fetch and cleanup remains the same) ...
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // API Route fetching logic for Interactive mode
  useEffect(() => {
    // ... (logic remains the same, using existing state variables) ...
    if (!isInteractive || !interactiveStart || !interactiveDest) {
      setInteractiveRouteCoords([]);
      setInteractiveRouteInfo(null);
      setInteractiveStatus("idle");
      return;
    }

    setInteractiveStatus("loading");
    setInteractiveRouteInfo(null);

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
          setInteractiveStatus("error");
          setInteractiveRouteInfo({
            osrmMessage: data.message || `OSRM Error: ${data.code}`,
          });
          setInteractiveRouteCoords([]);
          return;
        }

        try {
          const route = data.routes?.[0];
          if (!route) {
            setInteractiveStatus("error");
            setInteractiveRouteInfo({
              osrmMessage: "No route found between these points.",
            });
            setInteractiveRouteCoords([]);
            return;
          }

          const raw = route.geometry?.coordinates || [];
          const coords: [number, number][] = raw.map((c: number[]) => [
            c[1],
            c[0],
          ]);

          setInteractiveRouteInfo({
            distance: route.distance,
            duration: route.duration,
            osrmMessage: "Route calculated successfully.",
          });
          setInteractiveRouteCoords(coords);
          setInteractiveStatus("success");
        } catch (e) {
          setInteractiveStatus("error");
          setInteractiveRouteInfo({
            osrmMessage: "Error processing route data structure.",
          });
          setInteractiveRouteCoords([]);
        }
      })
      .catch((error) => {
        setInteractiveStatus("error");
        setInteractiveRouteInfo({
          osrmMessage: `Network or API failure: ${error.message}`,
        });
        setInteractiveRouteCoords([]);
      });

    return () => {
      cancelled = true;
    };
  }, [interactiveStart, interactiveDest, isInteractive]);

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
      setInteractiveRouteInfo(null);
      setInteractiveStatus("idle");
      setInteractiveMode("start");
    }
  }

  function clearInteractive() {
    setInteractiveStart(null);
    setInteractiveDest(null);
    setInteractiveRouteCoords([]);
    setInteractiveRouteInfo(null);
    setInteractiveStatus("idle");
    setInteractiveMode("start");
  }

  // Determine the display content for the route status area (KEPT AS IS)
  const renderRouteStatus = () => {
    // Logic for Interactive Mode
    if (isInteractive) {
      if (routeStatus === "loading") {
        return (
          <div className="flex items-center text-sm text-blue-500 p-2 bg-blue-50 rounded-md">
            <Loader size={16} className="mr-2 animate-spin" />
            Calculating route...
          </div>
        );
      }
      if (routeStatus === "error") {
        return (
          <div className="text-xs text-red-600 p-2 bg-red-100 rounded-md">
            <div className="flex items-center font-semibold mb-1">
              <AlertTriangle size={16} className="mr-2 text-red-500" />
              Route Error
            </div>
            <p>{routeInfo?.osrmMessage || "Failed to find a valid route."}</p>
          </div>
        );
      }
      if (routeInfo && routeStatus === "success") {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-base font-semibold text-gray-700">
              <div className="flex items-center">
                <Ruler size={16} className="mr-2 text-green-500" />
                Distance:
              </div>
              <span>{formatDistance(routeInfo.distance)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-gray-700">
              <div className="flex items-center">
                <Clock size={16} className="mr-2 text-indigo-500" />
                Duration:
              </div>
              <span>{formatDuration(routeInfo.duration)}</span>
            </div>
          </div>
        );
      }
      return (
        <div className="flex items-center text-sm text-gray-400 p-2 bg-gray-50 rounded-md">
          <Info size={16} className="mr-2" />
          {start && !dest
            ? "Waiting for destination..."
            : "Click 'Set Start' then click the map."}
        </div>
      );
    }

    // Logic for Preset Modes (always success)
    return (
      <div className="space-y-2">
        <div className="text-xs text-slate-500 mb-2">
          {routeInfo?.osrmMessage}
        </div>
        <div className="flex items-center justify-between text-base font-semibold text-gray-700">
          <div className="flex items-center">
            <Ruler size={16} className="mr-2 text-green-500" />
            Distance:
          </div>
          <span>{formatDistance(routeInfo?.distance)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold text-gray-700">
          <div className="flex items-center">
            <Clock size={16} className="mr-2 text-indigo-500" />
            Duration:
          </div>
          <span>{formatDuration(routeInfo?.duration)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full min-h-0 relative bg-gray-50 shadow-lg rounded-xl overflow-hidden">
      {/* --- Controls Panel (Top Right) --- */}
      <div className="absolute top-4 right-4 z-500 flex flex-col gap-2 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border border-gray-100">
        {/* Route Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Route size={16} className="text-gray-500" />
          <select
            className="px-3 py-2 rounded-md text-sm font-medium bg-white text-gray-700 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            value={activeRouteKey}
            onChange={(e) => handleRouteSelect(e.target.value as RouteKey)}
          >
            {Object.entries(PRESET_ROUTES).map(([key, route]) => (
              <option key={key} value={key}>
                {route.label}
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Mode Buttons */}
        {isInteractive && (
          <div className="flex gap-2 border-t pt-2 mt-2 border-gray-200">
            {/* Set Start Button */}
            <button
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                interactiveMode === "start"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-300 hover:bg-blue-700"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setInteractiveMode("start")}
              title="Click on the map to set the starting point"
            >
              <MapPin size={16} /> Start
            </button>

            {/* Set Destination Button */}
            <button
              className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                interactiveMode === "dest"
                  ? "bg-green-600 text-white shadow-md shadow-green-300 hover:bg-green-700"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setInteractiveMode("dest")}
              title="Click on the map to set the destination point"
            >
              <Flag size={16} /> Dest
            </button>

            {/* Clear Button */}
            <button
              className="flex items-center justify-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
              onClick={clearInteractive}
              title="Clear interactive points and route"
            >
              <XCircle size={16} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* --- Map Container --- */}
      <MapContainer
        // Key is based on activeRouteKey, so the map resets when the route changes
        key={activeRouteKey}
        center={mapCenter}
        zoom={6}
        className="w-full h-full z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {isInteractive && (
          <ClickHandler mode={interactiveMode} onMapClick={handleMapClick} />
        )}

        <MapViewFitter routeCoords={routeCoords as [number, number][]} />

        {/* Start Marker */}
        {start && (
          <Marker
            position={[start.lat, start.lon]}
            draggable={isInteractive}
            eventHandlers={{
              dragend: (e: any) => {
                const p = e.target.getLatLng();
                if (isInteractive)
                  setInteractiveStart({ lat: p.lat, lon: p.lng });
              },
            }}
          >
            <Popup>
              <div className="font-semibold text-blue-600">
                Start Point {isInteractive && "(Draggable)"}
              </div>
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
                if (isInteractive)
                  setInteractiveDest({ lat: p.lat, lon: p.lng });
              },
            }}
          >
            <Popup>
              <div className="font-semibold text-green-600">
                Destination {isInteractive && "(Draggable)"}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords as [number, number][]}
            color="#0066ff"
            weight={6}
            opacity={0.9}
          />
        )}

        {/* Checkpoint markers for the active route (Map Circles) */}
        {(() => {
          const pts = ROUTE_CHECKPOINTS[activeRouteKey] || [];
          return pts.map((p) => (
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
                <div className="text-xs text-gray-600">
                  {p.reached ? p.timestamp || "Reached" : "Pending"}
                </div>
              </Popup>
            </CircleMarker>
          ));
        })()}
      </MapContainer>

      {/* --- Info Card (Bottom Left) --- (KEPT AS IS) */}
      <div className="absolute left-4 bottom-4 z-500 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-2xl border border-gray-100 text-sm w-72">
        <div className="flex items-center text-lg font-bold text-gray-800 border-b pb-2 mb-3">
          <Info size={20} className="mr-2 text-blue-500" /> Route Details
        </div>

        {/* Instructions/Point Display */}
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          <div className="font-semibold text-gray-700">
            Active Route: {PRESET_ROUTES[activeRouteKey].label}
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Start:</span>
            <span className="font-mono text-gray-600">
              {start ? `${start.lat.toFixed(4)}, ${start.lon.toFixed(4)}` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Dest:</span>
            <span className="font-mono text-gray-600">
              {dest ? `${dest.lat.toFixed(4)}, ${dest.lon.toFixed(4)}` : "—"}
            </span>
          </div>
        </div>

        {/* Route Calculation Results/Status */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          {renderRouteStatus()}
        </div>
      </div>
    </div>
  );
}

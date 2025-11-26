import { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix default icon paths for Leaflet when using bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type DashboardProps = {
  user: { email: string; role: string };
  onLogout: () => void;
};

export default function Dashboard({ user, onLogout }: DashboardProps) {
  // Preset locations
  const PRESETS: { label: string; lat: number; lon: number }[] = [
    { label: "Patiala (Start)", lat: 30.3398, lon: 76.3869 },
    { label: "Chandigarh", lat: 30.7333, lon: 76.7794 },
    { label: "Ludhiana", lat: 30.901, lon: 75.8573 },
    { label: "Amritsar", lat: 31.634, lon: 74.8723 },
    { label: "New Delhi", lat: 28.6139, lon: 77.209 },
  ];

  // Start defaults to Patiala but is editable via UI
  const [start, setStart] = useState<{ lat: number; lon: number }>({
    lat: PRESETS[0].lat,
    lon: PRESETS[0].lon,
  });

  // Destination: try localStorage.key 'objectPos' else default to Chandigarh
  const [dest, setDest] = useState<{ lat: number; lon: number } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("objectPos");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.lat === "number" &&
          typeof parsed.lon === "number"
        ) {
          setDest({ lat: parsed.lat, lon: parsed.lon });
          return;
        }
      }
    } catch (e) {
      // ignore
    }
    // default destination: Chandigarh
    setDest({ lat: PRESETS[1].lat, lon: PRESETS[1].lon });
  }, []);

  // Route coordinates from OSRM
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  useEffect(() => {
    if (!dest) return;

    const s = `${start.lon},${start.lat}`;
    const d = `${dest.lon},${dest.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${s};${d}?overview=full&geometries=geojson`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (
          data &&
          data.routes &&
          data.routes[0] &&
          data.routes[0].geometry &&
          data.routes[0].geometry.coordinates
        ) {
          // OSRM returns [lon, lat] pairs; Leaflet expects [lat, lon]
          const coords = data.routes[0].geometry.coordinates.map(
            (c: number[]) => [c[1], c[0]]
          );
          setRouteCoords(coords);
        }
      })
      .catch(() => {
        setRouteCoords([]);
      });
  }, [dest, start]);

  // Compute sampled checkpoints from the route (up to 6 points)
  const checkpoints = useMemo(() => {
    if (!routeCoords || routeCoords.length === 0)
      return [] as { lat: number; lon: number; arrived?: boolean }[];
    const max = 6;
    const step = Math.max(1, Math.floor(routeCoords.length / max));
    const points: { lat: number; lon: number; arrived?: boolean }[] = [];
    for (let i = 0; i < routeCoords.length; i += step) {
      const p = routeCoords[i];
      points.push({ lat: p[0], lon: p[1], arrived: false });
      if (points.length >= max) break;
    }
    return points;
  }, [routeCoords]);

  // Simple simulated telemetry (derived from destination to be deterministic)
  const [telemetry, setTelemetry] = useState({
    temp: "—",
    humidity: "—",
    battery: "—",
    signal: "—",
  });
  useEffect(() => {
    if (!dest) return;
    const tBase = Math.abs(dest.lat) % 10;
    const hBase = Math.abs(dest.lon) % 30;
    const temp = (20 + tBase).toFixed(1);
    const humidity = Math.round(40 + (hBase % 50)).toString();
    const battery = (80 - Math.round(tBase)).toString();
    const signal = (-60 - Math.round(hBase % 20)).toString();
    setTelemetry({ temp, humidity, battery, signal });
  }, [dest, routeCoords]);

  // Custom coordinate inputs and helpers
  const [customStartLat, setCustomStartLat] = useState<string>("");
  const [customStartLon, setCustomStartLon] = useState<string>("");
  const [customDestLat, setCustomDestLat] = useState<string>("");
  const [customDestLon, setCustomDestLon] = useState<string>("");

  function applyPresetToStart(idx: number) {
    const p = PRESETS[idx];
    setStart({ lat: p.lat, lon: p.lon });
  }

  function applyPresetToDest(idx: number) {
    const p = PRESETS[idx];
    setDest({ lat: p.lat, lon: p.lon });
    localStorage.setItem(
      "objectPos",
      JSON.stringify({ lat: p.lat, lon: p.lon })
    );
  }

  function applyCustomStart() {
    const lat = parseFloat(customStartLat);
    const lon = parseFloat(customStartLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      setStart({ lat, lon });
      setCustomStartLat("");
      setCustomStartLon("");
    }
  }

  function applyCustomDest() {
    const lat = parseFloat(customDestLat);
    const lon = parseFloat(customDestLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      setDest({ lat, lon });
      localStorage.setItem("objectPos", JSON.stringify({ lat, lon }));
      setCustomDestLat("");
      setCustomDestLon("");
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left nav */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-900">AppName</h1>
          <p className="text-xs text-slate-500">Your product tagline</p>
        </div>

        <nav className="space-y-1">
          <button className="w-full text-left px-3 py-2 rounded-md bg-sky-50 text-sky-700 font-medium">
            Overview
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50">
            Map
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50">
            Assets
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50">
            Settings
          </button>
        </nav>

        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-slate-500">Signed in as</p>
          <p className="mt-1 font-medium text-slate-900">{user.email}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
              {user.role}
            </span>
            <button
              onClick={onLogout}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Welcome, {user.email.split("@")[0]}
            </h2>
            <p className="text-sm text-slate-500">
              Here's the current position of your tracked object.
            </p>
          </div>
        </header>

        <section className="h-[70vh] bg-white border border-slate-200 rounded-2xl shadow overflow-hidden">
          <div className="h-full grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
            {/* Map column (top-left) */}
            <div className="md:col-span-1 md:row-span-1 h-full">
              {dest ? (
                <MapContainer
                  center={[start.lat, start.lon]}
                  zoom={10}
                  className="w-full h-full"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[start.lat, start.lon]}>
                    <Popup>Start: Patiala</Popup>
                  </Marker>
                  <Marker position={[dest.lat, dest.lon]}>
                    <Popup>Destination</Popup>
                  </Marker>
                  {routeCoords.length > 0 && (
                    <Polyline
                      positions={routeCoords}
                      color="#2563eb"
                      weight={4}
                    />
                  )}
                </MapContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  Loading map…
                </div>
              )}
            </div>

            {/* Checkpoints column (top-middle) */}
            <div className="md:col-span-1 md:row-span-1 p-4">
              <div className="p-4 bg-white rounded-lg border border-slate-100 h-full">
                <h4 className="text-sm font-medium text-slate-700">
                  Checkpoints
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Points sampled along the route.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 max-h-56 overflow-auto">
                  {checkpoints.length === 0 && (
                    <li className="text-slate-400">No checkpoints available</li>
                  )}
                  {checkpoints.map((cp, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs">
                          {cp.lat.toFixed(6)}, {cp.lon.toFixed(6)}
                        </div>
                        <div className="text-xs text-slate-400">
                          Checkpoint {idx + 1}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {cp.arrived ? "Reached" : "Pending"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Controls column (top-right, spans 2 cols) */}
            <div className="md:col-span-2 md:row-span-1">
              <div className="bg-white p-4 rounded-lg border border-slate-100 h-full">
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Source (preset)
                    </label>
                    <select
                      onChange={(e) =>
                        applyPresetToStart(Number(e.target.value))
                      }
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      {PRESETS.map((p, i) => (
                        <option key={p.label} value={i}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Custom Source (lat, lon)
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        value={customStartLat}
                        onChange={(e) => setCustomStartLat(e.target.value)}
                        placeholder="lat"
                        className="w-1/2 px-2 py-2 rounded-lg border border-slate-200"
                      />
                      <input
                        value={customStartLon}
                        onChange={(e) => setCustomStartLon(e.target.value)}
                        placeholder="lon"
                        className="w-1/2 px-2 py-2 rounded-lg border border-slate-200"
                      />
                      <button
                        onClick={applyCustomStart}
                        className="px-3 py-2 bg-sky-600 text-white rounded-lg"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Destination (preset)
                    </label>
                    <select
                      onChange={(e) =>
                        applyPresetToDest(Number(e.target.value))
                      }
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      {PRESETS.map((p, i) => (
                        <option key={p.label} value={i}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Custom Destination (lat, lon)
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        value={customDestLat}
                        onChange={(e) => setCustomDestLat(e.target.value)}
                        placeholder="lat"
                        className="w-1/2 px-2 py-2 rounded-lg border border-slate-200"
                      />
                      <input
                        value={customDestLon}
                        onChange={(e) => setCustomDestLon(e.target.value)}
                        placeholder="lon"
                        className="w-1/2 px-2 py-2 rounded-lg border border-slate-200"
                      />
                      <button
                        onClick={applyCustomDest}
                        className="px-3 py-2 bg-sky-600 text-white rounded-lg"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-700">
                    Object Position
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Start:{" "}
                    <span className="font-mono">
                      {start.lat.toFixed(6)}, {start.lon.toFixed(6)}
                    </span>
                  </p>
                  {dest && (
                    <p className="mt-1 text-sm text-slate-600">
                      Destination:{" "}
                      <span className="font-mono">
                        {dest.lat.toFixed(6)}, {dest.lon.toFixed(6)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Telemetry row (full width, bottom) */}
            <div className="md:col-span-4 md:row-span-1">
              <div className="p-4 bg-white rounded-lg border border-slate-100">
                <h4 className="text-sm font-medium text-slate-700">
                  Telemetry
                </h4>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-600">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="text-xs text-slate-400">Temperature</div>
                    <div className="font-medium">{telemetry.temp} °C</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="text-xs text-slate-400">Humidity</div>
                    <div className="font-medium">{telemetry.humidity} %</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="text-xs text-slate-400">Battery</div>
                    <div className="font-medium">{telemetry.battery} %</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="text-xs text-slate-400">Signal</div>
                    <div className="font-medium">{telemetry.signal} dBm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

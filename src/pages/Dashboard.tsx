import { useEffect, useState, useMemo } from "react";
import MapPanel from "../components/MapPanel";
import ControlsPanel from "../components/ControlsPanel";
import CheckpointsPanel from "../components/CheckpointsPanel";
import TelemetryPanel from "../components/TelemetryPanel";

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

  // State: start/destination, route, inputs
  const [start, setStart] = useState<{ lat: number; lon: number }>(() => ({
    lat: PRESETS[0].lat,
    lon: PRESETS[0].lon,
  }));

  const [dest, setDest] = useState<{ lat: number; lon: number } | null>(() => {
    try {
      const raw = localStorage.getItem("objectPos");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { lat: PRESETS[1].lat, lon: PRESETS[1].lon };
  });

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  const [customStartLat, setCustomStartLat] = useState("");
  const [customStartLon, setCustomStartLon] = useState("");
  const [customDestLat, setCustomDestLat] = useState("");
  const [customDestLon, setCustomDestLon] = useState("");

  // Fetch route from OSRM when start or dest changes
  useEffect(() => {
    if (!dest) return;
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${dest.lon},${dest.lat}?overview=full&geometries=geojson`;
    let cancelled = false;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const coords: [number, number][] = [];
        try {
          const raw = data.routes?.[0]?.geometry?.coordinates || [];
          for (const c of raw) {
            // OSRM gives [lon, lat]
            coords.push([c[1], c[0]]);
          }
        } catch (e) {
          // ignore
        }
        setRouteCoords(coords);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [start, dest]);

  // Checkpoints sampled from route
  const checkpoints = useMemo(() => {
    if (routeCoords.length === 0)
      return [] as { lat: number; lon: number; arrived?: boolean }[];
    const max = 6;
    const step = Math.max(1, Math.floor(routeCoords.length / max));
    const list: { lat: number; lon: number; arrived?: boolean }[] = [];
    for (let i = 0; i < routeCoords.length; i += step) {
      const [lat, lon] = routeCoords[i];
      list.push({ lat, lon, arrived: false });
      if (list.length >= max) break;
    }
    return list;
  }, [routeCoords]);

  // Simple telemetry simulation based on destination
  const telemetry = useMemo(() => {
    const base = dest ? Math.abs(Math.round(dest.lat % 30)) : 20;
    return {
      temp: base + 10,
      humidity: 40 + (dest ? Math.round(Math.abs(dest.lon) % 50) : 10),
      battery: 80,
      signal: -60,
    };
  }, [dest]);

  // Handlers
  function applyPresetToStart(idx: number) {
    const p = PRESETS[idx];
    if (p) setStart({ lat: p.lat, lon: p.lon });
  }

  function applyPresetToDest(idx: number) {
    const p = PRESETS[idx];
    if (p) {
      setDest({ lat: p.lat, lon: p.lon });
      localStorage.setItem(
        "objectPos",
        JSON.stringify({ lat: p.lat, lon: p.lon })
      );
    }
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
              <MapPanel start={start} dest={dest} routeCoords={routeCoords} />
            </div>

            {/* Checkpoints column (top-middle) */}
            <CheckpointsPanel checkpoints={checkpoints} />

            {/* Controls column (top-right, spans 2 cols) */}
            <ControlsPanel
              PRESETS={PRESETS}
              customStartLat={customStartLat}
              customStartLon={customStartLon}
              customDestLat={customDestLat}
              customDestLon={customDestLon}
              setCustomStartLat={setCustomStartLat}
              setCustomStartLon={setCustomStartLon}
              setCustomDestLat={setCustomDestLat}
              setCustomDestLon={setCustomDestLon}
              applyPresetToStart={applyPresetToStart}
              applyPresetToDest={applyPresetToDest}
              applyCustomStart={applyCustomStart}
              applyCustomDest={applyCustomDest}
              start={start}
              dest={dest}
            />

            {/* Telemetry row (full width, bottom) */}
            <TelemetryPanel telemetry={telemetry} />
          </div>
        </section>
      </main>
    </div>
  );
}

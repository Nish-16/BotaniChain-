// --- File: src/pages/Dashboard.tsx ---

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
// Import RouteKey, RouteInfo type, and PRESET_ROUTES for local use (from your MapPanel)
import MapPanel, {
  RouteKey,
  RouteInfo,
  PRESET_ROUTES,
} from "../components/MapPanel";
import Checkpoints from "../components/Checkpoints";
import { ROUTE_CHECKPOINTS } from "../data/routeCheckpoints";
import { Clock, Ruler, Info, AlertTriangle, Loader } from "lucide-react";

type DashboardProps = {
  user: { email: string; role: string };
  onLogout: () => void;
};

// --- Formatting Helpers (Copied from MapPanel.tsx to allow rendering here) ---
const formatDuration = (seconds: number | undefined) => {
  if (typeof seconds !== "number") return "—";
  return `${Math.ceil(seconds / 60)} min`;
};

const formatDistance = (meters: number | undefined) => {
  if (typeof meters !== "number") return "—";
  return `${(meters / 1000).toFixed(2)} km`;
};

// --- New Component: RouteDetailsPanel ---
type RouteDetailsProps = {
  activeRouteKey: RouteKey;
  routeInfo: RouteInfo | null;
  routeStatus: "idle" | "loading" | "success" | "error";
};

function RouteDetailsPanel({
  activeRouteKey,
  routeInfo,
  routeStatus,
}: RouteDetailsProps) {
  const isInteractive = activeRouteKey === "Interactive";
  const currentRoute = PRESET_ROUTES?.[activeRouteKey] ?? null;

  // Determine start/dest points for display (guarded)
  const start = currentRoute?.start ?? null;
  const dest = currentRoute?.dest ?? null;

  const renderStatus = () => {
    if (routeStatus === "loading") {
      return (
        <div className="flex items-center text-sm text-blue-500 p-2 bg-blue-50 rounded-md">
          {/* use icon if available; otherwise fallback text */}
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
          <p>{routeInfo?.osrmMessage ?? "Failed to find a valid route."}</p>
        </div>
      );
    }

    if (routeInfo && routeStatus === "success") {
      return (
        <div className="space-y-2">
          <div className="text-xs text-slate-500 mb-2">
            {routeInfo?.osrmMessage ?? currentRoute?.info?.osrmMessage ?? ""}
          </div>

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
        {isInteractive ? "Click map to set start point." : "Route is ready."}
      </div>
    );
  };

  return (
    <section className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mt-6">
      <div className="flex items-center text-lg font-bold text-gray-800 border-b pb-3 mb-4">
        <Info size={20} className="mr-2 text-blue-500" />
        Router Details
      </div>

      <div className="text-xs text-gray-500 mb-4 space-y-1">
        <div className="font-semibold text-gray-700">
          Active Route: {currentRoute?.label ?? activeRouteKey}
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
      <div className="mt-3 pt-3 border-t border-gray-200">{renderStatus()}</div>
    </section>
  );
}

// --- Truck Telemetry Info Panel ---
function InfoPanel() {
  const [temp, setTemp] = useState<number>(28.4);
  const [humidity, setHumidity] = useState<number>(62);
  const [battery, setBattery] = useState<number>(87);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());

  useEffect(() => {
    // Simulate telemetry updates every 5 seconds
    const t = setInterval(() => {
      setTemp((v) => Math.max(10, +(v + (Math.random() * 2 - 1)).toFixed(1)));
      setHumidity((h) =>
        Math.min(100, Math.max(0, Math.round(h + Math.random() * 3 - 1)))
      );
      setBattery((b) =>
        Math.max(0, Math.min(100, Math.round(b - Math.random() * 0.5)))
      );
      setUpdatedAt(Date.now());
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="bg-white rounded-2xl shadow p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Truck Telemetry</h3>
        <span className="text-xs text-gray-400">Live</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xs text-gray-500">Temp</div>
          <div className="text-lg font-bold">{temp.toFixed(1)}°C</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Humidity</div>
          <div className="text-lg font-bold">{humidity}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Battery</div>
          <div className="text-lg font-bold">{battery}%</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Updated: {new Date(updatedAt).toLocaleTimeString()}
      </div>
    </section>
  );
}

// --- Main Dashboard Component ---
export default function Dashboard({ user, onLogout }: DashboardProps) {
  // Lift state: Dashboard now controls the active route key
  const INITIAL_ROUTE_KEY: RouteKey = "Patiala_Chandigarh";
  const [activeRouteKey, setActiveRouteKey] =
    useState<RouteKey>(INITIAL_ROUTE_KEY);

  // State to hold route information and status from MapPanel
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeStatus, setRouteStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Telemetry state will be managed in InfoPanel below

  // Prepare data for the sidebar (guarded: fallback to empty array)
  const currentCheckpoints = ((ROUTE_CHECKPOINTS as Record<string, any>)[
    activeRouteKey as string
  ] ?? []) as any[];

  // Handler for checkpoint selection in the sidebar (no map interaction here)
  const handleSidebarSelect = (lat: number, lon: number) => {
    // you may later forward this to the MapPanel if you add a callback prop
    console.log(`Checkpoint selected from sidebar: ${lat}, ${lon}`);
  };

  // no-op navigation here; Sidebar uses router Links now

  return (
    <div className="min-h-screen flex bg-emerald-50">
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main area: interactive map + checkpoints column */}
      <main className="flex-1 p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map column (larger) */}
          <div className="flex-1">
            <section className="h-[72vh] bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-full">
                {/* MapPanel now passes route data up to Dashboard */}
                <MapPanel
                  activeRouteKey={activeRouteKey}
                  setActiveRouteKey={setActiveRouteKey}
                  onUpdateRouteInfo={setRouteInfo}
                  onUpdateRouteStatus={setRouteStatus}
                />
              </div>
            </section>
          </div>

          {/* Checkpoints column (fixed width) */}
          <aside className="w-full lg:w-80">
            <div className="sticky top-8 space-y-4">
              {/* 1. Info Panel (truck telemetry) */}
              <InfoPanel />

              {/* 2. Checkpoints List */}
              <Checkpoints
                checkpoints={currentCheckpoints.map((p: any) => ({
                  ...p,
                  reached: p.reached,
                }))}
                onSelect={handleSidebarSelect}
              />

              {/* 3. Router Details Panel */}
              <RouteDetailsPanel
                activeRouteKey={activeRouteKey}
                routeInfo={routeInfo}
                routeStatus={routeStatus}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

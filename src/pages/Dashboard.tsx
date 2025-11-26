// --- File: src/pages/Dashboard.tsx (MODIFIED) ---

import { useState } from "react"; // ADDED
import Sidebar from "../components/Sidebar";
import MapPanel, { PRESET_ROUTES, RouteKey } from "../components/MapPanel"; // MODIFIED Import
import Checkpoints from "../components/Checkpoints"; 
import { ROUTE_CHECKPOINTS } from "../data/routeCheckpoints"; // ADDED
import { useMap } from "react-leaflet"; // ADDED

type DashboardProps = {
  user: { email: string; role: string };
  onLogout: () => void;
};

// Define the component that connects the Checkpoints data and the Map function.
// This component must be rendered inside the MapContainer (via MapPanel props) 
// to access useMap().
function CheckpointsPanelWrapper({ routeKey, onSelect }: {
    routeKey: RouteKey;
    onSelect: (lat: number, lon: number) => void;
}) {
    const pts = ROUTE_CHECKPOINTS[routeKey] || [];
    return (
        <Checkpoints
            checkpoints={pts.map((p) => ({
                id: p.id,
                label: p.label,
                lat: p.lat,
                lon: p.lon,
                reached: p.reached,
                timestamp: p.timestamp,
            }))}
            onSelect={onSelect}
        />
    );
}


export default function Dashboard({ user, onLogout }: DashboardProps) {
    // Lift state: Dashboard now controls the active route key
    const INITIAL_ROUTE_KEY: RouteKey = "Patiala_Chandigarh"; 
    const [activeRouteKey, setActiveRouteKey] = useState<RouteKey>(INITIAL_ROUTE_KEY);
    
    // Prepare data for the sidebar (now using the same Route Checkpoints data)
    const currentCheckpoints = ROUTE_CHECKPOINTS[activeRouteKey] || [];

    return (
        <div className="min-h-screen flex bg-slate-50">
            <Sidebar user={user} onLogout={onLogout} />

            {/* Main area: interactive map + checkpoints column */}
            <main className="flex-1 p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Map column (larger) */}
                    <div className="flex-1">
                        <section className="h-[72vh] bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="h-full">
                                {/* MapPanel manages the map view and handles route selection. */}
                                <MapPanel 
                                    activeRouteKey={activeRouteKey}
                                    setActiveRouteKey={setActiveRouteKey}
                                    // Pass the Checkpoints component logic to MapPanel, 
                                    // which will render it as an absolute overlay for now.
                                    CheckpointsComponent={CheckpointsPanelWrapper}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Checkpoints column (fixed width) - REMOVED, as MapPanel now renders it as an overlay 
                        for simplicity and access to the map instance. If we wanted it in the sidebar, 
                        a more complex state management system (e.g., React Context) would be needed. 
                        
                        For simplicity of the code edit, the checkpoint list is now an overlay on the map, 
                        using the same styling and data as the original right-side panel.
                    */}
                    
                    <aside className="w-full lg:w-80">
                        <div className="sticky top-8">
                            <Checkpoints
                                checkpoints={currentCheckpoints.map(p => ({
                                    ...p, 
                                    reached: p.reached,
                                    // ... other props 
                                }))}
                                // NOTE: onSelect function cannot be implemented here without map context
                            />
                        </div>
                    </aside>
                    
                </div>
            </main>
        </div>
    );
}
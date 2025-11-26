type CP = { lat: number; lon: number; arrived?: boolean };

export default function CheckpointsPanel({
  checkpoints,
}: {
  checkpoints: CP[];
}) {
  return (
    <div className="md:col-span-1 md:row-span-1 p-4">
      <div className="p-4 bg-white rounded-lg border border-slate-100 h-full">
        <h4 className="text-sm font-medium text-slate-700">Checkpoints</h4>
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
  );
}

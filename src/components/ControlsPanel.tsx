type Preset = { label: string; lat: number; lon: number };

type Props = {
  PRESETS: Preset[];
  customStartLat: string;
  customStartLon: string;
  customDestLat: string;
  customDestLon: string;
  setCustomStartLat: (v: string) => void;
  setCustomStartLon: (v: string) => void;
  setCustomDestLat: (v: string) => void;
  setCustomDestLon: (v: string) => void;
  applyPresetToStart: (idx: number) => void;
  applyPresetToDest: (idx: number) => void;
  applyCustomStart: () => void;
  applyCustomDest: () => void;
  start: { lat: number; lon: number };
  dest: { lat: number; lon: number } | null;
};

export default function ControlsPanel({
  PRESETS,
  customStartLat,
  customStartLon,
  customDestLat,
  customDestLon,
  setCustomStartLat,
  setCustomStartLon,
  setCustomDestLat,
  setCustomDestLon,
  applyPresetToStart,
  applyPresetToDest,
  applyCustomStart,
  applyCustomDest,
  start,
  dest,
}: Props) {
  return (
    <div className="md:col-span-2 md:row-span-1">
      <div className="bg-white p-4 rounded-lg border border-slate-100 h-full">
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Source (preset)
            </label>
            <select
              onChange={(e) => applyPresetToStart(Number(e.target.value))}
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
              onChange={(e) => applyPresetToDest(Number(e.target.value))}
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
  );
}

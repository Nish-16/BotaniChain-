// using the automatic JSX runtime; no default React import required
import Sidebar from "../components/Sidebar";

type Props = {
  user: { email: string; role: string };
  onLogout: () => void;
};

type Warehouse = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

const WAREHOUSES: Warehouse[] = [
  // two entries intentionally share the same data (different ids)
  { id: "wh1", name: "Warehouse A", lat: 28.7041, lon: 77.1025 },
  { id: "wh1b", name: "Warehouse A", lat: 28.7041, lon: 77.1025 },
  // one different warehouse
  { id: "wh2", name: "Warehouse B", lat: 19.076, lon: 72.8777 },
];

function qrUrlFor(wh: Warehouse) {
  const payload = JSON.stringify({
    id: wh.id,
    name: wh.name,
    lat: wh.lat,
    lon: wh.lon,
  });
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    payload
  )}`;
}

export default function WarehouseQR({ user, onLogout }: Props) {
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      // small visual feedback could be added (toast/snackbar) — omitted for brevity
    } catch (e) {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-emerald-700">
                Warehouse QR Codes
              </h2>
              <p className="text-sm text-slate-600">
                Scan to get coordinates and metadata. Use the actions to copy,
                open or download the QR image.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm bg-white border-slate-200 text-slate-700 hover:shadow"
              >
                Open Maps
              </a>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WAREHOUSES.map((w) => {
              const coordsText = `${w.lat.toFixed(6)}, ${w.lon.toFixed(6)}`;
              const payload = JSON.stringify({
                id: w.id,
                name: w.name,
                lat: w.lat,
                lon: w.lon,
              });
              const qrSrc = qrUrlFor(w);
              const googleMapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${w.lat},${w.lon}`
              )}`;

              return (
                <article
                  key={w.id}
                  className="flex flex-col sm:flex-row items-stretch gap-4 bg-white rounded-xl p-4 shadow border border-slate-100"
                  aria-labelledby={`wh-${w.id}-title`}
                >
                  {/* Left: QR Image */}
                  <div className="shrink-0 flex items-center justify-center p-2">
                    <img
                      src={qrSrc}
                      alt={`QR code for ${w.name}`}
                      className="w-44 h-44 sm:w-36 sm:h-36 object-contain rounded-md bg-white"
                    />
                  </div>

                  {/* Right: Details & Actions */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3
                          id={`wh-${w.id}-title`}
                          className="text-lg font-semibold"
                        >
                          {w.name}
                        </h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                          {w.id}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-slate-600">
                        <div>
                          <span className="font-medium">Coordinates:</span>{" "}
                          <span className="font-mono">{coordsText}</span>
                        </div>
                        <div className="mt-1">
                          <span className="font-medium">Precision:</span>{" "}
                          <span className="text-xs text-gray-500">
                            6 decimals
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-gray-500">
                        Scan to retrieve the warehouse metadata (id, name, lat,
                        lon).
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => copyToClipboard(coordsText)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        type="button"
                        title="Copy coordinates"
                      >
                        Copy coords
                      </button>

                      <a
                        href={googleMapsHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-white border border-slate-200 text-slate-700 hover:shadow transition"
                      >
                        Open in Maps
                      </a>

                      <a
                        href={qrSrc}
                        download={`${w.id}-qr.png`}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-white border border-slate-200 text-slate-700 hover:shadow transition"
                        title="Download QR image"
                      >
                        Download QR
                      </a>

                      <button
                        onClick={() => copyToClipboard(payload)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                        type="button"
                        title="Copy JSON payload"
                      >
                        Copy JSON
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

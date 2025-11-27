import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

type Props = {
  user: { email: string; role: string };
  onLogout: () => void;
};

function generateApiKey() {
  // simple random hex string
  return Array.from({ length: 32 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

export default function Settings({ user, onLogout }: Props) {
  const [displayName, setDisplayName] = useState<string>(user.email);
  const [role, setRole] = useState<string>(user.role || "user");
  const [theme, setTheme] = useState<string>(
    localStorage.getItem("theme") || "light"
  );
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("apiKey") || generateApiKey();
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("apiKey", apiKey);
  }, [apiKey]);

  function saveProfile() {
    // persist display name and role in a simple auth object
    const auth = { email: displayName, role };
    localStorage.setItem("auth", JSON.stringify(auth));
    // simulate a small toast: console.info
    console.info("Profile saved", auth);
  }

  function regenerateKey() {
    const next = generateApiKey();
    setApiKey(next);
    localStorage.setItem("apiKey", next);
  }

  function exportSampleData() {
    const sample = [
      { id: "wh1", name: "Warehouse A", lat: 28.7041, lon: 77.1025 },
      { id: "wh1b", name: "Warehouse A", lat: 28.7041, lon: 77.1025 },
      { id: "wh2", name: "Warehouse B", lat: 19.076, lon: 72.8777 },
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "warehouses.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} />

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <header className="mb-6">
          <h2 className="text-2xl font-semibold text-emerald-700">Settings</h2>
          <p className="text-sm text-slate-600">
            Manage your profile and preferences.
          </p>
        </header>

        <section className="bg-white rounded-lg p-6 shadow border border-slate-100 mb-6">
          <h3 className="text-lg font-medium mb-4">Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-700 mb-1">
                Display name / Email
              </label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={saveProfile}
              className="px-4 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
            >
              Save profile
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
            >
              Logout
            </button>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow border border-slate-100 mb-6">
          <h3 className="text-lg font-medium mb-4">Appearance</h3>

          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-700">Theme</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`px-3 py-2 rounded text-sm ${
                  theme === "light"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`px-3 py-2 rounded text-sm ${
                  theme === "dark"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow border border-slate-100 mb-6">
          <h3 className="text-lg font-medium mb-4">API</h3>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs text-slate-500">API Key</div>
              <div className="font-mono mt-1 break-all">{apiKey}</div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={regenerateKey}
                className="px-3 py-2 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
              >
                Regenerate
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(apiKey)}
                className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg p-6 shadow border border-slate-100">
          <h3 className="text-lg font-medium mb-4">Data</h3>

          <div className="flex gap-2">
            <button
              onClick={exportSampleData}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded text-sm hover:shadow"
            >
              Export warehouses (JSON)
            </button>
            <button
              onClick={() =>
                alert("This is a demo: no server-side deletion performed")
              }
              className="px-3 py-2 bg-rose-600 text-white rounded text-sm hover:bg-rose-700"
            >
              Clear local demo data
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

import React, { useState } from "react";

type LoginProps = {
  onLogin: (user: { email: string; role: string }) => void;
  roles?: string[];
};

export default function Login({
  onLogin,
  roles = ["Admin", "User"],
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Enforce demo credential (client-side only)
    const DEMO_EMAIL = "admin@example.com";
    const DEMO_PASSWORD = "Admin@123";

    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError(
        "Invalid credentials. For demo use admin@example.com / Admin@123"
      );
      return;
    }

    // Success: force Admin role for demo account and save simulated token
    const demoRole = "Admin";
    setRole(demoRole);
    const token = btoa(`${email}:${demoRole}:${Date.now()}`);
    const user = { email, role: demoRole };
    localStorage.setItem("auth", JSON.stringify({ ...user, token }));
    onLogin(user);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to continue to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium shadow-sm"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            Need to add another role later? You can edit the role list where{" "}
            <span className="font-mono">Login</span> is used.
          </p>
        </div>
      </div>
    </div>
  );
}

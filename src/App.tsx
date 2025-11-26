import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

type AuthUser = { email: string; role: string };

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({ email: parsed.email, role: parsed.role });
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  function handleLogin(u: AuthUser) {
    setUser(u);
  }

  function handleLogout() {
    localStorage.removeItem("auth");
    setUser(null);
  }

  return user ? (
    <Dashboard user={user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

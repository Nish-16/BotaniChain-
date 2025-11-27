import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WarehouseQR from "./pages/WarehouseQR";
import Settings from "./pages/Settings";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/warehouse"
          element={<WarehouseQR user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/settings"
          element={<Settings user={user} onLogout={handleLogout} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

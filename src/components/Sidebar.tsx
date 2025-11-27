// --- File: src/components/Sidebar.tsx ---

import { LogOut, LayoutDashboard, Map, Truck, Settings } from "lucide-react";
import type { ComponentType } from "react";

type Props = {
  user: { email: string; role: string };
  onLogout: () => void;
};

// --- NavItem Helper Component ---
// Reusable component for clean navigation structure
type NavItemProps = {
  icon: ComponentType<{ size?: number }>; // Icon component from lucide-react (accepts `size`)
  label: string;
  isActive?: boolean;
};

function NavItem({ icon: Icon, label, isActive = false }: NavItemProps) {
  // Light theme classes using Emerald for active state
  const activeClasses = "bg-emerald-50 text-emerald-700 font-semibold";
  const inactiveClasses =
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

  return (
    <button
      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        isActive ? activeClasses : inactiveClasses
      }`}
      type="button"
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );
}

// --- Main Sidebar Component ---
export default function Sidebar({ user, onLogout }: Props) {
  return (
    <aside className="w-64 bg-white text-slate-900 border-r border-slate-200 p-5 flex flex-col justify-between shadow-lg">
      {/* Top Section: Logo and Navigation */}
      <div>
        <div className="mb-8 p-1">
          {/* Logo text uses the primary dark color (Emerald) */}
          <h1 className="text-2xl font-bold text-emerald-700">BotaniChain+</h1>
          <p className="text-xs text-slate-500">Dashboard & Tracking</p>
        </div>

        <nav className="space-y-2" aria-label="Main navigation">
          <NavItem icon={LayoutDashboard} label="Overview" isActive={true} />
          <NavItem icon={Map} label="Map" />
          <NavItem icon={Truck} label="Assets" />
          <NavItem icon={Settings} label="Settings" />
        </nav>
      </div>

      {/* Bottom Section: User Info and Logout */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="text-xs text-slate-500">Signed in as</p>
        <p
          className="mt-1 font-medium text-slate-900 truncate"
          title={user.email}
        >
          {user.email}
        </p>

        <div className="flex items-center justify-between mt-3 mb-4">
          {/* Role badge uses light slate background */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
            {user.role}
          </span>
        </div>

        {/* Logout button remains a strong, full-width destructive color */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
          type="button"
          aria-label="Logout"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

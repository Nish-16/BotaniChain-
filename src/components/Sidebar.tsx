type Props = {
  user: { email: string; role: string };
  onLogout: () => void;
};

export default function Sidebar({ user, onLogout }: Props) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900">AppName</h1>
        <p className="text-xs text-slate-500">Your product tagline</p>
      </div>

      <nav className="space-y-1">
        <button className="w-full text-left px-3 py-2 rounded-md bg-sky-50 text-sky-700 font-medium">
          Overview
        </button>
        <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50">
          Map
        </button>
        <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50">
          Assets
        </button>
        <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50">
          Settings
        </button>
      </nav>

      <div className="mt-6 border-t pt-4">
        <p className="text-xs text-slate-500">Signed in as</p>
        <p className="mt-1 font-medium text-slate-900">{user.email}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
            {user.role}
          </span>
          <button
            onClick={onLogout}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

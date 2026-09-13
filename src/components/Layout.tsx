import { useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Bell, Search } from "lucide-react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/stations": "Stations",
  "/printers": "Printers",
  "/jobs": "Jobs",
  "/revenue": "Revenue",
  "/alerts": "Alerts",
};

export default function Layout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");

  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`transition-all duration-300 min-w-0 ${
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between h-14 lg:h-16 px-3 lg:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{title}</h2>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm outline-none w-36 lg:w-48 placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => navigate("/alerts")}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-dot" />
              </button>
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium text-blue-700">
                    {(user.username || "A").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.username || "Admin"}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role || "admin"}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:pl-8 lg:pr-6 lg:pt-6 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}

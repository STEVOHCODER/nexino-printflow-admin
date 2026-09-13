import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Printer,
  FileText,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  X,
  Tag,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/stations", icon: MapPin, label: "Stations" },
  { to: "/printers", icon: Printer, label: "Printers" },
  { to: "/jobs", icon: FileText, label: "Jobs" },
  { to: "/pricing", icon: Tag, label: "Pricing" },
  { to: "/revenue", icon: DollarSign, label: "Revenue" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/login");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx("flex items-center gap-3 px-4 py-5 border-b border-slate-700/50", collapsed && "justify-center px-2")}>
        <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
          <Printer className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-white font-bold text-lg leading-tight truncate">Nexino</h1>
            <p className="text-slate-400 text-xs truncate">PrintFlow Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 sidebar-scroll overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onMobileClose}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-700/50 space-y-1">
        <button
          onClick={handleLogout}
          className={clsx(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={onToggle}
          className={clsx(
            "hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <ChevronLeft
            className={clsx(
              "w-5 h-5 shrink-0 transition-transform",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={clsx(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-[#0f172a] transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="relative w-64 h-full bg-[#0f172a] flex flex-col animate-slide-in">
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-3 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

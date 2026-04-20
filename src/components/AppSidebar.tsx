import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  TrendingUp,
  LayoutDashboard,
  Heart,
  Target,
  BarChart3,
  MapPin,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Customer Sentiment", path: "/sentiment", icon: Heart },
  { title: "Market Position", path: "/market", icon: Target },
  { title: "Performance Metrics", path: "/performance", icon: BarChart3 },
  { title: "Market Explorer", path: "/explorer", icon: MapPin },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-transparent transition-[width] duration-300 ${
        collapsed ? "w-[88px]" : "w-[280px]"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 ${collapsed ? "justify-center px-3" : ""}`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl gradient-insight shadow-[0_8px_24px_rgba(129,140,248,0.3)]">
          <TrendingUp className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-lg font-medium text-foreground">RestaurantIQ</h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Intelligence</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-9 flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-white/70 text-muted-foreground shadow-[0_4px_12px_rgba(31,41,55,0.06)] backdrop-blur-xl transition-colors hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Nav */}
      <nav className="mt-4 flex flex-1 flex-col gap-1.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            title={collapsed ? item.title : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out ${
                isActive
                  ? "pill-active"
                  : "text-sidebar-foreground hover:bg-white/40 hover:text-foreground"
              } ${collapsed ? "justify-center px-0" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    isActive ? "text-primary" : "text-sidebar-foreground"
                  }`}
                  strokeWidth={1.5}
                />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div
          className={`rounded-3xl border border-white/60 bg-white/40 p-3 backdrop-blur-xl ${
            collapsed ? "flex justify-center" : ""
          }`}
        >
          <div className={`flex items-center gap-2 ${collapsed ? "" : "text-xs text-muted-foreground"}`}>
            <Database className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
            {!collapsed && (
              <span className="leading-tight">
                Yelp + Web Intelligence
                <br />
                <span className="font-data text-[10px] text-foreground/70">127K reviews</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

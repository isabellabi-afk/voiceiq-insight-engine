import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  TrendingUp,
  LayoutDashboard,
  Heart,
  Target,
  BarChart3,
  Sparkles,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Customer Sentiment", path: "/sentiment", icon: Heart },
  { title: "Market Position", path: "/market", icon: Target },
  { title: "Performance Metrics", path: "/performance", icon: BarChart3 },
  { title: "Live Analyzer", path: "/analyzer", icon: Sparkles },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ${
        collapsed ? "w-[72px]" : "w-[280px]"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-insight">
          <TrendingUp className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-lg font-bold text-foreground">RestaurantIQ</h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Intelligence</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground transition-colors hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Nav */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            title={collapsed ? item.title : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3">
        <div
          className={`rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 ${
            collapsed ? "flex justify-center" : ""
          }`}
        >
          <div className={`flex items-center gap-2 ${collapsed ? "" : "text-xs text-muted-foreground"}`}>
            <Database className="h-4 w-4 shrink-0 text-primary" />
            {!collapsed && (
              <span className="leading-tight">
                Yelp Dataset + Web Intelligence
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

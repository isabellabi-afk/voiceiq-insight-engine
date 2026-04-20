import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
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

function AuraBloomLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="aura-bloom shrink-0"
      aria-hidden="true"
    >
      {/* Definitions */}
      <defs>
        <radialGradient id="bloom-core" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#F9A8D4" />
          <stop offset="100%" stopColor="#818CF8" />
        </radialGradient>
        <radialGradient id="bloom-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(192,132,252,0.5)" />
          <stop offset="100%" stopColor="rgba(192,132,252,0)" />
        </radialGradient>
        <filter id="bloom-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>
        <filter id="node-glow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>

      {/* Outer glow */}
      <circle cx="20" cy="20" r="18" fill="url(#bloom-glow)" filter="url(#node-glow)" />

      {/* Frosted glass arc */}
      <path
        d="M12 30 Q10 18 16 10 Q20 5 24 10 Q30 18 28 30"
        fill="rgba(255,255,255,0.35)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.8"
        strokeLinecap="round"
        filter="url(#bloom-blur)"
      />

      {/* Inner frosted shape */}
      <path
        d="M15 28 Q14 20 18 13 Q20 9 22 13 Q26 20 25 28"
        fill="rgba(255,255,255,0.25)"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.5"
      />

      {/* Data nodes — the "bloom" flower */}
      {/* Left node */}
      <circle cx="15" cy="12" r="2.5" fill="#C4B5FD" opacity="0.85" />
      {/* Right node */}
      <circle cx="25" cy="12" r="2.5" fill="#C4B5FD" opacity="0.85" />
      {/* Central node — the insight */}
      <circle cx="20" cy="8" r="3.5" fill="url(#bloom-core)" className="bloom-core-node" />
      {/* Central highlight */}
      <circle cx="19" cy="7" r="1.2" fill="rgba(255,255,255,0.6)" />

      {/* Connector lines */}
      <line x1="15" y1="12" x2="20" y2="8" stroke="rgba(196,181,253,0.5)" strokeWidth="0.6" />
      <line x1="25" y1="12" x2="20" y2="8" stroke="rgba(196,181,253,0.5)" strokeWidth="0.6" />
      <line x1="15" y1="12" x2="25" y2="12" stroke="rgba(196,181,253,0.3)" strokeWidth="0.5" />
    </svg>
  );
}

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
        <AuraBloomLogo size={40} />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground leading-none">Aura</h1>
            <p className="mt-1 text-[10px] font-light tracking-[0.14em] text-muted-foreground">Illuminating Local Growth</p>
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

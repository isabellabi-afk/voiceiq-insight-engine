import { NavLink } from "react-router-dom";
import { BarChart3, Brain, Compass, Database, Sparkles, Zap } from "lucide-react";

const navItems = [
  { title: "Overview", path: "/", icon: BarChart3 },
  { title: "Topic Explorer", path: "/topics", icon: Compass },
  { title: "Live Analyzer", path: "/analyzer", icon: Zap },
];

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border/50 bg-sidebar p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent">
          <Brain className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground">VoiceIQ</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent/15 text-accent glow-accent"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
            {item.title === "Live Analyzer" && (
              <Sparkles className="ml-auto h-3 w-3 text-accent" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer badge */}
      <div className="mt-auto rounded-lg border border-border/50 bg-secondary/50 px-3 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Database className="h-3 w-3" />
          <span>Yelp Dataset · 127K reviews</span>
        </div>
      </div>
    </aside>
  );
}

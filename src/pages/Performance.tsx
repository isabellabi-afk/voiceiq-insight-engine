import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Activity, TrendingUp, Users, Building2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

export default function Performance() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");

  // 1. Escuchar de manera reactiva la sesión del restaurante global
  useEffect(() => {
    const checkActiveSession = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";
      setActiveRestaurant(saved);
    };

    checkActiveSession();
    window.addEventListener("storage", checkActiveSession);
    return () => window.removeEventListener("storage", checkActiveSession);
  }, []);

  // 2. Generar Métricas y Tendencias Dinámicas en base al Contexto Activo de Yelp
  const dynamicMetrics = useMemo(() => {
    const isGlobal = activeRestaurant === "all";
    
    // Generación determinista basada en texto para consistencia de datos durante la navegación
    const hash = activeRestaurant.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Cálculos de KPIs principales
    const avgRating = isGlobal ? 4.3 : parseFloat((3.7 + (hash % 12) / 10).toFixed(1));
    const reviewsCollected = isGlobal ? 12847 : Math.round(480 + (hash * 4) % 3200);
    const repeatVisitRate = isGlobal ? "38%" : `${22 + (hash % 24)}%`;
    const mentionsGrowth = isGlobal ? "+23%" : `${hash % 2 === 0 ? "+" : "-"}${hash % 35}%`;

    // Re-calculamos la serie temporal de 12 meses
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const trendData = months.map((m, i) => {
      // El factor de alteración cambia según el restaurante seleccionado
      const baselineModifier = isGlobal ? 4.0 : 3.5 + (hash % 10) * 0.1;
      const seasonalVariance = Math.sin(i / 1.8) * 0.25;
      const growthTrend = i * 0.035;
      
      return {
        m,
        rating: parseFloat(Math.min(5, Math.max(1, baselineModifier + seasonalVariance + growthTrend)).toFixed(2)),
        reviews: Math.round((reviewsCollected / 12) + (i * 15) + (Math.sin(i) * 30)),
      };
    });

    // Desglose volumétrico por plataformas
    const channelData = [
      { ch: "Yelp Core", volume: Math.round(reviewsCollected * 0.50) },
      { ch: "Google Maps", volume: Math.round(reviewsCollected * 0.33) },
      { ch: "OpenTable", volume: Math.round(reviewsCollected * 0.11) },
      { ch: "TripAdvisor", volume: Math.round(reviewsCollected * 0.06) },
    ].sort((a, b) => b.volume - a.volume);

    return {
      avgRating,
      reviewsCollected,
      repeatVisitRate,
      mentionsGrowth,
      trendData,
      channelData
    };
  }, [activeRestaurant]);

  return (
    <DashboardLayout>
      {/* MONITOR CONTEXTUAL DE MÉTRICAS */}
      <div className="mb-4 flex items-center justify-between bg-white/40 border border-foreground/[0.04] p-4 rounded-2xl backdrop-blur-sm shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Operational Metric Stream</span>
            <h3 className="text-sm font-semibold text-foreground">
              {activeRestaurant === "all" 
                ? "Consolidated Network Operations (All Nodes)" 
                : `Isolated Analytics Frame: ${activeRestaurant}`}
            </h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
            SQLite Ledger Connected
          </span>
        </div>
      </div>

      <PageHeader
        eyebrow="Operations"
        title="Performance Metrics"
        subtitle="Track chronological rating trajectories, aggregate review volumes, and NLP channel distributions over time."
      />

      {/* KPI STRIP CARD GRID */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Avg rating (12m)", value: `${dynamicMetrics.avgRating} ★`, icon: Activity },
          { label: "Reviews collected", value: dynamicMetrics.reviewsCollected.toLocaleString(), icon: BarChart3 },
          { label: "Repeat visit rate", value: dynamicMetrics.repeatVisitRate, icon: Users },
          { label: "Mentions growth", value: dynamicMetrics.mentionsGrowth, icon: TrendingUp },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-5 hover:shadow-xs transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
                <p className="mt-2 font-data text-3xl font-bold text-foreground">{k.value}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <k.icon className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Line Chart: Rating Trajectory */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-foreground">Rating & Quality Trajectory</h3>
            <p className="text-xs text-muted-foreground">Rolling 12-month sentiment classifier tracking index</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicMetrics.trendData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[1, 5]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  name="Rating Matrix"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  dot={{ r: 2, strokeWidth: 1 }} 
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Channel Volume Breakdown */}
        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-foreground">Reviews by Core Channel</h3>
            <p className="text-xs text-muted-foreground">Volume distribution across integrated text pipelines</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicMetrics.channelData} layout="vertical" margin={{ left: -10, right: 10 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 4" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis dataKey="ch" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={85} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="volume" name="Ingested Logs" fill="hsl(var(--primary))" opacity={0.85} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

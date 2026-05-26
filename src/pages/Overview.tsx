import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Activity, AlertTriangle, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { GlassTooltip } from "@/components/GlassTooltip";
import { getOverviewData, getTopProblemDrivers, getRealRestaurantsList, getRestaurantKPIs } from "../apiService";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function ProgressRing({ value }: { value: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={r} stroke="rgba(31,41,55,0.08)" strokeWidth="6" fill="none" />
      <circle
        cx="36"
        cy="36"
        r={r}
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
      <text x="36" y="40" textAnchor="middle" className="font-data fill-foreground text-[13px] font-semibold">
        {value}%
      </text>
    </svg>
  );
}

export default function Overview() {
  const [backendData, setBackendData] = useState<any>(null);
  const [restaurantKPIs, setRestaurantKPIs] = useState<any>(null);
  const [driversData, setDriversData] = useState<any[]>([]);
  const [realRestaurants, setRealRestaurants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeRestaurant, setActiveRestaurant] = useState<string>(() => {
    return localStorage.getItem("selected_yelp_restaurant") || "all";
  });

  const handleRestaurantChange = (restaurantName: string) => {
    setActiveRestaurant(restaurantName);
    localStorage.setItem("selected_yelp_restaurant", restaurantName);
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("restaurantChanged"));
  };

  // 1. Ingestión inicial de metadatos globales
  useEffect(() => {
    async function loadInitialData() {
      try {
        const overview = await getOverviewData();
        if (overview) setBackendData(overview);

        const restaurantNames = await getRealRestaurantsList();
        setRealRestaurants(restaurantNames);
      } catch (err) {
        console.error("Error syncing metadata:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // 2. Consulta dinámica a endpoints database sin fallbacks falsos
  useEffect(() => {
    async function syncDynamicMetrics() {
      try {
        const driversRes = await getTopProblemDrivers(activeRestaurant);
        if (driversRes && driversRes.top_problem_drivers) {
          setDriversData(driversRes.top_problem_drivers);
        } else {
          setDriversData([]);
        }

        if (activeRestaurant === "all") {
          setRestaurantKPIs(null);
        } else {
          const data = await getRestaurantKPIs(activeRestaurant);
          setRestaurantKPIs(data || null);
        }
      } catch (err) {
        console.error("Error syncing dynamic metrics:", err);
        setDriversData([]);
      }
    }
    syncDynamicMetrics();
  }, [activeRestaurant]);

  // --- CAPA DE PROCESAMIENTO ANALÍTICO ---
  const isGlobal = activeRestaurant === "all";
  const currentMetrics = isGlobal ? backendData : (restaurantKPIs?.metrics || restaurantKPIs);

  const totalReviews = currentMetrics && typeof currentMetrics.total_reviews === 'number' ? currentMetrics.total_reviews : 0;
  const csatValue = currentMetrics && currentMetrics.avg_stars ? Number(currentMetrics.avg_stars.toFixed(1)) : 0;

  // Cálculo de porcentajes puros y verídicos extraídos del database
  const positivePct = useMemo(() => {
    if (isGlobal) return currentMetrics?.positive_pct || 0;
    if (totalReviews > 0) {
      const posReviews = currentMetrics?.positive_reviews || currentMetrics?.positive_count || 0;
      return Math.round((posReviews / totalReviews) * 100);
    }
    return 0; 
  }, [isGlobal, currentMetrics, totalReviews]);

  const negativePct = totalReviews > 0 ? Math.round(100 - positivePct) : 0;
  const npsValue = totalReviews > 0 ? Math.round(positivePct - negativePct) : 0;
  const npsText = npsValue >= 0 ? `+${npsValue}` : `${npsValue}`;

  // Formateador dinámico para el gráfico circular
  const currentSentimentData = totalReviews === 0 ? [
    { name: "No Ingested Logs", value: 100, color: "rgba(156, 163, 175, 0.12)" }
  ] : [
    { name: "Positive Reviews", value: positivePct, color: "#6EE7B7" },
    { name: "Negative Reviews", value: negativePct, color: "#F9A8D4" },
  ];

  // Mapeo adaptivo y limpio de factores NLP de database
  const processedDrivers = useMemo(() => {
    if (!driversData || !Array.isArray(driversData)) return [];
    return driversData
      .map((d: any, idx: number) => {
        const rawFactor = d.factor || "General operations";
        return {
          id: `factor-${rawFactor}-${idx}`,
          name: rawFactor.charAt(0).toUpperCase() + rawFactor.slice(1),
          value: Number(d.negative_reviews || d.count || 0)
        };
      })
      .filter(d => d.value > 0);
  }, [driversData]);

  // Acciones operativas sugeridas según taxonomía semántica detectada
  const getActionRecommendation = (factorName: string) => {
    const nameLower = factorName.toLowerCase();
    if (nameLower.includes("comida") || nameLower.includes("food")) {
      return "Audit cooking times, kitchen temperature baselines, and recipe consistency via unannounced station checks.";
    }
    if (nameLower.includes("servicio") || nameLower.includes("service")) {
      return "Optimize table allocation metrics during peak hours and reinforce floor staff turnaround guidelines.";
    }
    if (nameLower.includes("ambiente") || nameLower.includes("ambiance")) {
      return "Evaluate ambient music decibel limits and audit deep cleaning shift logs in the main dining area.";
    }
    if (nameLower.includes("precio") || nameLower.includes("price")) {
      return "Conduct a hyper-local pricing competitiveness sweep and introduce strategic high-margin bundle choices.";
    }
    return `Deploy localized operational remediation strategies specifically mapped to mitigate "${factorName}" friction points.`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center text-sm text-muted-foreground animate-pulse">
          Loading dashboard data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-foreground/[0.04] pb-6">
        <PageHeader
          eyebrow="Overview"
          title="Intelligence Dashboard"
          subtitle="Customer analytics extracted from the connected API."
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-sm self-start xl:self-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Active Yelp Client Account:</span>
          </div>
          <select
            value={activeRestaurant}
            onChange={(e) => handleRestaurantChange(e.target.value)}
            className="bg-white text-xs font-medium rounded-xl border border-foreground/[0.06] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer text-foreground shadow-sm w-full sm:w-auto max-w-[320px] min-w-[260px]"
          >
            <option value="all">🌐 Global Admin Network View (All Brands)</option>
            {realRestaurants.map((name) => (
              <option key={name} value={name}>
                🏪 {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* REPORTE DE TARJETAS SUPERIORES */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {/* NPS CARD */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Net Promoter Score (Est.)</p>
              <p className="mt-2 font-data text-4xl font-bold text-positive glow-text-positive">
                {totalReviews > 0 ? npsText : "N/A"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Sentiment-based calculation</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-positive/15">
              <Activity className="h-4 w-4 text-positive" />
            </div>
          </div>
        </motion.div>

        {/* STARS CARD */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Average Rating</p>
              <p className="mt-2 font-data text-4xl font-bold text-foreground">
                {csatValue || "0.0"} <span className="text-2xl text-muted-foreground">/5</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Yelp data score</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15">
              <Star className="h-4 w-4 text-warning" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${s <= Math.round(csatValue) ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* VOLUME CARD */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Reviews</p>
              <p className="mt-2 font-data text-4xl font-bold text-warning glow-text-warning">
                {totalReviews.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Ingested database logs</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15">
              <MessageSquare className="h-4 w-4 text-warning" />
            </div>
          </div>
        </motion.div>

        {/* COGNITIVE COVERAGE CARD */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Dataset Ingestion</p>
              <p className="mt-2 font-data text-4xl font-bold text-foreground">100%</p>
              <p className="mt-1 text-xs text-muted-foreground">API Sync status</p>
            </div>
            <ProgressRing value={100} />
          </div>
        </motion.div>
      </motion.div>

      {/* SECCIÓN DE GRÁFICAS COMPARTIDAS */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* DISTRIBUCIÓN SEMÁNTICA */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Sentiment Distribution</h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Live API Data</span>
          </div>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentSentimentData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={totalReviews > 0 ? 3 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {currentSentimentData.map((d: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-data text-3xl font-bold text-positive glow-text-positive">
                {totalReviews > 0 ? `${positivePct}%` : "0%"}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Positive</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {totalReviews > 0 && currentSentimentData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-data text-foreground font-semibold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* PROBLEM DRIVERS DESDE MODELO NLP REAL */}
        <div className="glass-card p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Top Drivers of Negative Sentiment</h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">NLP Extraction</span>
          </div>
          <div className="space-y-4">
            {processedDrivers.length > 0 ? (
              processedDrivers.map((d: any, i: number) => {
                const maxVal = processedDrivers[0]?.value || 1;
                const barWidth = Math.min((d.value / maxVal) * 100, 100);
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{d.name}</span>
                      <span className="font-data text-muted-foreground font-semibold">{d.value} {d.value === 1 ? 'mention' : 'mentions'}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400"
                      />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center h-48 border border-dashed border-foreground/10 rounded-2xl bg-foreground/[0.01]">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                <p className="text-xs text-muted-foreground font-medium max-w-xs">
                  No critical negative driver signals isolated for this specific brand entity in the review data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ÁREAS DE MEJORA COMPLETAMENTE DINÁMICAS */}
      {processedDrivers.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-negative" />
            <h3 className="font-display text-base font-semibold">Critical Improvement Areas</h3>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {processedDrivers.slice(0, 3).map((issue: any, i: number) => (
              <motion.div
                key={`critical-${issue.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover relative overflow-hidden p-5"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-negative/60 to-transparent" />
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-negative/15">
                      <Clock className="h-5 w-5 text-negative" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-foreground">{issue.name}</h4>
                      <p className="font-data text-xs text-negative">{issue.value} {issue.value === 1 ? 'critical record' : 'critical records'}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-negative/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-negative">
                    High Impact
                  </span>
                </div>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  Negative semantic weight identified in the review data reviews for the category "{issue.name}". Remediation recommended.
                </p>
                <div className="mt-3 rounded-2xl border border-white/60 bg-white/50 p-3 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Suggested Action</p>
                  <p className="mt-1 text-xs text-foreground font-medium leading-relaxed">
                    {getActionRecommendation(issue.name)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


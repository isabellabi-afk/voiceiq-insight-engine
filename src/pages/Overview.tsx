import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MessageSquare,
  Activity,
  AlertTriangle,
  Clock,
  Download,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { GlassTooltip } from "@/components/GlassTooltip";
import { getOverviewData, getTopProblemDrivers } from "../apiService";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// Función para formatear las etiquetas en inglés elegante (ej: "servicio" -> "Service")
const formatFactorName = (text: string) => {
  if (!text) return "";
  const lower = text.toLowerCase();
  if (lower === "comida") return "Food Quality";
  if (lower === "servicio") return "Customer Service";
  if (lower === "ambiente") return "Atmosphere";
  if (lower === "otros") return "Other Factors";
  return text.charAt(0).toUpperCase() + text.slice(1);
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
  const [driversData, setDriversData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const overview = await getOverviewData();
        if (overview) setBackendData(overview);

        const driversResponse = await getTopProblemDrivers();
        if (driversResponse && driversResponse.top_problem_drivers) {
          const formattedDrivers = driversResponse.top_problem_drivers.map((d: any) => ({
            name: formatFactorName(d.factor),
            value: d.negative_reviews
          }));
          setDriversData(formattedDrivers);
        }
      } catch (err) {
        console.error("Error syncing with Railway:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalReviews = backendData?.total_reviews || 0;
  const csatValue = backendData?.csat || 0;
  const npsValue = backendData?.nps !== undefined ? backendData.nps : 0;
  const npsText = npsValue >= 0 ? `+${npsValue}` : `${npsValue}`;
  const responseRate = backendData?.response_rate || 100;

  const positivePct = backendData?.positive_pct || 75;
  const negativePct = Math.round(100 - positivePct);
  
  const currentSentimentData = [
    { name: "Positive Reviews", value: positivePct, color: "#6EE7B7" },
    { name: "Negative Reviews", value: negativePct, color: "#F9A8D4" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center text-sm text-muted-foreground animate-pulse">
          Synchronizing Dashboard with Railway database...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Overview"
        title="Intelligence Dashboard"
        subtitle="Real-time customer analytics extracted from your processed Yelp SQLite dataset."
        actions={
          <button className="pill flex items-center gap-2 border border-white/60 bg-white/60 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-xl shadow-sm hover:bg-white/80">
            <Download className="h-3.5 w-3.5" /> Export Data
          </button>
        }
      />

      {/* KPI CARDS (ENGLISH) */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {/* NPS */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Net Promoter Score (Est.)</p>
              <p className="mt-2 font-data text-4xl font-bold text-positive glow-text-positive">{npsText}</p>
              <p className="mt-1 text-xs text-muted-foreground">Sentiment-based metric</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-positive/15">
              <Activity className="h-4 w-4 text-positive" />
            </div>
          </div>
        </motion.div>

        {/* CSAT */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Average Rating</p>
              <p className="mt-2 font-data text-4xl font-bold text-foreground">
                {csatValue}
                <span className="text-2xl text-muted-foreground">/5</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Yelp star rating</p>
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
                  className={`h-3.5 w-3.5 ${
                    s <= Math.round(csatValue) ? "fill-warning text-warning" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Total Reviews */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Reviews</p>
              <p className="mt-2 font-data text-4xl font-bold text-warning glow-text-warning">
                {totalReviews.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Loaded records</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15">
              <MessageSquare className="h-4 w-4 text-warning" />
            </div>
          </div>
        </motion.div>

        {/* Dataset Coverage */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Dataset Coverage</p>
              <p className="mt-2 font-data text-4xl font-bold text-foreground">{responseRate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">API Sync Status</p>
            </div>
            <ProgressRing value={responseRate} />
          </div>
        </motion.div>
      </motion.div>

      {/* CHARTS SECTION */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Donut Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Sentiment Distribution</h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Global Metric</span>
          </div>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={currentSentimentData} innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                  {currentSentimentData.map((d: any, i: number) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-data text-3xl font-bold text-positive glow-text-positive">{positivePct}%</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Positive</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {currentSentimentData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-data text-foreground font-semibold">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP PROBLEM DRIVERS */}
        <div className="glass-card p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Top Drivers of Negative Sentiment</h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">NLP Modeling</span>
          </div>
          <div className="space-y-4">
            {driversData.length > 0 ? (
              driversData.map((d: any, i: number) => {
                const maxVal = driversData[0]?.value || 100;
                const barWidth = Math.min((d.value / maxVal) * 100, 100);

                return (
                  <motion.div key={d.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{d.name}</span>
                      <span className="font-data text-muted-foreground font-semibold">{d.value} reviews</span>
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
              <p className="text-sm text-muted-foreground">Loading negative factors analysis...</p>
            )}
          </div>
        </div>
      </div>

      {/* CRITICAL IMPROVEMENT AREAS */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-negative" />
          <h3 className="font-display text-base font-semibold">Critical Improvement Areas</h3>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {driversData.slice(0, 3).map((issue: any, i: number) => (
            <motion.div
              key={issue.name}
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
                    <p className="font-data text-xs text-negative">{issue.value} critical mentions</p>
                  </div>
                </div>
                <span className="rounded-full bg-negative/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-negative">
                  High Impact
                </span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Volume density detected during NLP review processing for Mexican restaurant locations.
              </p>
              <div className="mt-3 rounded-2xl border border-white/60 bg-white/50 p-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Suggested Action</p>
                <p className="mt-1 text-sm text-foreground">Audit "{issue.name}" factor using operational action plans.</p>
              </div>
            </motion.div>
          ))}
          {driversData.length === 0 && (
            <p className="text

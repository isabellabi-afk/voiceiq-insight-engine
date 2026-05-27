import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Star,
  MessageSquare,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  DollarSign,
  ChefHat,
  Download,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { GlassTooltip } from "@/components/GlassTooltip";
import { getOverviewData } from "../apiService";

const staticSparkline = [12, 15, 14, 18, 22, 28, 26, 32, 35, 38, 41, 42].map((v, i) => ({ i, v }));
const staticVolumeTrend = [120, 135, 142, 168, 180, 220].map((v, i) => ({ i, v }));

const staticSentimentData = [
  { name: "Very Positive", value: 42, color: "#6EE7B7" },
  { name: "Positive", value: 26, color: "#A7F3D0" },
  { name: "Neutral", value: 12, color: "#FED7AA" },
  { name: "Negative", value: 14, color: "#FBCFE8" },
  { name: "Very Negative", value: 6, color: "#F9A8D4" },
];

const staticDrivers = [
  { name: "Food Quality", value: 89, tone: "positive" },
  { name: "Service Speed", value: 76, tone: "positive" },
  { name: "Staff Friendliness", value: 71, tone: "positive" },
  { name: "Value for Money", value: 65, tone: "warning" },
  { name: "Cleanliness", value: 58, tone: "warning" },
] as const;

const staticIssues = [
  {
    title: "Wait Time",
    pct: 78,
    impact: "High",
    detail: "Affects NPS by −12 pts",
    action: "Implement reservation system",
    icon: Clock,
  },
  {
    title: "Pricing Perception",
    pct: 58,
    impact: "Medium",
    detail: "Affects retention by 8%",
    action: "Review portion sizes vs pricing",
    icon: DollarSign,
  },
  {
    title: "Inconsistent Food Quality",
    pct: 34,
    impact: "High",
    detail: "Drives 1-star reviews",
    action: "Standardize recipes & training",
    icon: ChefHat,
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

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
      <text
        x="36"
        y="40"
        textAnchor="middle"
        className="font-data fill-foreground text-[13px] font-semibold"
      >
        {value}%
      </text>
    </svg>
  );
}

export default function Overview() {
  const [backendData, setBackendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverviewData().then(data => {
      console.log("Datos de Railway:", data);
      if (data) setBackendData(data);
      setLoading(false);
    });
  }, []);

  const npsValue = backendData?.nps !== undefined ? backendData.nps : 42;
  const npsText = npsValue >= 0 ? `+${npsValue}` : `${npsValue}`;
  const csatValue = backendData?.csat || 4.2;
  const totalReviews = backendData?.total_reviews || 12847;
  const reviewVolumeTrend = backendData?.volume_trend_pct !== undefined ? `${backendData.volume_trend_pct}%` : "+23%";
  const responseRate = backendData?.response_rate || 87;

  const currentSentimentData = backendData?.sentiment_distribution || staticSentimentData;
  const positiveSentimentPct = currentSentimentData.find((s: any) => s.name === "Very Positive" || s.name === "Positive")?.value || 68;
  const currentDrivers = backendData?.drivers || staticDrivers;
  const currentIssues = staticIssues;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Real-time customer intelligence across your restaurant operations."
        actions={
          <button className="pill flex items-center gap-2 border border-white/60 bg-white/60 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-xl shadow-[0_4px_12px_rgba(31,41,55,0.04)] hover:bg-white/80 hover:shadow-[0_6px_16px_rgba(31,41,55,0.06)]">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        }
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
      >
        {/* NPS */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Net Promoter Score</p>
              <p className="mt-2 font-data text-4xl font-bold text-positive glow-text-positive">{npsText}</p>
              <p className="mt-1 text-xs text-muted-foreground">Industry avg: +28</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-positive/15">
              <Activity className="h-4 w-4 text-positive" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <span className="flex items-center gap-1 text-xs font-semibold text-positive">
              <ArrowUpRight className="h-3 w-3" /> +8 pts vs last month
            </span>
            <div className="h-10 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={staticSparkline}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--positive))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* CSAT */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Customer Satisfaction</p>
              <p className="mt-2 font-data text-4xl font-bold text-foreground">
                {csatValue}<span className="text-2xl text-muted-foreground">/5</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Based on {totalReviews.toLocaleString()} reviews</p>
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
            <span className="flex items-center gap-1 text-xs font-semibold text-positive">
              <ArrowUpRight className="h-3 w-3" /> +0.2
            </span>
          </div>
        </motion.div>

        {/* Volume */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Review Volume Trend</p>
              <p className="mt-2 font-data text-4xl font-bold text-warning glow-text-warning">{reviewVolumeTrend}</p>
              <p className="mt-1 text-xs text-muted-foreground">vs previous period</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15">
              <MessageSquare className="h-4 w-4 text-warning" />
            </div>
          </div>
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={staticVolumeTrend}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  fill="url(#vol)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Response */}
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Response Rate</p>
              <p className="mt-2 font-data text-4xl font-bold text-foreground">{responseRate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Reviews responded to</p>
            </div>
            <ProgressRing value={responseRate} />
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Donut */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Sentiment Distribution</h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{totalReviews.toLocaleString()} reviews</span>
          </div>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentSentimentData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {currentSentimentData.map((d: any, i: number) => (
                    <Cell key={i} fill={d.color || "#6EE7B7"} />
                  ))}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-data text-3xl font-bold text-positive glow-text-positive">{positiveSentimentPct}%</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Positive</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {currentSentimentData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color || "#6EE7B7" }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-data text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Drivers */}
        <div className="glass-card p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Top Drivers of Satisfaction</h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Last 30 days</span>
          </div>
          <div className="space-y-4">
            {currentDrivers.map((d: any, i: number) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{d.name}</span>
                  <span className="font-data text-muted-foreground">{d.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      d.tone === "positive" ? "gradient-positive" : "gradient-warning"
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-negative" />
          <h3 className="font-display text-base font-semibold">Critical Improvement Areas</h3>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {currentIssues.map((issue, i) => (
            <motion.div
              key={issue.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-hover relative overflow-hidden p-5"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-negative/60 to-transparent" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-negative/15">
                    <issue.icon className="h-5 w-5 text-negative" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{issue.title}</h4>
                    <p className="font-data text-xs text-negative">{issue.pct}% negative mentions</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    issue.impact === "High"
                      ? "bg-negative/15 text-negative"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {issue.impact}
                </span>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{issue.detail}</p>
              <div className="mt-3 rounded-2xl border border-white/60 bg-white/50 p-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Suggested action
                </p>
                <p className="mt-1 text-sm text-foreground">{issue.action}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

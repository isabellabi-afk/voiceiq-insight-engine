import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MessageSquare,
  Activity,
  AlertTriangle,
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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const sentimentColors = {
  positive: "#6EE7B7",
  negative: "#F9A8D4",
};

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }

  return Number(value).toLocaleString();
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "N/A";
  }

  return `${Math.round(Number(value))}%`;
}

function ProgressRing({ value }: { value: number | null }) {
  const safeValue =
    value === null || Number.isNaN(Number(value))
      ? 0
      : Math.max(0, Math.min(100, Number(value)));

  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (safeValue / 100) * c;

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
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        className="font-data fill-foreground text-[13px] font-semibold"
      >
        {value === null ? "N/A" : `${safeValue}%`}
      </text>
    </svg>
  );
}

export default function Overview() {
  const [backendData, setBackendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverviewData()
      .then((data) => setBackendData(data))
      .catch((error) => {
        console.error("Error loading overview data:", error);
        setBackendData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const nps =
      typeof backendData?.nps === "number" ? backendData.nps : null;

    const csat =
      typeof backendData?.csat === "number" ? backendData.csat : null;

    const totalReviews =
      typeof backendData?.total_reviews === "number"
        ? backendData.total_reviews
        : 0;

    const positivePct =
      typeof backendData?.positive_pct === "number"
        ? backendData.positive_pct
        : null;

    const negativePct =
      positivePct !== null ? Math.max(0, 100 - positivePct) : null;

    const sentimentData =
      positivePct !== null
        ? [
            {
              name: "Positive",
              value: Math.round(positivePct),
              color: sentimentColors.positive,
            },
            {
              name: "Negative / Neutral",
              value: Math.round(negativePct ?? 0),
              color: sentimentColors.negative,
            },
          ]
        : [];

    return {
      nps,
      csat,
      totalReviews,
      positivePct,
      sentimentData,
      volumeTrendPct: backendData?.volume_trend_pct ?? null,
      responseRate: backendData?.response_rate ?? null,
      drivers: Array.isArray(backendData?.drivers) ? backendData.drivers : [],
      issues: Array.isArray(backendData?.issues) ? backendData.issues : [],
      sparkline: Array.isArray(backendData?.sparkline)
        ? backendData.sparkline
        : [],
      volumeTrend: Array.isArray(backendData?.volume_trend)
        ? backendData.volume_trend
        : [],
    };
  }, [backendData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
          Loading overview data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Customer intelligence dashboard connected to the API dataset."
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
        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Net Promoter Score
              </p>
              <p className="mt-2 font-data text-4xl font-bold text-positive glow-text-positive">
                {metrics.nps !== null
                  ? `${metrics.nps >= 0 ? "+" : ""}${metrics.nps}`
                  : "N/A"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on API sentiment data
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-positive/15">
              <Activity className="h-4 w-4 text-positive" />
            </div>
          </div>

          <div className="mt-3 h-10">
            {metrics.sparkline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.sparkline}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--positive))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground">
                No trend data available.
              </p>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Customer Satisfaction
              </p>
              <p className="mt-2 font-data text-4xl font-bold text-foreground">
                {metrics.csat !== null ? metrics.csat : "N/A"}
                <span className="text-2xl text-muted-foreground">/5</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on {formatNumber(metrics.totalReviews)} reviews
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15">
              <Star className="h-4 w-4 text-warning" />
            </div>
          </div>

          <div className="mt-3 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${
                  metrics.csat !== null && s <= Math.round(metrics.csat)
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Review Volume Trend
              </p>
              <p className="mt-2 font-data text-4xl font-bold text-warning glow-text-warning">
                {metrics.volumeTrendPct ?? "N/A"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Awaiting time-series API data
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15">
              <MessageSquare className="h-4 w-4 text-warning" />
            </div>
          </div>

          <div className="mt-3 h-12">
            {metrics.volumeTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.volumeTrend}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground">
                No volume trend available.
              </p>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card-hover p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Positive Sentiment
              </p>
              <p className="mt-2 font-data text-4xl font-bold text-foreground">
                {formatPercent(metrics.positivePct)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                From API sentiment score
              </p>
            </div>
            <ProgressRing value={metrics.positivePct} />
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">
              Sentiment Distribution
            </h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {formatNumber(metrics.totalReviews)} reviews
            </span>
          </div>

          {metrics.sentimentData.length > 0 ? (
            <>
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.sentimentData}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {metrics.sentimentData.map((d: any, i: number) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<GlassTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-data text-3xl font-bold text-positive glow-text-positive">
                    {formatPercent(metrics.positivePct)}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Positive
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {metrics.sentimentData.map((d: any) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-data text-foreground">
                      {d.value}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-center text-sm text-muted-foreground">
              No sentiment distribution available.
            </div>
          )}
        </div>

        <div className="glass-card p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">
              Top Drivers of Satisfaction
            </h3>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Web Intelligence
            </span>
          </div>

          {metrics.drivers.length > 0 ? (
            <div className="space-y-4">
              {metrics.drivers.map((d: any, i: number) => (
                <motion.div
                  key={d.name || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {d.name}
                    </span>
                    <span className="font-data text-muted-foreground">
                      {d.value}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Number(d.value || 0)}%` }}
                      transition={{
                        duration: 0.9,
                        delay: 0.15 + i * 0.08,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full gradient-positive"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-center text-sm text-muted-foreground">
              No satisfaction drivers available yet. This section will populate
              once Web Intelligence returns driver-level insights.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-negative" />
          <h3 className="font-display text-base font-semibold">
            Critical Improvement Areas
          </h3>
        </div>

        {metrics.issues.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {metrics.issues.map((issue: any, i: number) => (
              <motion.div
                key={issue.title || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover relative overflow-hidden p-5"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-negative/60 to-transparent" />
                <h4 className="font-display font-semibold text-foreground">
                  {issue.title}
                </h4>
                {issue.detail && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    {issue.detail}
                  </p>
                )}
                {issue.action && (
                  <div className="mt-3 rounded-2xl border border-white/60 bg-white/50 p-3 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Suggested action
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {issue.action}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">
            No critical improvement areas available yet. This section will
            populate once the Web Intelligence API returns issue-level insights.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
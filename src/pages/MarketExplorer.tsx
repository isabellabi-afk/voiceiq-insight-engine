import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell,
} from "recharts";
import {
  MapPin,
  Trophy,
  Star,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { GlassTooltip } from "@/components/GlassTooltip";
import { getMarketData } from "../apiService";

const CITY = "Austin, TX";

const filters = ["City-wide", "5km Radius", "Top Rated", "Most Reviewed"] as const;
type Filter = (typeof filters)[number];

interface Competitor {
  rank: number;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  isYou?: boolean;
  weakness: string;
}

const staticLeaderboard: Competitor[] = [
  { rank: 1, name: "Olivetto Trattoria", cuisine: "Italian", rating: 4.8, reviews: 2140, weakness: "Long wait times — mentioned in 38% of reviews" },
  { rank: 2, name: "Sage & Stone", cuisine: "Modern American", rating: 4.7, reviews: 1820, weakness: "Limited vegetarian options" },
  { rank: 3, name: "Casa Verde", cuisine: "Mexican", rating: 4.6, reviews: 3210, weakness: "Inconsistent service on weekends" },
  { rank: 4, name: "Your Restaurant", cuisine: "Italian", rating: 4.5, reviews: 1247, isYou: true, weakness: "Price perception — 18% feel overpriced" },
  { rank: 5, name: "Blue Harbor", cuisine: "Seafood", rating: 4.5, reviews: 980, weakness: "Noisy ambiance" },
  { rank: 6, name: "Kura Sushi House", cuisine: "Japanese", rating: 4.4, reviews: 1560, weakness: "Small portions" },
  { rank: 7, name: "The Daily Grind", cuisine: "Cafe", rating: 4.3, reviews: 720, weakness: "Slow morning service" },
  { rank: 8, name: "Pho Saigon", cuisine: "Vietnamese", rating: 4.2, reviews: 1140, weakness: "Limited parking" },
];

const staticLocalAverage = 4.1;

const staticCuisineBubbles = [
  { cuisine: "Italian", x: 2, y: 3, count: 42, satisfaction: 4.4 },
  { cuisine: "Mexican", x: 5, y: 4, count: 68, satisfaction: 4.3 },
  { cuisine: "American", x: 4, y: 6, count: 55, satisfaction: 4.1 },
  { cuisine: "Japanese", x: 7, y: 5, count: 28, satisfaction: 4.5 },
  { cuisine: "Seafood", x: 8, y: 3, count: 18, satisfaction: 4.2 },
  { cuisine: "Cafe", x: 3, y: 7, count: 74, satisfaction: 4.0 },
  { cuisine: "Vietnamese", x: 6, y: 7, count: 22, satisfaction: 4.3 },
  { cuisine: "BBQ", x: 9, y: 6, count: 35, satisfaction: 4.6 },
];

const staticRadarData = [
  { dim: "Food", you: 92, city: 78 },
  { dim: "Service", you: 88, city: 72 },
  { dim: "Price", you: 64, city: 74 },
  { dim: "Ambiance", you: 81, city: 70 },
  { dim: "Speed", you: 70, city: 75 },
];

function bubbleColor(satisfaction: number) {
  if (satisfaction >= 4.5) return "hsl(var(--positive))";
  if (satisfaction >= 4.2) return "hsl(var(--insight))";
  if (satisfaction >= 4.0) return "hsl(var(--warning))";
  return "hsl(var(--negative))";
}

export default function MarketExplorer() {
  const [filter, setFilter] = useState<Filter>("City-wide");
  const [selected, setSelected] = useState<Competitor | null>(null);

  // 👇 NUEVO: Estados dinámicos conectados a tu servicio de Railway
  const [leaderboard, setLeaderboard] = useState<Competitor[]>([...staticLeaderboard]);
  const [localAverage, setLocalAverage] = useState<number>(staticLocalAverage);
  const [cuisineBubbles, setCuisineBubbles] = useState<any[]>([...staticCuisineBubbles]);
  const [radarData, setRadarData] = useState<any[]>([...staticRadarData]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getMarketData().then((data) => {
      if (data) {
        if (data.leaderboard) setLeaderboard(data.leaderboard);
        if (data.localAverage) setLocalAverage(data.localAverage);
        if (data.cuisineBubbles) setCuisineBubbles(data.cuisineBubbles);
        if (data.radarData) setRadarData(data.radarData);
      }
      setLoading(false);
    });
  }, []);

  const yourEntry = useMemo(() => {
    return leaderboard.find((c) => c.isYou) || leaderboard[3] || staticLeaderboard[3];
  }, [leaderboard]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading Re-check Market Matrix...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Local Market Intelligence"
        title="Market Explorer"
        subtitle={`See how you stack up against restaurants in ${CITY} — leaderboards, cuisine density, and head-to-head sentiment.`}
      />

      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
                active
                  ? "pill-active text-foreground"
                  : "border-white/60 bg-white/40 text-muted-foreground hover:bg-white/60 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
          <span>{CITY}</span>
        </div>
      </div>

      {/* Top KPI strip */}
      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Your Rank</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-data text-4xl font-semibold text-foreground">#{yourEntry.rank}</span>
            <span className="text-sm text-muted-foreground">of {leaderboard.length * 6}</span>
          </div>
          <p className="mt-2 text-xs text-positive">Top 8% in {CITY}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="glass-card p-6"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Your Rating</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-data text-4xl font-semibold text-foreground">{yourEntry.rating}</span>
            <Star className="h-4 w-4 fill-warning text-warning" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Local avg: <span className="font-data text-foreground">{localAverage}</span> · +{(yourEntry.rating - localAverage).toFixed(1)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="glass-card p-6"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Reviews</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-data text-4xl font-semibold text-foreground">{yourEntry.reviews.toLocaleString()}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">+12% vs local median</p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 lg:col-span-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-medium text-foreground">Around You</h3>
              <p className="mt-1 text-xs text-muted-foreground">Top-rated restaurants in {CITY}</p>
            </div>
            <Trophy className="h-4 w-4 text-warning" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            {leaderboard.map((c, i) => (
              <motion.button
                key={c.name}
                onClick={() => setSelected(c)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className={`flex w-full items-center gap-3 rounded-full border px-4 py-3 text-left transition-all duration-300 ${
                  c.isYou
                    ? "border-primary/40 bg-primary/10 hover:bg-primary/15"
                    : "border-white/60 bg-white/40 hover:bg-white/60"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-data text-xs font-semibold ${
                    c.isYou ? "bg-primary text-primary-foreground" : "bg-white/70 text-muted-foreground"
                  }`}
                >
                  {c.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {c.name} {c.isYou && <span className="ml-1 text-[10px] font-semibold text-primary">YOU</span>}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{c.cuisine} · {c.reviews.toLocaleString()} reviews</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="font-data text-sm text-foreground">{c.rating}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="glass-card p-6 lg:col-span-7"
        >
          <div className="mb-5">
            <h3 className="font-display text-lg font-medium text-foreground">Sentiment Radar</h3>
            <p className="mt-1 text-xs text-muted-foreground">Your sentiment vs the {CITY} average</p>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dim" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Radar
                  name="City Avg"
                  dataKey="city"
                  stroke="hsl(var(--insight))"
                  fill="hsl(var(--insight))"
                  fillOpacity={0.18}
                  strokeWidth={1.5}
                />
                <Radar
                  name="You"
                  dataKey="you"
                  stroke="hsl(var(--positive))"
                  fill="hsl(var(--positive))"
                  fillOpacity={0.32}
                  strokeWidth={2}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<GlassTooltip formatter={(v) => `${v}/100`} />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cuisine bubbles */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="glass-card p-6 lg:col-span-7"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-medium text-foreground">Cuisine Density</h3>
              <p className="mt-1 text-xs text-muted-foreground">Bubble size = number of restaurants · color = avg satisfaction</p>
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 12, right: 12, bottom: 12, left: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 4" />
                <XAxis type="number" dataKey="x" hide domain={[0, 10]} />
                <YAxis type="number" dataKey="y" hide domain={[0, 10]} />
                <ZAxis type="number" dataKey="count" range={[400, 3200]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="glass-tooltip">
                        <p className="text-sm font-semibold text-foreground">{d.cuisine}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {d.count} restaurants · <span className="font-data text-foreground">{d.satisfaction}</span> ★
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter data={cuisineBubbles} shape="circle">
                  {cuisineBubbles.map((b, i) => (
                    <Cell key={i} fill={bubbleColor(b.satisfaction)} fillOpacity={0.55} stroke={bubbleColor(b.satisfaction)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {cuisineBubbles.map((b) => (
              <div
                key={b.cuisine}
                className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/40 px-3 py-1 text-[11px] text-muted-foreground"
              >
                <span className="h-2 w-2 rounded-full" style={{ background: bubbleColor(b.satisfaction) }} />
                <span className="text-foreground">{b.cuisine}</span>
                <span className="font-data">{b.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          className="glass-card p-6 lg:col-span-5"
        >
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h3 className="font-display text-lg font-medium text-foreground">Neighborhood Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-positive/30 bg-positive/10 p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-positive" strokeWidth={1.75} />
                <p className="text-sm leading-relaxed text-foreground">
                  In <span className="font-medium

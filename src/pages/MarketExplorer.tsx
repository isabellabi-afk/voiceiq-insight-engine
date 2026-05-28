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
  Cell,
} from "recharts";
import { MapPin, Trophy, Star, Sparkles, TrendingUp, X } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getMarketData, getSentimentRadar } from "../apiService";

const filters = ["City-wide", "Top Rated", "Most Reviewed"] as const;
type Filter = (typeof filters)[number];

interface Competitor {
  rank: number;
  name: string;
  cuisine?: string;
  rating: number | null;
  reviews: number;
  city?: string;
  state?: string;
}

function bubbleColor(satisfaction: number) {
  if (satisfaction >= 4.5) return "hsl(var(--positive))";
  if (satisfaction >= 4.2) return "hsl(var(--insight))";
  if (satisfaction >= 4.0) return "hsl(var(--warning))";
  return "hsl(var(--negative))";
}

function getCuisineFromCategories(categories?: string) {
  if (!categories) return "Uncategorized";
  return categories.split(",")[0]?.trim() || "Uncategorized";
}

const factorTranslations: Record<string, string> = {
  otros: "Others", servicio: "Service", comida: "Food", ambiente: "Atmosphere",
};
const translateFactor = (f: string) =>
  factorTranslations[f.toLowerCase()] || f.charAt(0).toUpperCase() + f.slice(1);

export default function MarketExplorer() {
  const [filter, setFilter] = useState<Filter>("City-wide");
  const [selected, setSelected] = useState<Competitor | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getMarketData()
      .then((data) => setRestaurants(Array.isArray(data) ? data : []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
    getSentimentRadar()
      .then((d) => setRadarData((d?.radar ?? []).map((r: any) => ({
        factor: translateFactor(r.factor),
        sentiment: r.sentiment,
        mentions: r.mentions,
      })))
      ).catch(() => setRadarData([]));
  }, []);

  const market = useMemo(() => {
    const normalized: Competitor[] = restaurants.map((r: any, i) => {
      const rating = Number(r.stars ?? r.rating ?? r.avg_stars ?? r.review_stars ?? 0);
      const reviews = Number(r.review_count ?? r.reviews ?? r.total_reviews ?? 0);
      return {
        rank: i + 1,
        name: r.name ?? r.business_name ?? "Unknown",
        cuisine: r.city || "Unknown",
        rating: Number.isFinite(rating) && rating > 0 ? rating : null,
        reviews: Number.isFinite(reviews) ? reviews : 0,
        city: r.city, state: r.state,
      };
    }).filter((r) => r.name !== "Unknown");

    const sorted = filter === "Most Reviewed"
      ? [...normalized].sort((a, b) => b.reviews - a.reviews)
      : [...normalized].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    const leaderboard = sorted.slice(0, 8).map((r, i) => ({ ...r, rank: i + 1 }));
    const ratings = normalized.map((r) => r.rating).filter((r): r is number => typeof r === "number");
    const localAverage = ratings.length > 0
      ? Number((ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)) : null;
    const location = normalized.find((r) => r.city)?.city ?? "API dataset";

    const cuisineMap = normalized.reduce((acc: Record<string, any>, r) => {
      const c = r.cuisine || "Uncategorized";
      if (!acc[c]) acc[c] = { cuisine: c, count: 0, ratingSum: 0 };
      acc[c].count += 1; acc[c].ratingSum += r.rating ?? 0;
      return acc;
    }, {});

    const cuisineBubbles = Object.values(cuisineMap).map((item: any, i) => ({
      city: item.cuisine, x: (i % 5) + 1, y: Math.floor(i / 5) + 1,
      count: item.count,
      satisfaction: item.count > 0 ? Number((item.ratingSum / item.count).toFixed(1)) : 0,
    })).filter((b) => b.count > 0);

    return { leaderboard, localAverage, cuisineBubbles, location, totalRestaurants: normalized.length };
  }, [restaurants, filter]);

  const insights = useMemo(() => {
    if (radarData.length === 0) return [];
    const top = [...radarData].sort((a, b) => b.sentiment - a.sentiment)[0];
    const bottom = [...radarData].sort((a, b) => a.sentiment - b.sentiment)[0];
    return [
      `${top?.factor} is your strongest area with ${top?.sentiment}% positive sentiment.`,
      `${bottom?.factor} needs attention — only ${bottom?.sentiment}% positive sentiment.`,
      `${radarData.length} factors analyzed across ${radarData.reduce((s, r) => s + r.mentions, 0).toLocaleString()} mentions.`,
    ];
  }, [radarData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading market data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader eyebrow="Local Market Intelligence" title="Market Explorer"
        subtitle={`Explore market-level restaurant data from ${market.location}.`} />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
              filter === f ? "pill-active text-foreground" : "border-white/60 bg-white/40 text-muted-foreground hover:bg-white/60"
            }`}>{f}</button>
        ))}
        <div className="ml-auto flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
          <span>{market.location}</span>
        </div>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-3">
        {[
          { label: "Restaurants", value: market.totalRestaurants.toLocaleString(), sub: "From API dataset" },
          { label: "Average Rating", value: market.localAverage ?? "N/A", sub: "Calculated from restaurant records", star: true },
          { label: "Top Restaurant", value: market.leaderboard[0]?.name ?? "N/A", sub: market.leaderboard[0]?.rating ? `${market.leaderboard[0].rating} ★` : "" },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="glass-card p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{card.label}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-data text-4xl font-semibold text-foreground truncate">{card.value}</span>
              {card.star && market.localAverage !== null && <Star className="h-4 w-4 fill-warning text-warning" />}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }} className="glass-card p-6 lg:col-span-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-medium">Market Leaderboard</h3>
              <p className="mt-1 text-xs text-muted-foreground">Restaurants ranked by selected filter</p>
            </div>
            <Trophy className="h-4 w-4 text-warning" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            {market.leaderboard.map((r, i) => (
              <motion.button key={`${r.name}-${i}`} onClick={() => setSelected(r)}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className="flex w-full items-center gap-3 rounded-full border border-white/60 bg-white/40 px-4 py-3 text-left hover:bg-white/60">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 font-data text-xs font-semibold text-muted-foreground">{r.rank}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{r.cuisine} · {r.reviews.toLocaleString()} reviews</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="font-data text-sm">{r.rating ?? "N/A"}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }} className="glass-card p-6 lg:col-span-7">
          <div className="mb-5">
            <h3 className="font-display text-lg font-medium">Sentiment Radar</h3>
            <p className="mt-1 text-xs text-muted-foreground">Sentiment score by factor from Web Intelligence</p>
          </div>
          {radarData.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Sentiment" dataKey="sentiment" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">No radar data available.</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }} className="glass-card p-6 lg:col-span-7">
          <div className="mb-5">
            <h3 className="font-display text-lg font-medium">Cuisine Density</h3>
            <p className="mt-1 text-xs text-muted-foreground">Bubble size = number of restaurants · color = average rating by city</p>
          </div>
          {market.cuisineBubbles.length > 0 ? (
            <>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 12, right: 12, bottom: 12, left: 0 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 4" />
                    <XAxis type="number" dataKey="x" hide domain={[0, 10]} />
                    <YAxis type="number" dataKey="y" hide domain={[0, 10]} />
                    <ZAxis type="number" dataKey="count" range={[400, 3200]} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="glass-tooltip">
                          <p className="text-sm font-semibold">{d.cuisine}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{d.count} restaurants · <span className="font-data">{d.satisfaction}</span> ★</p>
                        </div>
                      );
                    }} />
                    <Scatter data={market.cuisineBubbles} shape="circle">
                      {market.cuisineBubbles.map((b, i) => (
                        <Cell key={i} fill={bubbleColor(b.satisfaction)} fillOpacity={0.55} stroke={bubbleColor(b.satisfaction)} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {market.cuisineBubbles.map((b) => (
                  <div key={b.cuisine} className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/40 px-3 py-1 text-[11px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: bubbleColor(b.satisfaction) }} />
                    <span className="text-foreground">{b.cuisine}</span>
                    <span className="font-data">{b.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[340px] items-center justify-center text-sm text-muted-foreground">No cuisine data available.</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }} className="glass-card p-6 lg:col-span-5">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h3 className="font-display text-lg font-medium">Neighborhood Insights</h3>
          </div>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="rounded-3xl border border-white/60 bg-white/40 p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                    <p className="text-sm leading-relaxed text-foreground">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/60 bg-white/40 p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                <p className="text-sm leading-relaxed text-foreground">Insights will appear here once the Web Intelligence layer provides market comparison data.</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div className="glass-card w-full max-w-md p-6"
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }} onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.cuisine ?? "Uncategorized"}</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-full p-2 text-muted-foreground hover:bg-white/60">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/60 bg-white/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rating</p>
                  <p className="mt-1 font-data text-2xl font-semibold">{selected.rating ?? "N/A"}</p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reviews</p>
                  <p className="mt-1 font-data text-2xl font-semibold">{selected.reviews.toLocaleString()}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Detailed competitive insights require Web Intelligence data.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

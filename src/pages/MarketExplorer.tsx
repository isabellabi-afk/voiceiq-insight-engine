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
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { GlassTooltip } from "@/components/GlassTooltip";
import { getMarketData } from "../apiService";

const filters = ["City-wide", "Top Rated", "Most Reviewed"] as const;
type Filter = (typeof filters)[number];

interface Competitor {
  rank: number;
  name: string;
  cuisine?: string;
  rating: number | null;
  reviews: number;
  isYou?: boolean;
  weakness?: string;
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

export default function MarketExplorer() {
  const [filter, setFilter] = useState<Filter>("City-wide");
  const [selected, setSelected] = useState<Competitor | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getMarketData()
      .then((data) => {
        setRestaurants(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error loading market data:", error);
        setRestaurants([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const market = useMemo(() => {
    const normalized: Competitor[] = restaurants
      .map((restaurant: any, index: number) => {
        const rating = Number(
          restaurant.stars ??
            restaurant.rating ??
            restaurant.avg_stars ??
            restaurant.review_stars ??
            0
        );

        const reviews = Number(
          restaurant.review_count ??
            restaurant.reviews ??
            restaurant.total_reviews ??
            0
        );

        return {
          rank: index + 1,
          name:
            restaurant.name ??
            restaurant.business_name ??
            restaurant.restaurant_name ??
            "Unknown restaurant",
          cuisine: getCuisineFromCategories(restaurant.categories),
          rating: Number.isFinite(rating) && rating > 0 ? rating : null,
          reviews: Number.isFinite(reviews) ? reviews : 0,
          city: restaurant.city,
          state: restaurant.state,
        };
      })
      .filter((restaurant) => restaurant.name !== "Unknown restaurant");

    const sorted =
      filter === "Most Reviewed"
        ? [...normalized].sort((a, b) => b.reviews - a.reviews)
        : [...normalized].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    const leaderboard = sorted.slice(0, 8).map((restaurant, index) => ({
      ...restaurant,
      rank: index + 1,
    }));

    const ratings = normalized
      .map((restaurant) => restaurant.rating)
      .filter((rating): rating is number => typeof rating === "number");

    const localAverage =
      ratings.length > 0
        ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1))
        : null;

    const location =
      normalized.find((restaurant) => restaurant.city)?.city ??
      "API dataset";

    const cuisineMap = normalized.reduce(
      (
        acc: Record<string, { cuisine: string; count: number; ratingSum: number }>,
        restaurant
      ) => {
        const cuisine = restaurant.cuisine || "Uncategorized";

        if (!acc[cuisine]) {
          acc[cuisine] = {
            cuisine,
            count: 0,
            ratingSum: 0,
          };
        }

        acc[cuisine].count += 1;
        acc[cuisine].ratingSum += restaurant.rating ?? 0;

        return acc;
      },
      {}
    );

    const cuisineBubbles = Object.values(cuisineMap)
      .map((item, index) => ({
        cuisine: item.cuisine,
        x: (index % 5) + 1,
        y: Math.floor(index / 5) + 1,
        count: item.count,
        satisfaction:
          item.count > 0
            ? Number((item.ratingSum / item.count).toFixed(1))
            : 0,
      }))
      .filter((item) => item.count > 0);

    return {
      leaderboard,
      localAverage,
      cuisineBubbles,
      location,
      totalRestaurants: normalized.length,
    };
  }, [restaurants, filter]);

  const yourEntry = market.leaderboard[0] ?? null;

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
      <PageHeader
        eyebrow="Local Market Intelligence"
        title="Market Explorer"
        subtitle={`Explore market-level restaurant data from ${market.location}.`}
      />

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
          <span>{market.location}</span>
        </div>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Restaurants
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-data text-4xl font-semibold text-foreground">
              {market.totalRestaurants.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            From API dataset
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="glass-card p-6"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Average Rating
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-data text-4xl font-semibold text-foreground">
              {market.localAverage ?? "N/A"}
            </span>
            {market.localAverage !== null && (
              <Star className="h-4 w-4 fill-warning text-warning" />
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Calculated from restaurant records
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="glass-card p-6"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Top Restaurant
          </p>
          <div className="mt-3">
            <span className="block truncate font-display text-xl font-semibold text-foreground">
              {yourEntry?.name ?? "N/A"}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {yourEntry?.rating ? `${yourEntry.rating} ★` : "No rating available"}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 lg:col-span-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-medium text-foreground">
                Market Leaderboard
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Restaurants ranked by selected filter
              </p>
            </div>
            <Trophy className="h-4 w-4 text-warning" strokeWidth={1.5} />
          </div>

          {market.leaderboard.length > 0 ? (
            <div className="space-y-2">
              {market.leaderboard.map((restaurant, i) => (
                <motion.button
                  key={`${restaurant.name}-${i}`}
                  onClick={() => setSelected(restaurant)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className="flex w-full items-center gap-3 rounded-full border border-white/60 bg-white/40 px-4 py-3 text-left transition-all duration-300 hover:bg-white/60"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 font-data text-xs font-semibold text-muted-foreground">
                    {restaurant.rank}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {restaurant.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {restaurant.cuisine} · {restaurant.reviews.toLocaleString()} reviews
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    <span className="font-data text-sm text-foreground">
                      {restaurant.rating ?? "N/A"}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No market data available.
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="glass-card p-6 lg:col-span-7"
        >
          <div className="mb-5">
            <h3 className="font-display text-lg font-medium text-foreground">
              Sentiment Radar
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting Web Intelligence factor data
            </p>
          </div>

          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
            No radar data available from the API.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="glass-card p-6 lg:col-span-7"
        >
          <div className="mb-5">
            <h3 className="font-display text-lg font-medium text-foreground">
              Cuisine Density
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Bubble size = number of restaurants · color = average satisfaction
            </p>
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
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;

                        return (
                          <div className="glass-tooltip">
                            <p className="text-sm font-semibold text-foreground">
                              {d.cuisine}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {d.count} restaurants ·{" "}
                              <span className="font-data text-foreground">
                                {d.satisfaction}
                              </span>{" "}
                              ★
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Scatter data={market.cuisineBubbles} shape="circle">
                      {market.cuisineBubbles.map((bubble, i) => (
                        <Cell
                          key={i}
                          fill={bubbleColor(bubble.satisfaction)}
                          fillOpacity={0.55}
                          stroke={bubbleColor(bubble.satisfaction)}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {market.cuisineBubbles.map((bubble) => (
                  <div
                    key={bubble.cuisine}
                    className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/40 px-3 py-1 text-[11px] text-muted-foreground"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: bubbleColor(bubble.satisfaction) }}
                    />
                    <span className="text-foreground">{bubble.cuisine}</span>
                    <span className="font-data">{bubble.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[340px] items-center justify-center text-sm text-muted-foreground">
              No cuisine data available.
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          className="glass-card p-6 lg:col-span-5"
        >
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h3 className="font-display text-lg font-medium text-foreground">
              Neighborhood Insights
            </h3>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/40 p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              <p className="text-sm leading-relaxed text-foreground">
                Insights will appear here once the Web Intelligence layer provides market comparison data.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass-card w-full max-w-md p-6"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {selected.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selected.cuisine ?? "Uncategorized"}
                  </p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-white/60 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/60 bg-white/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Rating
                  </p>
                  <p className="mt-1 font-data text-2xl font-semibold text-foreground">
                    {selected.rating ?? "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/60 bg-white/40 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Reviews
                  </p>
                  <p className="mt-1 font-data text-2xl font-semibold text-foreground">
                    {selected.reviews.toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Detailed competitive insights require Web Intelligence data.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
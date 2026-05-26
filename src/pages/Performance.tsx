import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Activity,
  TrendingUp,
  Users,
  Building2,
  Loader2,
} from "lucide-react";
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
import {
  getOverviewData,
  getRestaurantKPIs,
  getPerformanceReviews,
} from "../apiService";

export default function Performance() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");
  const [globalData, setGlobalData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewsSeries, setReviewsSeries] = useState<any[]>([]);

  useEffect(() => {
    const checkActiveSession = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";
      setActiveRestaurant(saved);
    };

    checkActiveSession();
    window.addEventListener("storage", checkActiveSession);
    window.addEventListener("restaurantChanged", checkActiveSession);

    return () => {
      window.removeEventListener("storage", checkActiveSession);
      window.removeEventListener("restaurantChanged", checkActiveSession);
    };
  }, []);

  useEffect(() => {
    async function fetchPerformanceData() {
      setLoading(true);

      try {
        const [overview, resKPIs, reviews] = await Promise.all([
          getOverviewData(),
          activeRestaurant === "all"
            ? Promise.resolve(null)
            : getRestaurantKPIs(activeRestaurant),
          getPerformanceReviews(activeRestaurant),
        ]);

        setGlobalData(overview || null);
        setRestaurantData(resKPIs || null);
        setReviewsSeries(Array.isArray(reviews) ? reviews : []);
      } catch (err) {
        console.error("Error loading performance data:", err);
        setGlobalData(null);
        setRestaurantData(null);
        setReviewsSeries([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPerformanceData();
  }, [activeRestaurant]);

  const dynamicMetrics = useMemo(() => {
    const isGlobal = activeRestaurant === "all";
    const currentSource = isGlobal
      ? globalData
      : restaurantData?.metrics || restaurantData;

    const avgStars = Number(
      currentSource?.avg_stars ??
        currentSource?.avg_rating ??
        currentSource?.rating ??
        0
    );

    const avgRating = Number.isFinite(avgStars)
      ? Number(avgStars.toFixed(1))
      : 0;

    const reviewsCollected = Number(
      currentSource?.total_reviews ??
        currentSource?.reviews_count ??
        currentSource?.review_count ??
        reviewsSeries.length ??
        0
    );

    const positiveReviews = Number(
      currentSource?.positive_reviews ??
        currentSource?.positive_count ??
        reviewsSeries.filter((review: any) => {
          const stars = Number(
            review.review_stars ?? review.stars ?? review.rating ?? 0
          );
          return stars >= 4;
        }).length
    );

    const safeReviewsCollected = Number.isFinite(reviewsCollected)
      ? reviewsCollected
      : 0;

    const safePositiveReviews = Number.isFinite(positiveReviews)
      ? positiveReviews
      : 0;

    const negativeReviews = Math.max(
      0,
      safeReviewsCollected - safePositiveReviews
    );

    const confidenceRate =
      safeReviewsCollected > 0
        ? `${Math.round((safePositiveReviews / safeReviewsCollected) * 100)}%`
        : "N/A";

    const growthValue = Number(
      currentSource?.growth_percentage ??
        currentSource?.review_growth_percentage ??
        currentSource?.growth ??
        NaN
    );

    const growthTrendPct = Number.isFinite(growthValue)
      ? `${growthValue >= 0 ? "+" : ""}${growthValue}%`
      : "N/A";

    const monthlyBuckets = reviewsSeries.reduce(
      (
        acc: Record<string, { total: number; ratingSum: number; sortDate: Date }>,
        review: any
      ) => {
        const rawDate =
          review.date ??
          review.review_date ??
          review.created_at ??
          review.createdAt;

        if (!rawDate) return acc;

        const parsedDate = new Date(rawDate);
        if (Number.isNaN(parsedDate.getTime())) return acc;

        const key = parsedDate.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });

        const rating = Number(
          review.review_stars ?? review.stars ?? review.rating ?? 0
        );

        if (!acc[key]) {
          acc[key] = {
            total: 0,
            ratingSum: 0,
            sortDate: parsedDate,
          };
        }

        acc[key].total += 1;
        acc[key].ratingSum += Number.isFinite(rating) ? rating : 0;

        if (parsedDate < acc[key].sortDate) {
          acc[key].sortDate = parsedDate;
        }

        return acc;
      },
      {}
    );

    const trendData = Object.entries(monthlyBuckets)
      .sort(([, a], [, b]) => a.sortDate.getTime() - b.sortDate.getTime())
      .map(([m, values]) => ({
        m,
        rating:
          values.total > 0
            ? Number((values.ratingSum / values.total).toFixed(2))
            : 0,
        reviews: values.total,
      }))
      .slice(-6);

    const channelData = [
      { ch: "Positive NLP", volume: safePositiveReviews },
      { ch: "Negative / Neutral NLP", volume: negativeReviews },
    ].sort((a, b) => b.volume - a.volume);

    return {
      avgRating,
      reviewsCollected: safeReviewsCollected,
      confidenceRate,
      mentionsGrowth: growthTrendPct,
      trendData,
      channelData,
    };
  }, [activeRestaurant, globalData, restaurantData, reviewsSeries]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading performance data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-foreground/[0.04] bg-white/40 p-4 shadow-2xs backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Building2 className="h-4 w-4" />
          </div>

          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Performance data
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              {activeRestaurant === "all"
                ? "All restaurants"
                : `Restaurant: ${activeRestaurant}`}
            </h3>
          </div>
        </div>

        <div className="hidden text-right sm:block">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            API connected
          </span>
        </div>
      </div>

      <PageHeader
        eyebrow="Operations"
        title="Performance Metrics"
        subtitle="Track chronological rating trajectories, aggregate review volumes, and NLP channel distributions over time."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Avg rating (Lifetime)",
            value: `${dynamicMetrics.avgRating} ★`,
            icon: Activity,
          },
          {
            label: "Reviews collected",
            value: dynamicMetrics.reviewsCollected.toLocaleString(),
            icon: BarChart3,
          },
          {
            label: "Positive review rate",
            value: dynamicMetrics.confidenceRate,
            icon: Users,
          },
          {
            label: "Review volume growth",
            value: dynamicMetrics.mentionsGrowth,
            icon: TrendingUp,
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-5 transition-all hover:shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {k.label}
                </p>
                <p className="mt-2 font-data text-3xl font-bold text-foreground">
                  {k.value}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <k.icon className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-foreground">
              Rating & Quality Trajectory
            </h3>
            <p className="text-xs text-muted-foreground">
              Monthly average based on dated reviews returned by the API
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dynamicMetrics.trendData}
                margin={{ left: -20, right: 10 }}
              >
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="m"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  domain={[0, 5]}
                  tickLine={false}
                />
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
                  name="Avg rating"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 1 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-foreground">
              Reviews by Semantic Classification
            </h3>
            <p className="text-xs text-muted-foreground">
              Volume breakdown based on review sentiment returned by the API
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dynamicMetrics.channelData}
                layout="vertical"
                margin={{ left: -10, right: 10 }}
              >
                <CartesianGrid
                  stroke="hsl(var(--border))"
                  strokeDasharray="3 4"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  dataKey="ch"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  width={120}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="volume"
                  name="Review volume"
                  fill="hsl(var(--primary))"
                  opacity={0.85}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Activity, TrendingUp, Users } from "lucide-react";
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
import { getOverviewData, getReviews } from "../apiService";

export default function Performance() {
  const [overview, setOverview] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverviewData(), getReviews()])
      .then(([overviewData, reviewsData]) => {
        setOverview(overviewData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      })
      .catch((error) => {
        console.error("Error loading performance data:", error);
        setOverview(null);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const totalReviews = overview?.total_reviews ?? reviews.length;
    const avgRating = overview?.csat ?? null;
    const positivePct =
      typeof overview?.positive_pct === "number"
        ? Math.round(overview.positive_pct)
        : null;

    const monthlyMap = reviews.reduce(
      (acc: Record<string, { label: string; sort: number; total: number; ratingSum: number }>, review) => {
        const rawDate = review.date;
        if (!rawDate) return acc;

        const date = new Date(rawDate);
        if (Number.isNaN(date.getTime())) return acc;

        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const label = date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });

        const rating = Number(review.review_stars ?? 0);

        if (!acc[key]) {
          acc[key] = {
            label,
            sort: date.getTime(),
            total: 0,
            ratingSum: 0,
          };
        }

        acc[key].total += 1;
        acc[key].ratingSum += Number.isFinite(rating) ? rating : 0;

        return acc;
      },
      {}
    );

    const trend = Object.values(monthlyMap)
      .sort((a, b) => a.sort - b.sort)
      .slice(-12)
      .map((item) => ({
        m: item.label,
        rating:
          item.total > 0
            ? Number((item.ratingSum / item.total).toFixed(2))
            : 0,
        reviews: item.total,
      }));

    const positiveReviews = reviews.filter(
      (review) =>
        review.sentiment_binary?.toLowerCase() === "positive" ||
        Number(review.review_stars ?? 0) >= 4
    ).length;

    const negativeReviews = reviews.filter(
      (review) =>
        review.sentiment_binary?.toLowerCase() === "negative" ||
        Number(review.review_stars ?? 0) <= 2
    ).length;

    const neutralReviews = Math.max(
      0,
      reviews.length - positiveReviews - negativeReviews
    );

    const channels = [
      { ch: "Positive", volume: positiveReviews },
      { ch: "Neutral", volume: neutralReviews },
      { ch: "Negative", volume: negativeReviews },
    ].filter((item) => item.volume > 0);

    return {
      avgRating,
      totalReviews,
      positivePct,
      trend,
      channels,
    };
  }, [overview, reviews]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
          Loading performance data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Operations"
        title="Performance Metrics"
        subtitle="Track ratings, review volume, and sentiment performance over time."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Avg rating",
            value: metrics.avgRating !== null ? `${metrics.avgRating} ★` : "N/A",
            icon: Activity,
          },
          {
            label: "Reviews collected",
            value: metrics.totalReviews.toLocaleString(),
            icon: BarChart3,
          },
          {
            label: "Positive sentiment",
            value: metrics.positivePct !== null ? `${metrics.positivePct}%` : "N/A",
            icon: Users,
          },
          {
            label: "Mentions growth",
            value: overview?.volume_trend_pct ?? "N/A",
            icon: TrendingUp,
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card-hover p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="mt-2 font-data text-3xl font-bold text-foreground">
                  {k.value}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                <k.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-base font-semibold">
            Rating & Review Volume
          </h3>

          {metrics.trend.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.trend}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 5]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="rating" stroke="hsl(var(--positive))" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
              No trend data available.
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="mb-4 font-display text-base font-semibold">
            Reviews by Sentiment
          </h3>

          {metrics.channels.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.channels} layout="vertical">
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="ch" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
              No sentiment data available.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
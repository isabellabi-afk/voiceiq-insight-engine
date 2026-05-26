import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Activity, TrendingUp, Users, Building2, Loader2 } from "lucide-react";
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
import { getOverviewData, getRestaurantKPIs, getPerformanceReviews } from "../apiService";

export default function Performance() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");
  const [globalData, setGlobalData] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewsSeries, setReviewsSeries] = useState<any[]>([]);

  // 1. Escuchar de manera reactiva la sesión del restaurante global
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

  // 2. Carga de datos reales desde la API
  useEffect(() => {
    async function fetchPerformanceData() {
      setLoading(true);
      try {
        const [overview, resKPIs, reviews] = await Promise.all([
          getOverviewData(),
          activeRestaurant === "all" ? Promise.resolve(null) : getRestaurantKPIs(activeRestaurant),
          getPerformanceReviews(activeRestaurant),
        ]);

        if (overview) setGlobalData(overview);
        setRestaurantData(resKPIs);
        setReviewsSeries(reviews);
      } catch (err) {
        console.error("Error loading performance data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPerformanceData();
  }, [activeRestaurant]);

  // 3. CAPA ANALÍTICA: Mapeo exacto sin algoritmos hash ficticios
  const dynamicMetrics = useMemo(() => {
    const isGlobal = activeRestaurant === "all";
    const currentSource = isGlobal ? globalData : (restaurantData?.metrics || restaurantData);

    // Extracción de primitivos numéricos reales
    const avgRating = currentSource?.avg_stars ? Number(currentSource.avg_stars.toFixed(1)) : 0.0;
    const reviewsCollected = currentSource?.total_reviews || currentSource?.reviews_count || 0;
    
    const positiveReviews = currentSource?.positive_reviews || currentSource?.positive_count || 0;
    const negativeReviews = Math.max(0, reviewsCollected - positiveReviews);

    const confidenceRate = reviewsCollected > 0 ? `${Math.round((positiveReviews / reviewsCollected) * 100)}%` : "N/A";
    const growthTrendPct = currentSource?.growth_percentage !== undefined 
      ? `${currentSource.growth_percentage >= 0 ? "+" : ""}${currentSource.growth_percentage}%` 
      : "N/A";

    const monthlyBuckets = reviewsSeries.reduce((acc: Record<string, { total: number; ratingSum: number }>, review: any) => {
      if (!review.date) return acc;
      const parsedDate = new Date(review.date);
      if (Number.isNaN(parsedDate.getTime())) return acc;
      const key = parsedDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const rating = Number(review.review_stars || review.stars || review.rating || 0);
      acc[key] = acc[key] || { total: 0, ratingSum: 0 };
      acc[key].total += 1;
      acc[key].ratingSum += rating;
      return acc;
    }, {});

    const trendData = Object.entries(monthlyBuckets)
      .map(([m, values]) => ({
        m,
        rating: values.total > 0 ? Number((values.ratingSum / values.total).toFixed(2)) : 0,
        reviews: values.total,
      }))
      .slice(-6);

    // Segmentación volumétrica basada en la clasificación de sentimiento devuelta por la API
    const channelData = [
      { ch: "Positive NLP", volume: positiveReviews },
      { ch: "Negative NLP", volume: negativeReviews },
    ].sort((a, b) => b.volume - a.volume);

    return {
      avgRating,
      reviewsCollected,
      repeatVisitRate: confidenceRate,
      mentionsGrowth: growthTrendPct,
      trendData,
      channelData
    };
  }, [activeRestaurant, globalData, restaurantData, reviewsSeries]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center text-sm text-muted-foreground gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading performance data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* MONITOR CONTEXTUAL DE MÉTRICAS */}
      <div className="mb-4 flex items-center justify-between bg-white/40 border border-foreground/[0.04] p-4 rounded-2xl backdrop-blur-sm shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Performance data</span>
            <h3 className="text-sm font-semibold text-foreground">
              {activeRestaurant === "all" 
                ? "All restaurants" 
                : `Restaurant: ${activeRestaurant}`}
            </h3>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
            API connected
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
          { label: "Avg rating (Lifetime)", value: `${dynamicMetrics.avgRating} ★`, icon: Activity },
          { label: "Reviews collected", value: dynamicMetrics.reviewsCollected.toLocaleString(), icon: BarChart3 },
          { label: "Positive review rate", value: dynamicMetrics.repeatVisitRate: confidenceRate, icon: Users },
          { label: "Review volume growth", value: dynamicMetrics.mentionsGrowth, icon: TrendingUp },
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
            <p className="text-xs text-muted-foreground">Monthly average based on dated reviews returned by the API</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicMetrics.trendData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 5]} tickLine={false} />
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

        {/* Bar Chart: Channel Volume Breakdown */}
        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-foreground">Reviews by Semantic Classification</h3>
            <p className="text-xs text-muted-foreground">Volume breakdown based on review sentiment returned by the API</p>
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
                <Bar dataKey="volume" name="Review volume" fill="hsl(var(--primary))" opacity={0.85} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Star, 
  Award, 
  Building2,
  TrendingUp
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getRestaurantKPIs, getRealRestaurantsList } from "../apiService";

export default function MarketExplorer() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>(() => {
    return localStorage.getItem("selected_yelp_restaurant") || "all";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [allRestaurantsData, setAllRestaurantsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Escuchar activamente el cambio de restaurante global
  useEffect(() => {
    const checkActiveSession = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";
      setActiveRestaurant(saved);
    };
    window.addEventListener("storage", checkActiveSession);
    window.addEventListener("restaurantChanged", checkActiveSession);
    return () => {
      window.removeEventListener("storage", checkActiveSession);
      window.removeEventListener("restaurantChanged", checkActiveSession);
    };
  }, []);

  // 2. Traer la información real de todos los locales para cruzarlos
  useEffect(() => {
    async function fetchMarketDataset() {
      setLoading(true);
      try {
        const names = await getRealRestaurantsList();
        if (names && Array.isArray(names)) {
          // Consultamos los KPIs individuales en paralelo para armar el mercado verídico
          const batchPromises = names.map(async (name) => {
            const kpi = await getRestaurantKPIs(name);
            const metricsObj = kpi?.metrics || kpi || {};
            return {
              name,
              cuisine: metricsObj.categories || metricsObj.category || "Not available",
              city: metricsObj.city || "Not available",
              rating: Number(metricsObj.avg_stars || 0),
              reviews: Number(metricsObj.total_reviews || metricsObj.reviews_count || 0),
              positive_reviews: Number(metricsObj.positive_reviews || metricsObj.positive_count || 0)
            };
          });
          const resolved = await batchPromises;
          setAllRestaurantsData(resolved);
        }
      } catch (err) {
        console.error("Error building real market layout:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMarketDataset();
  }, []);

  // --- PROCESAMIENTO ESTRATÉGICO DE COMPETIDORES REALES ---
  const { competitors, radarData } = useMemo(() => {
    const totalMarketReviews = allRestaurantsData.reduce((acc, curr) => acc + curr.reviews, 0);
    const totalPositiveReviews = allRestaurantsData.reduce((acc, curr) => acc + (curr.positive_reviews || 0), 0);
    const avgMarketRating = allRestaurantsData.length > 0 
      ? Number((allRestaurantsData.reduce((acc, curr) => acc + curr.rating, 0) / allRestaurantsData.length).toFixed(1))
      : 0;

    const currentTarget = allRestaurantsData.find(r => r.name === activeRestaurant) || {
      name: "Market average",
      rating: avgMarketRating,
      reviews: totalMarketReviews,
      positive_reviews: totalPositiveReviews
    };

    // Construimos la lista de competidores basada en los otros locales disponibles
    const rawList = allRestaurantsData.map((res) => {
      const isTarget = res.name === activeRestaurant;
      return {
        name: isTarget ? `YOU (${res.name})` : res.name,
        cuisine: res.cuisine,
        city: res.city,
        rating: res.rating,
        reviews: res.reviews,
        isTarget
      };
    });

    // Ordenar de mayor a menor puntuación real para calcular el Rank verídico
    const sortedList = [...rawList].sort((a, b) => b.rating - a.rating);
    const finalCompetitorsList = sortedList.map((item, idx) => ({ ...item, rank: idx + 1 }));

    // Configurar Radar basado en las tasas de sentimiento devueltas por la API
    const targetPosPct = currentTarget.reviews > 0 ? Math.round((currentTarget.positive_reviews / currentTarget.reviews) * 100) : 0;
    const globalPosPct = totalMarketReviews > 0 
      ? Math.round((totalPositiveReviews / totalMarketReviews) * 100)
      : 0;

    const rData = [
      { subject: "Overall Rating Index", YOU: Math.round(currentTarget.rating * 20), MarketAvg: Math.round(avgMarketRating * 20) },
      { subject: "Positive Volume Ratio", YOU: targetPosPct, MarketAvg: globalPosPct },
      { subject: "Review Volume Share", YOU: totalMarketReviews > 0 ? Math.round((currentTarget.reviews / totalMarketReviews) * 100) : 0, MarketAvg: allRestaurantsData.length > 0 ? Math.round(100 / allRestaurantsData.length) : 0 },
      { subject: "Rating Consistency", YOU: Math.round(currentTarget.rating * 20), MarketAvg: Math.round(avgMarketRating * 20) },
    ];

    return { competitors: finalCompetitorsList, radarData: rData };
  }, [allRestaurantsData, activeRestaurant]);

  const filteredCompetitors = competitors.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center text-sm text-muted-foreground animate-pulse">
          Loading market data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between bg-white/40 border border-foreground/[0.04] p-4 rounded-2xl backdrop-blur-sm shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Market data</span>
            <h3 className="text-sm font-semibold text-foreground">
              {activeRestaurant === "all" ? "All restaurants" : `Restaurant: ${activeRestaurant}`}
            </h3>
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow="Market"
        title="Local Market Explorer"
        subtitle="Compare the selected restaurant against the restaurants returned by the API."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-base font-semibold text-foreground">Restaurant comparison index</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search competitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-foreground/[0.08] bg-white/50 py-1.5 pr-4 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-foreground/[0.04] text-muted-foreground">
                  <th className="py-3 font-semibold">Rank</th>
                  <th className="py-3 font-semibold">Name</th>
                  <th className="py-3 font-semibold">Classification</th>
                  <th className="py-3 font-semibold">Rating</th>
                  <th className="py-3 font-semibold">Reviews</th>
                  <th className="py-3 font-semibold">City</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompetitors.map((c) => {
                  const isYou = c.isTarget || (activeRestaurant === "all" && c.rank === 1);
                  return (
                    <tr 
                      key={c.name} 
                      className={`border-b border-foreground/[0.02] ${isYou ? "bg-primary/[0.05] font-medium" : "hover:bg-foreground/[0.01]"}`}
                    >
                      <td className="py-3.5 pl-1">
                        {c.rank === 1 ? <Award className="h-4 w-4 text-warning" /> : <span>#{c.rank}</span>}
                      </td>
                      <td className="py-3.5 text-foreground">{c.name}</td>
                      <td className="py-3.5 text-muted-foreground">{c.cuisine}</td>
                      <td className="py-3.5">
                        <span className="flex items-center gap-1 font-bold text-foreground">
                          {c.rating || "0.0"} <Star className="h-3 w-3 fill-warning text-warning" />
                        </span>
                      </td>
                      <td className="py-3.5 text-muted-foreground font-data">{c.reviews.toLocaleString()}</td>
                      <td className="py-3.5 text-muted-foreground font-data">{c.city || "Not available"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* GRÁFICO RADAR ACTUALIZADO Y CONECTADO */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">Satisfaction Architecture</h3>
            <p className="text-xs text-muted-foreground mb-4">Radar vector overlay vs direct micro-market average</p>
          </div>
          <div className="h-64 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(0,0,0,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "rgb(100,116,139)" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="Selected Unit" dataKey="YOU" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                <Radar name="Market Dataset Avg" dataKey="MarketAvg" stroke="#94A3B8" fill="#CBD5E1" fillOpacity={0.15} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

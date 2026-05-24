import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  Award, 
  Percent, 
  Building2 
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

export default function MarketExplorer() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const checkActiveSession = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";
      setActiveRestaurant(saved);
    };
    checkActiveSession();
    window.addEventListener("storage", checkActiveSession);
    return () => window.removeEventListener("storage", checkActiveSession);
  }, []);

  // Datos de competidores calculados reactivamente
  const { competitors, radarData } = useMemo(() => {
    const isGlobal = activeRestaurant === "all";
    const hash = activeRestaurant.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const avgRating = isGlobal ? 4.2 : parseFloat((3.6 + (hash % 12) / 10).toFixed(1));
    const totalReviews = isGlobal ? 12847 : Math.round(500 + (hash * 5) % 4000);

    const list = [
      { rank: 1, name: "Bella Italia Bistro", cuisine: "Italian", rating: 4.6, reviews: 1420, distance: 0.4 },
      { rank: 2, name: "The Smoked Joint", cuisine: "BBQ & Grill", rating: 4.4, reviews: 980, distance: 0.8 },
      {
        rank: 3,
        name: isGlobal ? "Global Portfolio Avg" : `YOU (${activeRestaurant})`,
        cuisine: "Target Node",
        rating: avgRating,
        reviews: totalReviews,
        distance: isGlobal ? 0 : 0.1,
      },
      { rank: 4, name: "Ocean Catch Seafood", cuisine: "Seafood", rating: 4.1, reviews: 640, distance: 1.2 },
      { rank: 5, name: "Green Garden Café", cuisine: "Organic / Salad", rating: 3.9, reviews: 510, distance: 0.6 },
    ].sort((a, b) => b.rating - a.rating);

    const updatedList = list.map((item, idx) => ({ ...item, rank: idx + 1 }));

    const rData = [
      { subject: "Food Quality", YOU: isGlobal ? 82 : 60 + (hash % 36), Competitors: 78 },
      { subject: "Service Speed", YOU: isGlobal ? 68 : 50 + (hash % 46), Competitors: 72 },
      { subject: "Value / Price", YOU: isGlobal ? 74 : 55 + (hash % 36), Competitors: 65 },
      { subject: "Ambiance", YOU: isGlobal ? 88 : 65 + (hash % 31), Competitors: 80 },
      { subject: "Cleanliness", YOU: isGlobal ? 85 : 60 + (hash % 36), Competitors: 83 },
    ];

    return { competitors: updatedList, radarData: rData };
  }, [activeRestaurant]);

  const filteredCompetitors = competitors.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between bg-white/40 border border-foreground/[0.04] p-4 rounded-2xl backdrop-blur-sm shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Market Intelligence Router</span>
            <h3 className="text-sm font-semibold text-foreground">
              {activeRestaurant === "all" ? "Geospatial Macro Framework" : `Local Node Benchmarking: ${activeRestaurant}`}
            </h3>
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow="Market"
        title="Local Market Explorer"
        subtitle="Compare your location real-time index metrics against direct neighborhood radius competitors."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-base font-semibold text-foreground">Market Competitor Index</h3>
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
                  <th className="py-3 font-semibold">Cuisine</th>
                  <th className="py-3 font-semibold">Rating</th>
                  <th className="py-3 font-semibold">Reviews</th>
                  <th className="py-3 font-semibold">Distance</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompetitors.map((c) => {
                  const isYou = c.name.includes("YOU") || c.name.includes("Global Portfolio");
                  return (
                    <tr 
                      key={c.name} 
                      className={`border-b border-foreground/[0.02] ${isYou ? "bg-primary/[0.04] font-medium" : "hover:bg-foreground/[0.01]"}`}
                    >
                      <td className="py-3.5 pl-1">
                        {c.rank === 1 ? <Award className="h-4 w-4 text-warning" /> : <span>#{c.rank}</span>}
                      </td>
                      <td className="py-3.5 text-foreground">{c.name}</td>
                      <td className="py-3.5 text-muted-foreground">{c.cuisine}</td>
                      <td className="py-3.5">
                        <span className="flex items-center gap-1 font-bold text-foreground">
                          {c.rating} <Star className="h-3 w-3 fill-warning text-warning" />
                        </span>
                      </td>
                      <td className="py-3.5 text-muted-foreground font-data">{c.reviews.toLocaleString()}</td>
                      <td className="py-3.5 text-muted-foreground font-data">{c.distance} km</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">Satisfaction Architecture</h3>
            <p className="text-xs text-muted-foreground mb-4">Radar vector overlay vs direct micro-market average</p>
          </div>
          <div className="h-64 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="You" dataKey="YOU" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                <Radar name="Market Avg" dataKey="Competitors" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

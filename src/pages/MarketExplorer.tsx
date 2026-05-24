import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Building2,
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

function bubbleColor(satisfaction: number) {
  if (satisfaction >= 4.5) return "hsl(var(--positive))";
  if (satisfaction >= 4.2) return "hsl(var(--insight))";
  if (satisfaction >= 4.0) return "hsl(var(--warning))";
  return "hsl(var(--negative))";
}

export default function MarketExplorer() {
  const [filter, setFilter] = useState<Filter>("City-wide");
  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");
  
  // Estados dinámicos conectados al servicio
  const [leaderboard, setLeaderboard] = useState<Competitor[]>([]);
  const [localAverage, setLocalAverage] = useState<number>(4.1);
  const [cuisineBubbles, setCuisineBubbles] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Escuchar la memoria global del Dashboard
  useEffect(() => {
    const checkBrandSession = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";
      setActiveRestaurant(saved);
    };

    checkBrandSession();
    window.addEventListener("storage", checkBrandSession);

    // 2. Cargar datos del Backend
    getMarketData().then((data) => {
      if (data) {
        setLeaderboard(data.leaderboard || []);
        setLocalAverage(data.localAverage || 4.1);
        setCuisineBubbles(data.cuisineBubbles || []);
        setRadarData(data.radarData || []);
      }
      setLoading(false);
    });

    return () => window.removeEventListener("storage", checkBrandSession);
  }, []);

  // 3. Cruzar la información estática/dinámica con el restaurante activo de Yelp
  const dynamicContext = useMemo(() => { return {
  rank: 3,
  name: "Global Portfolio Avg",
  cuisine: "Aggregated Portfolio", // <-- Asegúrate de que termine así
  rating: parseFloat(avgRating.toFixed(1)),
  reviews: totalReviews,
  distance: 0,
};


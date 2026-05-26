import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Megaphone,
  TrendingUp,
  Trophy,
  Zap,
  AlertOctagon,
  Eye,
  ArrowUpRight,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getOverviewData, getRestaurantKPIs, getTopProblemDrivers } from "../apiService";

type Quadrant = {
  title: string;
  subtitle: string;
  icon: typeof Trophy;
  tone: "positive" | "warning" | "negative" | "muted";
  items: { name: string; meta: string; recommendation: string; impact?: string }[];
};

const toneStyles: Record<Quadrant["tone"], { border: string; chip: string; icon: string; bar: string }> = {
  positive: { border: "border-positive/30", chip: "bg-positive/15 text-positive", icon: "text-positive", bar: "gradient-positive" },
  warning: { border: "border-warning/30", chip: "bg-warning/15 text-warning", icon: "text-warning", bar: "gradient-warning" },
  negative: { border: "border-negative/30", chip: "bg-negative/15 text-negative", icon: "text-negative", bar: "gradient-negative" },
  muted: { border: "border-white/10", chip: "bg-white/10 text-muted-foreground", icon: "text-muted-foreground", bar: "bg-muted" },
};

export default function MarketPosition() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>(() => {
    return localStorage.getItem("selected_yelp_restaurant") || "all";
  });
  const [globalData, setGlobalData] = useState<any>(null);
  const [activeKPIs, setActiveKPIs] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Escuchar activamente los cambios de estado global
  useEffect(() => {
    const checkBrand = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";
      setActiveRestaurant(saved);
    };
    window.addEventListener("storage", checkBrand);
    window.addEventListener("restaurantChanged", checkBrand);
    return () => {
      window.removeEventListener("storage", checkBrand);
      window.removeEventListener("restaurantChanged", checkBrand);
    };
  }, []);

  // 2. Consulta y consumo real de endpoints SQLite
  useEffect(() => {
    async function loadMarketPositionMetrics() {
      setLoading(true);
      try {
        const overview = await getOverviewData();
        if (overview) setGlobalData(overview);

        const driversRes = await getTopProblemDrivers(activeRestaurant);
        setDrivers(driversRes?.top_problem_drivers || []);

        if (activeRestaurant !== "all") {
          const kpis = await getRestaurantKPIs(activeRestaurant);
          setActiveKPIs(kpis);
        } else {
          setActiveKPIs(null);
        }
      } catch (err) {
        console.error("Error connecting matrix with Railway logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMarketPositionMetrics();
  }, [activeRestaurant]);

  // --- PROCESAMIENTO ANALÍTICO REAL ---
  const isGlobal = activeRestaurant === "all";
  const displayName = isGlobal ? "Global Portfolio" : activeRestaurant;

  const currentMetrics = isGlobal ? globalData : (activeKPIs?.metrics || activeKPIs);
  
  const totalReviews = currentMetrics?.total_reviews || 0;
  const ratingValue = currentMetrics?.avg_stars ? currentMetrics.avg_stars.toFixed(1) : "0.0";
  
  const positiveCount = currentMetrics?.positive_reviews || currentMetrics?.positive_count || 0;
  const positivePct = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
  const negativePct = totalReviews > 0 ? 100 - positivePct : 0;
  const calculatedNps = positivePct - negativePct;

  // Global Share calculations
  const globalTotalReviews = globalData?.total_reviews || 1;
  const shareOfVoice = isGlobal ? "100%" : `${Math.min(Number(((totalReviews / globalTotalReviews) * 100).toFixed(1)), 100)}%`;

  const compCards = [
    {
      title: "Market Standing",
      icon: Trophy,
      rows: [
        { label: isGlobal ? "Average System Rating" : "Your Location Rating", value: `${ratingValue} ★`, tone: "positive" },
        { label: "Dataset Network Baseline", value: "3.9 ★" },
        { label: "Performance Status", value: Number(ratingValue) >= 4.0 ? "Outperforming" : "Awaiting Optimization", tone: "positive" },
      ],
    },
    {
      title: "Share of Voice",
      icon: Megaphone,
      rows: [
        { label: isGlobal ? "Total Network Volume" : "Your Unit Volume", value: totalReviews.toLocaleString() },
        { label: "Total Database Ingested", value: globalTotalReviews.toLocaleString() },
        { label: "Market Volume Share", value: shareOfVoice, tone: "positive" },
      ],
    },
    {
      title: "Calculated Sentiment",
      icon: TrendingUp,
      rows: [
        { label: isGlobal ? "Network Core NPS" : "Your Location NPS", value: totalReviews > 0 ? `${calculatedNps >= 0 ? "+" : ""}${calculatedNps}` : "N/A", tone: "positive" },
        { label: "Network Average Baseline", value: "+35" },
        { label: "Target Safe Threshold", value: "+40" },
      ],
    },
  ];

  // --- ARQUITECTURA DE MATRIZ 2x2 BASADA EN DRIVERS REALES ---
  const matrix: Quadrant[] = useMemo(() => {
    // Clasificamos las quejas de NLP reales extraídas de Railway
    const criticalIssues = drivers.map(d => ({
      name: `Risk detected: ${d.factor.charAt(0).toUpperCase() + d.factor.slice(1)}`,
      meta: `${d.negative_reviews || d.count || 0} explicit negative logs found in SQLite`,
      recommendation: `Deploy corrective audits to protect local sentiment and stop NPS leakage.`
    }));

    return [
      {
        title: "Strengths to Leverage",
        subtitle: "High customer satisfaction indicators",
        icon: Trophy,
        tone: "positive",
        items: [
          { 
            name: "Core Positive Sentiment Retention", 
            meta: `${positivePct}% of customers left positive logs`, 
            recommendation: "Maintain standards and showcase highlights on marketing assets." 
          }
        ],
      },
      {
        title: "Quick Wins",
        subtitle: "Healthy performance markers",
        icon: Zap,
        tone: "warning",
        items: [
          { 
            name: "Rating Index Stabilization", 
            meta: `Operating at ${ratingValue} stars`, 
            recommendation: "Convert positive mentions into loyalty campaigns." 
          },
        ],
      },

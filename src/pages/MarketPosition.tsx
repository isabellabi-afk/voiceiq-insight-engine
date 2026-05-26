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

  // 2. Consulta y consumo real de endpoints database
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
        console.error("Error connecting matrix with API logs:", err);
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
    // Clasificamos las quejas de NLP reales extraídas de database de forma dinámica
    const criticalIssues = drivers.map(d => ({
      name: `Risk detected: ${d.factor.charAt(0).toUpperCase() + d.factor.slice(1)}`,
      meta: `${d.negative_reviews || d.count || 0} explicit negative logs found in database`,
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
      {
        title: "Critical Risks",
        subtitle: "Areas requiring urgent operation interventions",
        icon: AlertOctagon,
        tone: "negative",
        items: criticalIssues.length > 0 ? criticalIssues : [
          {
            name: "Friction Point Analysis",
            meta: `${negativePct}% critical volume ratio registered`,
            recommendation: "Monitor text stream patterns in Topic Explorer immediately."
          }
        ],
      },
      {
        title: "Strategic Trajectory",
        subtitle: "Long-term brand positioning markers",
        icon: Eye,
        tone: "muted",
        items: [
          {
            name: "Market Voice Share",
            meta: `Sustaining a ${shareOfVoice} regional presence`,
            recommendation: "Evaluate competitor volume trends monthly."
          }
        ],
      }
    ];
  }, [drivers, positivePct, negativePct, ratingValue, shareOfVoice]);

  // --- RETORNO DEL COMPONENTE JSX DE TU DISEÑO ORIGINAL ---
  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between bg-white/40 border border-foreground/[0.04] p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Market Intelligence Matrix
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              {isGlobal ? "Macro Entity Mapping" : `Market Position: ${displayName}`}
            </h3>
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow="Positioning"
        title="Market Competitive Position"
        subtitle="Compare your brand value and operational markers against peer entities across regional datasets."
      />

      {/* Grid Superior de KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {compCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground tracking-tight">{card.title}</h4>
              </div>
              <div className="space-y-3">
                {card.rows.map((row, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-foreground/[0.02] last:border-0 last:pb-0">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-mono font-bold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Matriz 2x2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {matrix.map((quadrant, i) => {
          const Icon = quadrant.icon;
          const styles = toneStyles[quadrant.tone];
          return (
            <div key={i} className={`glass-card p-5 border ${styles.border} flex flex-col justify-between gap-4`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${styles.icon}`} />
                    <h4 className="text-xs font-bold text-foreground tracking-tight">{quadrant.title}</h4>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${styles.chip}`}>
                    {quadrant.tone}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">{quadrant.subtitle}</p>
                <div className="space-y-3">
                  {quadrant.items.map((item, idx) => (
                    <div key={idx} className="bg-white/60 p-3 rounded-xl border border-foreground/[0.02] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground tracking-tight">{item.name}</span>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground/50" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{item.meta}</p>
                      <div className="flex items-start gap-1.5 bg-foreground/[0.02] p-2 rounded-lg mt-1">
                        <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        <p className="text-[10px] text-foreground/80">
                          <span className="font-bold text-foreground">Action:</span> {item.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

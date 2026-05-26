import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChefHat, Users, Home, DollarSign, Sparkles, Star, Building2, AlertCircle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getTopProblemDrivers, getReviewsByRestaurant } from "@/apiService";

const factorMetaMap: Record<string, { label: string; icon: any; positiveKeywords: string[]; negativeKeywords: string[] }> = {
  comida: {
    label: "Food Quality",
    icon: ChefHat,
    positiveKeywords: ["sabor", "presentación", "porción", "bueno", "rico", "fresco", "calidad"],
    negativeKeywords: ["frío", "malo", "salado", "crudo", "sabor", "temperatura", "cocción"],
  },
  servicio: {
    label: "Service Experience",
    icon: Users,
    positiveKeywords: ["atención", "amabilidad", "rapidez", "eficiente", "camarero", "personal"],
    negativeKeywords: ["espera", "trato", "demora", "lento", "grosero", "desorganización"],
  },
  ambiente: {
    label: "Ambiance & Atmosphere",
    icon: Home,
    positiveKeywords: ["comodidad", "decoración", "música", "limpio", "agradable", "espacio"],
    negativeKeywords: ["ruido", "sucio", "limpieza", "incómodo", "oscuro", "iluminación"],
  },
  precio: {
    label: "Value & Pricing",
    icon: DollarSign,
    positiveKeywords: ["precio", "justo", "accesible", "barato", "económico"],
    negativeKeywords: ["caro", "costoso", "elevado", "desproporcionado", "cuenta"],
  },
};

function SentimentGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180 - 90;

  return (
    <div className="relative mx-auto w-56">
      <svg viewBox="0 0 200 130" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1" y1="0" x2="0">
            <stop offset="0%" stopColor="rgb(239, 68, 68)" />
            <stop offset="50%" stopColor="rgb(245, 158, 11)" />
            <stop offset="100%" stopColor="rgb(34, 197, 94)" />
          </linearGradient>
        </defs>

        <path
          d="M 15 100 A 85 85 0 0 1 185 100"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />

        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="28"
          stroke="currentColor"
          className="text-foreground"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: "100px 100px", transformBox: "view-box" }}
        />

        <circle cx="100" cy="100" r="6" fill="currentColor" className="text-foreground" />

        <text x="100" y="122" textAnchor="middle" className="font-bold fill-current text-foreground font-mono" style={{ fontSize: "18px" }}>
          {value}%
        </text>
      </svg>
      <p className="-mt-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Cluster Health Rate</p>
    </div>
  );
}

export function TopicExplorer() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>(() => localStorage.getItem("selected_yelp_restaurant") || "all");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [drivers, setDrivers] = useState<any[]>([]);
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkActiveSession = () => {
      setActiveRestaurant(localStorage.getItem("selected_yelp_restaurant") || "all");
    };
    window.addEventListener("storage", checkActiveSession);
    window.addEventListener("restaurantChanged", checkActiveSession);
    return () => {
      window.removeEventListener("storage", checkActiveSession);
      window.removeEventListener("restaurantChanged", checkActiveSession);
    };
  }, []);

  useEffect(() => {
    async function syncDataset() {
      setLoading(true);
      try {
        const driversData = await getTopProblemDrivers(activeRestaurant);
        const reviewsData = await getReviewsByRestaurant(activeRestaurant);
        setRealReviews(reviewsData || []);

        if (driversData && driversData.top_problem_drivers) {
          const apiDrivers = driversData.top_problem_drivers;
          setDrivers(apiDrivers);
          if (apiDrivers.length > 0) setSelectedTheme(apiDrivers[0].factor);
        }
      } catch (err) {
        console.error("Error syncing NLP content pipeline:", err);
      } finally {
        setLoading(false);
      }
    }
    syncDataset();
  }, [activeRestaurant]);

  const processedThemes = useMemo(() => {
    if (!drivers.length) return [];
    const totalCriticalMentions = drivers.reduce((acc, curr) => acc + Number(curr.negative_reviews || curr.count || 0), 0);

    return drivers.map((d: any) => {
      const factorName = d.factor ? d.factor.toLowerCase() : "otros";
      const meta = factorMetaMap[factorName] || {
        label: `Cluster: ${d.factor}`,
        icon: Sparkles,
        positiveKeywords: ["general"],
        negativeKeywords: ["específico"],
      };

      const count = Number(d.negative_reviews || d.count || 0);
      const calculatedSentiment = totalCriticalMentions > 0 
        ? Math.max(5, Math.min(95, Math.round(100 - (count / totalCriticalMentions) * 100)))
        : 70;

      return { id: d.factor, label: meta.label, icon: meta.icon, mentions: count, sentiment: calculatedSentiment, meta };
    });
  }, [drivers]);

  const activeDeepDive = useMemo(() => {
    const currentThemeObj = processedThemes.find((t) => t.id === selectedTheme);
    if (!currentThemeObj) return { positive: [], negative: [], reviews: [] };

    const positive = currentThemeObj.meta.positiveKeywords;
    const negative = currentThemeObj.meta.negativeKeywords;
    const allKeywords = [...positive, ...negative];
    
    const filteredAndMapped = realReviews
      .filter((rev: any) => {
        const textContent = String(rev?.text || "").toLowerCase();
        return allKeywords.some(keyword => textContent.includes(keyword)) || selectedTheme === "Otros";
      })
      .map((rev: any) => {
        const starsValue = Number(rev?.review_stars || rev?.stars || rev?.rating || 3);
        const textContent = rev?.text || "No text segment retrieved.";
        const matchedTags = allKeywords.filter(keyword => textContent.toLowerCase().includes(keyword));

        return {
          stars: starsValue,
          date: rev?.date || rev?.review_date || "SQL Ledger",
          text: textContent,
          sentiment: String(rev?.sentiment_binary).toLowerCase() === "positive" || starsValue >= 4 ? ("Positive" as const) : ("Negative" as const),
          themes: matchedTags.length > 0 ? matchedTags.slice(0, 2).map(t => t.toUpperCase()) : ["GENERAL MATCH"],
        };
      })
      .slice(0, 5);

    return { positive, negative, reviews: filteredAndMapped };
  }, [selectedTheme, processedThemes, realReviews]);

  const activeSentimentValue = useMemo(() => {
    return processedThemes.find((t) => t.id === selectedTheme)?.sentiment || 50;
  }, [selectedTheme, processedThemes]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 flex-col items-center justify-center text-sm text-muted-foreground gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Parsing conversational vectors and NLP intersections...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between bg-white/40 border border-foreground/[0.04] p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Semantic Router Logs</span>
            <h3 className="text-sm font-semibold text-foreground">
              {activeRestaurant === "all" ? "Macro Ingestion Pipeline" : `Segment Isolation: ${activeRestaurant}`}
            </h3>
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow="Intelligence"
        title="Topic Cluster Explorer"
        subtitle="Unpack deep semantic layers of text reviews categorised by proprietary NLP clustering modules."
      />

      {processedThemes.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-foreground/10 mb-6">
          <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-semibold text-foreground">No NLP clusters mapped</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {processedThemes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedTheme === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`glass-card p-4 text-left transition-all cursor-pointer ${isSelected ? "ring-1.5 ring-primary bg-primary/[0.01]" : "hover:bg-foreground/[0.01]"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${isSelected ? "bg-primary text-white" : "bg-foreground/[0.04] text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-muted-foreground">{theme.mentions} logs</span>
                </div>
                <h4 className="text-xs font-bold text-foreground mb-1.5 tracking-tight">{theme.label}</h4>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-full bg-foreground/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${theme.sentiment}%`,
                        backgroundColor: theme.sentiment > 70 ? "rgb(34, 197, 94)" : theme.sentiment > 40 ? "rgb(245, 158, 11)" : "rgb(239, 68, 68)",
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-foreground">{theme.sentiment}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activeDeepDive.reviews.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card p-6 flex flex-col justify-between gap-6">
            <div>
              <h3 className="text-sm font-bold text-foreground">Cluster Diagnostics</h3>
              <p className="text-[11px] text-muted-foreground">Calculated relational density of active node</p>
            </div>
            <SentimentGauge value={activeSentimentValue} />
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-2">High Frequency Tokens (+)</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDeepDive.positive.map((w) => (
                    <span key={w} className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-500/10 capitalize">{w}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-2">Critical Risk Tokens (-)</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDeepDive.negative.map((w) => (
                    <span key={w} className="text-[10px] font-semibold bg-rose-500/10 text-rose-700 px-2 py-0.5 rounded-md border border-rose-500/10 capitalize">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-sm font-bold text-foreground mb-4">Granular Text Segmentations (Filtered Matrix)</h3>
            <div className="space-y-3.5">
              {activeDeepDive.reviews.map((rev, i) => {
                const isPositive = rev.sentiment === "Positive";
                return (
                  <div key={`real-rev-${i}`} className="p-4 rounded-xl border border-foreground/[0.03] bg-foreground/[0.01]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`h-3 w-3 ${idx < rev.stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/10"}`} />
                        ))}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${isPositive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" : "bg-rose-500/10 text-rose-600 border-rose-500/10"}`}>{rev.sentiment}</span>
                    </div>
                    <p className="text-xs text-foreground/80 italic font-medium leading-relaxed">"{rev.text.replace(/^["']|["']$/g, '')}"</p>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-foreground/[0.02]">
                      <div className="flex flex-wrap gap-1">
                        {rev.themes.map((t) => (
                          <span key={t} className="bg-primary/10 text-primary font-mono text-[9px] px-1.5 py-0.5 rounded-sm font-bold">#{t}</span>
                        ))}
                      </div>
                      <span className="font-mono text-[9px]">{rev.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default TopicExplorer;

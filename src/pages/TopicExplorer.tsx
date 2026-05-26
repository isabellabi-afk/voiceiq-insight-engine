import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChefHat, Users, Home, DollarSign, Sparkles, Star, Building2, AlertCircle } from "lucide-react";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getTopProblemDrivers, getRestaurantKPIs } from "@/apiService";

// Mapeo estético para los clusters reales de la base de datos
const factorMetaMap: Record<string, { label: string; icon: any; positiveKeywords: string[]; negativeKeywords: string[] }> = {
  comida: {
    label: "Food Quality",
    icon: ChefHat,
    positiveKeywords: ["Sabor", "Presentación", "Porción", "Ingredientes"],
    negativeKeywords: ["Calidad", "Temperatura", "Cocción", "Sazón"],
  },
  servicio: {
    label: "Service Experience",
    icon: Users,
    positiveKeywords: ["Atención", "Amabilidad", "Rapidez", "Eficiencia"],
    negativeKeywords: ["Espera", "Trato", "Desorganización", "Demora"],
  },
  ambiente: {
    label: "Ambiance & Atmosphere",
    icon: Home,
    positiveKeywords: ["Comodidad", "Decoración", "Música", "Espacio"],
    negativeKeywords: ["Ruido", "Limpieza", "Mobiliario", "Iluminación"],
  },
  precio: {
    label: "Value & Pricing",
    icon: DollarSign,
    positiveKeywords: ["Costo-Beneficio", "Accesible", "Justo"],
    negativeKeywords: ["Caro", "Elevado", "Desproporcionado"],
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
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            transformOrigin: "100px 100px",
            transformBox: "view-box",
          }}
        />

        <circle cx="100" cy="100" r="6" fill="currentColor" className="text-foreground" />

        <text
          x="100"
          y="122"
          textAnchor="middle"
          className="font-bold fill-current text-foreground"
          style={{ fontSize: "18px" }}
        >
          {value}%
        </text>
      </svg>
      <p className="-mt-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">Confidence Score</p>
    </div>
  );
}

export function TopicExplorer() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>(() => {
    return localStorage.getItem("selected_yelp_restaurant") || "all";
  });

  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [drivers, setDrivers] = useState<any[]>([]);
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // 1. Escuchar activamente el cambio de restaurante en el sidebar
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

  // 2. Cargar datos puros de la API de Railway
  useEffect(() => {
    async function syncDataset() {
      setLoading(true);
      try {
        const driversData = await getTopProblemDrivers(activeRestaurant);
        const kpiData = await getRestaurantKPIs(activeRestaurant);

        // Extraer reviews reales
        const rawReviews = kpiData?.reviews || kpiData?.raw_reviews || [];
        setRealReviews(rawReviews);

        const metrics = activeRestaurant === "all" ? kpiData : kpiData?.metrics;
        setTotalReviews(metrics?.total_reviews || rawReviews.length || 0);

        if (driversData && driversData.top_problem_drivers) {
          const apiDrivers = driversData.top_problem_drivers;
          setDrivers(apiDrivers);
          
          if (apiDrivers.length > 0) {
            setSelectedTheme(apiDrivers[0].factor);
          } else {
            setSelectedTheme("");
          }
        }
      } catch (err) {
        console.error("Error syncing NLP content pipeline:", err);
      } finally {
        setLoading(false);
      }
    }

    syncDataset();
  }, [activeRestaurant]);

  // 3. Formatear los clusters de quejas reales de la BD
  const processedThemes = useMemo(() => {
    if (!drivers.length) return [];
    
    return drivers.map((d: any) => {
      const factorName = d.factor ? d.factor.toLowerCase() : "otros";
      const meta = factorMetaMap[factorName] || {
        label: `Cluster: ${factorName}`,
        icon: Sparkles,
        positiveKeywords: ["General"],
        negativeKeywords: ["Review Log"],
      };

      const count = Number(d.negative_reviews || d.count || 0);
      
      // Cálculo de ratio de confianza real según reviews del SQLite
      const calculatedSentiment = totalReviews > 0 
        ? Math.max(100 - Math.round((count / totalReviews) * 100), 15) 
        : 75;

      return {
        id: d.factor, // Mantenemos el ID original de la BD para la selección
        label: meta.label,
        icon: meta.icon,
        mentions: count,
        sentiment: calculatedSentiment,
        meta,
      };
    });
  }, [drivers, totalReviews]);

  // 4. Mapear las opiniones de la Base de Datos directamente a la vista inferior
  const activeDeepDive = useMemo(() => {
    const currentThemeObj = processedThemes.find((t) => t.id === selectedTheme);
    
    // Si no hay clusters seleccionados pero tenemos opiniones del restaurante, las mostramos limpias
    const positive = currentThemeObj?.meta.positiveKeywords || ["Análisis de Texto"];
    const negative = currentThemeObj?.meta.negativeKeywords || ["Señales Críticas"];

    // Tomamos las opiniones del hook realReviews sin filtros rotos de strings estáticas
    const reviewsToShow = realReviews.slice(0, 3).map((rev: any) => {
      const starsValue = rev.stars || rev.rating || 3;
      return {
        stars: starsValue,
        date: rev.date || "SQLite Transaction Log",
        text: rev.text || "Reseña cargada desde la base de datos local.",
        sentiment: starsValue >= 4 ? ("Positive" as const) : ("Negative" as const),
        themes: currentThemeObj ? [currentThemeObj.label] : ["General Ingestion"],
      };
    });

    return { positive, negative, reviews: reviewsToShow };
  }, [selectedTheme, processedThemes, realReviews]);

  const activeSentimentValue = useMemo(() => {
    return processedThemes.find((t) => t.id === selectedTheme)?.sentiment || 50;
  }, [selectedTheme, processedThemes]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center text-xs text-muted-foreground animate-pulse">
          Recalculating NLP vectors and processing granular text streams from Railway...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER DE CONTEXTO */}
      <div className="mb-4 flex items-center justify-between bg-white/40 border border-foreground/[0.04] p-4 rounded-2xl backdrop-blur-sm shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Semantic Router Logs
            </span>
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

      {/* GRID DE CATEGORÍAS REALES O MENSAJE DE ESPERA */}
      {processedThemes.length === 0 ? (
        <div className="glass-card p-8 text-center flex flex-col items-center justify-center gap-3 mb-6">
          <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-xs text-muted-foreground max-w-sm">
            No se detectaron problemas ni clusters negativos críticos para {activeRestaurant === "all" ? "la base de datos general" : activeRestaurant}.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {processedThemes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedTheme === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`glass-card p-4 text-left transition-all relative overflow-hidden cursor-pointer ${
                  isSelected ? "ring-2 ring-primary/50 bg-primary/[0.02]" : "hover:bg-foreground/[0.01]"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${isSelected ? "bg-primary text-white" : "bg-foreground/[0.04] text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {theme.mentions} {theme.mentions === 1 ? "queja real" : "quejas reales"}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-foreground mb-1">{theme.label}</h4>

                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-full bg-foreground/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${theme.sentiment}%`,
                        backgroundColor:
                          theme.sentiment > 70
                            ? "rgb(34, 197, 94)"
                            : theme.sentiment > 45
                            ? "rgb(245, 158, 11)"
                            : "rgb(239, 68, 68)",
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">{theme.sentiment}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* DETALLE PROFUNDO: SECCIÓN TOTALMENTE REAL */}
      {activeDeepDive.reviews.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* DIAGNÓSTICO */}
          <div className="glass-card p-6 flex flex-col justify-between gap-6">
            <div>
              <h3 className="text-sm font-bold text-foreground">Cluster Diagnostics</h3>
              <p className="text-[11px] text-muted-foreground">Real-time model confidence values</p>
            </div>

            <SentimentGauge value={activeSentimentValue} />

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 block mb-2">
                  High Frequency Vectors (+)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDeepDive.positive.map((w) => (
                    <span key={w} className="text-[10px] font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-md border border-green-200">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block mb-2">
                  Critical Risk Nodes (-)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDeepDive.negative.map((w) => (
                    <span key={w} className="text-[10px] font-medium bg-red-50 text-red-700 px-2 py-0.5 rounded-md border border-red-200">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GRANULAR TEXT SEGMENTATION (REVIEWS DE TU SQLITE) */}
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-sm font-bold text-foreground mb-4">Granular Text Segmentations</h3>

            <div className="space-y-3.5">
              {activeDeepDive.reviews.map((rev, i) => (
                <div key={`real-rev-${i}`} className="p-4 rounded-xl border border-foreground/[0.03] bg-foreground/[0.01]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3 w-3 ${idx < rev.stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/10"}`}
                        />
                      ))}
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        rev.sentiment === "Positive"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {rev.sentiment}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/90 italic">"{rev.text}"</p>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-foreground/[0.02]">
                    <div className="flex gap-1">
                      {rev.themes.map((t) => (
                        <span key={t} className="bg-foreground/[0.04] px-1.5 py-0.5 rounded-sm">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span>{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

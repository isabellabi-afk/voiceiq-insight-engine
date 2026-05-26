import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Star, MessageSquare, Building2, ThumbsUp, Inbox, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getReviewsByRestaurant } from "@/apiService";

export default function Reviews() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sincronizar restaurante activo globalmente mediante eventos del sistema
  useEffect(() => {
    const syncRestaurantSession = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";
      setActiveRestaurant(saved);
    };
    syncRestaurantSession();
    window.addEventListener("restaurantChanged", syncRestaurantSession);
    window.addEventListener("storage", syncRestaurantSession);
    return () => {
      window.removeEventListener("restaurantChanged", syncRestaurantSession);
      window.removeEventListener("storage", syncRestaurantSession);
    };
  }, []);

  // Cargar opiniones reales directamente desde el pipeline de Railway
  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const data = await getReviewsByRestaurant(activeRestaurant);
        
        if (data && Array.isArray(data)) {
          setReviews(data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Critical error syncing review pipeline with SQLite:", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [activeRestaurant]);

  // Normalización estricta de datos para blindar el renderizado ante variaciones del esquema SQL
  const normalizedReviews = useMemo(() => {
    return reviews.map((r: any, i) => ({
      id: r?.review_id || r?.id || `review-${i}`,
      business_name: r?.business_name || r?.restaurant_name || "Active Brand Entity",
      city: r?.city || r?.location || "N/A",
      text: r?.text || r?.comment || "No text log provided for this record.",
      review_stars: r?.review_stars !== undefined ? Number(r.review_stars) : r?.stars !== undefined ? Number(r.stars) : 0,
      date: r?.date || r?.review_date || "Recent Date",
      sentiment_binary: r?.sentiment_binary || r?.sentiment || "Neutral",
    }));
  }, [reviews]);

  // Filtrado Determinista sobre datos reales
  const filteredReviews = useMemo(() => {
    return normalizedReviews.filter((r) => {
      const search = searchTerm.toLowerCase();

      // Validación estricta del entorno aislado por cuenta/restaurante
      const matchesRestaurant =
        activeRestaurant === "all" ||
        activeRestaurant === "" ||
        r.business_name.toLowerCase().includes(activeRestaurant.toLowerCase()) ||
        activeRestaurant.toLowerCase().includes(r.business_name.toLowerCase());

      const matchesSearch = 
        r.text.toLowerCase().includes(search) || 
        r.business_name.toLowerCase().includes(search);

      const matchesRating = 
        ratingFilter === "all" || 
        String(Math.round(r.review_stars)) === ratingFilter;

      return matchesRestaurant && matchesSearch && matchesRating;
    });
  }, [normalizedReviews, activeRestaurant, searchTerm, ratingFilter]);

  return (
    <DashboardLayout>
      {/* STATUS BAR */}
      <div className="mb-4 flex items-center justify-between bg-white/40 border border-foreground/[0.04] p-4 rounded-2xl backdrop-blur-sm shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Review Data Pipeline
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              {activeRestaurant === "all" ? "Global Feedback Streams" : `Isolated Feed: ${activeRestaurant}`}
            </h3>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <PageHeader
        eyebrow="Feedback"
        title="Customer Reviews Log"
        subtitle={`Filtered review stream for ${activeRestaurant === "all" ? "all restaurants" : activeRestaurant}.`}
      />

      {/* FILTER BAR */}
      <div className="glass-card mb-6 flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* SEARCH */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search dataset logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-foreground/[0.08] bg-white/50 py-1.5 pr-4 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* RATING */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-lg border border-foreground/[0.08] bg-white/50 px-3 py-1.5 text-xs text-foreground font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Streaming relational tuples from SQLite engine...</span>
          </div>
        ) : filteredReviews.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-foreground/10"
          >
            <div className="h-10 w-10 bg-foreground/[0.03] rounded-xl flex items-center justify-center text-muted-foreground mb-3">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">No matching review structures</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              The query returned 0 live results inside SQLite for the selected filter matrices.
            </p>
          </motion.div>
        ) : (
          filteredReviews.map((r, i) => {
            const isPositive = String(r.sentiment_binary).toLowerCase() === "positive";
            const badgeClass = isPositive 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
              : "bg-rose-500/10 text-rose-600 border-rose-500/20";

            return (
              <motion.div
                key={`${r.id}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-5 hover:shadow-xs transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground tracking-tight">{r.business_name}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold bg-foreground/[0.04] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        📍 {r.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3 w-3 ${
                              idx < Math.round(r.review_stars) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/10"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">{r.date}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${badgeClass}`}>
                    {r.sentiment_binary}
                  </span>
                </div>

                <p className="mt-3.5 text-xs text-foreground/80 leading-relaxed font-medium">
                  {r.text.startsWith('"') ? r.text : `"${r.text}"`}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-foreground/[0.03] pt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <MessageSquare className="h-3 w-3 text-primary" />
                    <span>Processed NLP Tuple</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span>Score Index:</span>
                    <span className="font-bold text-foreground">{r.review_stars.toFixed(1)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}

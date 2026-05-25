import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Star, MessageSquare, Building2, ThumbsUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getReviewsByRestaurant } from "@/apiService";

// Datos de rescate locales por si el backend de Railway tarda en responder o está en reposo
const fallbackReviews = [
  { review_id: "fb-1", business_name: "Mon Ami Gabi", city: "Las Vegas", text: "The steak frites were absolutely incredible. Sit patio-side if you can for the fountain views!", review_stars: 5, date: "2026-05-12", sentiment_binary: "positive" },
  { review_id: "fb-2", business_name: "Mon Ami Gabi", city: "Las Vegas", text: "Service was incredibly slow tonight. Waited 45 minutes for our appetizers.", review_stars: 2, date: "2026-05-10", sentiment_binary: "negative" },
  { review_id: "fb-3", business_name: "The Buffet at Wynn", city: "Las Vegas", text: "Massive selection of gourmet foods. The seafood station alone is worth the price.", review_stars: 5, date: "2026-05-14", sentiment_binary: "positive" }
];

export function Reviews() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CONEXIÓN CON EL SELECTOR GLOBAL
  // =========================================================
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

  // =========================================================
  // CARGA DE DATOS DESDE RAILWAY
  // =========================================================
  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        console.log("Fetching from Railway API for:", activeRestaurant);
        const data = await getReviewsByRestaurant(activeRestaurant);
        
        if (data && Array.isArray(data) && data.length > 0) {
          setReviews(data);
        } else {
          console.log("Railway returned empty array, triggering fallback.");
          setReviews(fallbackReviews);
        }
      } catch (err) {
        console.error("Error connected to Railway:", err);
        setReviews(fallbackReviews);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, [activeRestaurant]);

  // =========================================================
  // NORMALIZACIÓN SEGURA
  // =========================================================
  const normalizedReviews = reviews.map((r: any, i) => ({
    id: r?.review_id || r?.id || `review-${i}`,
    business_name: r?.business_name || r?.restaurant_name || "Unknown Restaurant",
    city: r?.city || r?.location || "Unknown City",
    text: r?.text || r?.comment || "No review text available",
    review_stars: Number(r?.review_stars || r?.stars || r?.rating || 0),
    date: r?.date || r?.review_date || "No date",
    sentiment_binary: r?.sentiment_binary || r?.sentiment || "unknown",
  }));

  // =========================================================
  // FILTRADO LOCAL (Solo para barra de búsqueda y estrellas)
  // =========================================================
  const filteredReviews = normalizedReviews.filter((r) => {
    const search = searchTerm.toLowerCase();

    // Confiamos en la API: si la API ya trajo los datos filtrados por restaurante, pasamos de largo el filtro redundante
    const matchesSearch = 
      r.text.toLowerCase().includes(search) || 
      r.business_name.toLowerCase().includes(search);

    const matchesRating = 
      ratingFilter === "all" || 
      String(r.review_stars) === ratingFilter;

    return matchesSearch && matchesRating;
  });

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
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-foreground/[0.08] bg-white/50 py-1.5 pr-4 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
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
          <div className="glass-card p-10 text-center text-sm text-muted-foreground">
            Loading live Yelp review stream...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="glass-card p-10 text-center text-sm text-muted-foreground">
            No reviews found matching the active criteria.
          </div>
        ) : (
          filteredReviews.map((r, i) => {
            const isPositive = String(r.sentiment_binary).toLowerCase() === "positive";
            const badgeClass = isPositive 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-red-50 text-red-700 border-red-200";

            return (
              <motion.div
                key={`${r.id}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-5 hover:shadow-xs transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-foreground">{r.business_name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium bg-foreground/[0.04] px-2 py-0.5 rounded-md">
                        {r.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3 w-3 ${
                              idx < r.review_stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{r.date}</span>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border capitalize ${badgeClass}`}>
                    {r.sentiment_binary}
                  </span>
                </div>

                <p className="mt-3.5 text-xs text-foreground/85 leading-relaxed italic">"{r.text}"</p>

                <div className="mt-4 flex items-center justify-between border-t border-foreground/[0.02] pt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Processed Log</span>

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Star, MessageSquare, Filter, Building2, Calendar, ThumbsUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getReviews } from "@/apiService";

// Dataset estático de contingencia
const initialMockReviews = [
  {
    id: "1",
    author: "Sarah J.",
    location: "San Francisco",
    rating: 5,
    date: "May 22, 2026",
    comment: "Absolutely incredible experience! The service was lighting fast and the atmosphere was unmatched.",
    platform: "Yelp Core",
  },
  {
    id: "2",
    author: "Michael K.",
    location: "New York",
    rating: 2,
    date: "May 20, 2026",
    comment: "The food quality was sub-par for the pricing structure. Under-seasoned options all around.",
    platform: "Google Maps",
  },
  {
    id: "3",
    author: "Elena R.",
    location: "Chicago",
    rating: 4,
    date: "May 19, 2026",
    comment: "Very well managed location. Restrooms were spotless and booking via OpenTable was seamless.",
    platform: "OpenTable",
  },
];

export default function Reviews() {
  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkActiveSession = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";
      setActiveRestaurant(saved);
    };
    checkActiveSession();
    window.addEventListener("storage", checkActiveSession);
    return () => window.removeEventListener("storage", checkActiveSession);
  }, []);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);

        const data = await getReviews({
          limit: 100,
        });

        if (!data) return;

        if (activeRestaurant === "all") {
          setReviews(data);
        } else {
          const filtered = data.filter((r: any) => {
            if (!r.business_name) return false;

            return r.business_name.trim().toLowerCase() === activeRestaurant.trim().toLowerCase();
          });

          setReviews(filtered);
        }
      } catch (err) {
        console.error("Review sync error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [activeRestaurant]);

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "all" || r.review_stars?.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <DashboardLayout>
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

      <PageHeader
        eyebrow="Feedback"
        title="Customer Reviews Log"
        subtitle="Chronological feed of ingested unstructured comments passing through sentiment processing modules."
      />

      {/* FILTER PANEL GRID */}
      <div className="glass-card mb-6 flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search text contents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-foreground/[0.08] bg-white/50 py-1.5 pr-4 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-lg border border-foreground/[0.08] bg-white/50 px-3 py-1.5 text-xs text-foreground font-medium focus:outline-hidden cursor-pointer"
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

      {/* REVIEWS LIST RENDERING */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="glass-card p-12 text-center text-muted-foreground text-xs">
            No matching unstructured text feedback found for current filters.
          </div>
        ) : (
          Reemplaza TODO desde:

filteredReviews.map((r, i) => (

hasta el final del archivo por esto EXACTO:

        {loading ? (
          <div className="glass-card p-10 text-center text-sm text-muted-foreground">
            Loading live Yelp review stream...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="glass-card p-10 text-center text-sm text-muted-foreground">
            No reviews found for current filters.
          </div>
        ) : (
          filteredReviews.map((r, i) => (
            <motion.div
              key={r.review_id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5 hover:shadow-xs transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-foreground">
                      {r.business_name || "Unknown Restaurant"}
                    </span>

                    <span className="text-[10px] text-muted-foreground font-medium bg-foreground/[0.04] px-2 py-0.5 rounded-md">
                      {r.city || "Unknown City"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3 w-3 ${
                            idx < Number(r.review_stars || 0)
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-[11px] text-muted-foreground font-data">
                      {r.date || "No date"}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary capitalize">
                  {r.sentiment_binary || "unknown"}
                </span>
              </div>

              <p className="mt-3.5 text-xs text-foreground/85 leading-relaxed">
                "{r.text || "No review text available"}"
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-foreground/[0.02] pt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Processed Log
                </span>

                <button className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                  <ThumbsUp className="h-3 w-3" />
                  Helpful index
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

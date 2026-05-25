import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

import { Search, Star, MessageSquare, Building2, ThumbsUp } from "lucide-react";

import { getReviews } from "@/apiService";

export default function Reviews() {
  // =========================================================
  // STATE
  // =========================================================

  const [activeRestaurant, setActiveRestaurant] = useState<string>("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [ratingFilter, setRatingFilter] = useState("all");

  const [reviews, setReviews] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // ACTIVE RESTAURANT SYNC
  // =========================================================

  useEffect(() => {
    const syncRestaurant = () => {
      const saved = localStorage.getItem("selected_yelp_restaurant") || "all";

      console.log("DEBUG_ACTIVE_RESTAURANT", saved);

      setActiveRestaurant(saved);
    };

    syncRestaurant();

    window.addEventListener("storage", syncRestaurant);

    return () => {
      window.removeEventListener("storage", syncRestaurant);
    };
  }, []);

  // =========================================================
  // FETCH REVIEWS
  // =========================================================

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);

        const data = await getReviews({
          limit: 100,
        });

        console.log("DEBUG_REAL_REVIEWS", data);

        if (!Array.isArray(data)) {
          console.error("INVALID_REVIEWS_PAYLOAD", data);

          setReviews([]);
          return;
        }

        const normalized = data.map((r: any, i: number) => ({
          // =================================================
          // IMPORTANT:
          // FORCE UNIQUE IDS
          // =================================================

          id: `review-${i}-${Date.now()}`,

          business_name: String(r?.business_name || "Unknown Restaurant"),

          city: String(r?.city || r?.location || "Unknown City"),

          text: String(r?.text || r?.comment || "No review text available"),

          review_stars: Number(r?.review_stars || r?.rating || 0),

          date: String(r?.date || "No date"),

          sentiment_binary: String(r?.sentiment_binary || "unknown"),
        }));

        console.log("DEBUG_NORMALIZED_REVIEWS", normalized);

        console.log(
          "DEBUG_AVAILABLE_RESTAURANTS",
          normalized.map((r: any) => r.business_name),
        );

        console.log("DEBUG_TOTAL_REVIEWS", normalized.length);

        setReviews(normalized);
      } catch (err) {
        console.error("REVIEWS_FETCH_ERROR", err);

        setReviews([]);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  // =========================================================
  // RESTAURANT FILTER
  // =========================================================

  const restaurantFilteredReviews =
    activeRestaurant === "all"
      ? reviews
      : reviews.filter((r) => {
          const business = String(r.business_name || "")
            .trim()
            .toLowerCase();

          const active = String(activeRestaurant || "")
            .trim()
            .toLowerCase();

          const match = business.includes(active) || active.includes(business);

          return match;
        });

  // =========================================================
  // SEARCH + RATING FILTER
  // =========================================================

  const filteredReviews = restaurantFilteredReviews.filter((r) => {
    const matchesSearch =
      r.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.business_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === "all" || String(r.review_stars) === ratingFilter;

    return matchesSearch && matchesRating;
  });

  console.log("FINAL_FILTERED_REVIEWS", filteredReviews);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Feedback"
        title="Customer Reviews Log"
        subtitle={
          activeRestaurant === "all"
            ? "Global synchronized review stream."
            : `Filtered review stream for ${activeRestaurant}.`
        }
      />

      <div className="p-6 space-y-6">
        {/* FILTERS */}

        <div className="flex gap-4 flex-wrap">
          {/* SEARCH */}

          <div className="relative w-full sm:w-72">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-foreground/[0.08] bg-white/50 py-2 pr-4 pl-9 text-sm"
            />
          </div>

          {/* RATING FILTER */}

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-lg border border-foreground/[0.08] bg-white/50 px-3 py-2 text-sm"
          >
            <option value="all">All Ratings</option>

            <option value="5">5 Stars</option>

            <option value="4">4 Stars</option>

            <option value="3">3 Stars</option>

            <option value="2">2 Stars</option>

            <option value="1">1 Star</option>
          </select>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="glass-card p-10 text-center text-sm text-muted-foreground">Loading live review stream...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="glass-card p-10 text-center text-sm text-muted-foreground">No reviews found.</div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((r, i) => (
              <motion.div
                key={`${r.id}-${i}`}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: i * 0.04,
                }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* LEFT */}

                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />

                      <span className="font-semibold">{r.business_name}</span>

                      <span className="text-xs text-muted-foreground">{r.city}</span>
                    </div>

                    {/* STARS */}

                    <div className="flex gap-1 mt-2">
                      {Array.from({
                        length: 5,
                      }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3 w-3 ${
                            idx < r.review_stars ? "fill-warning text-warning" : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>

                    {/* TEXT */}

                    <p className="mt-4 text-sm">"{r.text}"</p>
                  </div>

                  {/* RIGHT */}

                  <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary capitalize">
                    {r.sentiment_binary}
                  </span>
                </div>

                {/* FOOTER */}

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-foreground/[0.04] pt-3">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />

                    <span>Processed Log</span>
                  </span>

                  <button className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />

                    <span>Helpful index</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

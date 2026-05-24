import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Filter, MessageCircle, Building } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getReviews, Review } from "../apiService";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    getReviews({ sentiment: sentimentFilter, limit: 100 }).then((data) => {
      setReviews(data);
      setLoading(false);
    });
  }, [sentimentFilter]);

  // Filtrado extra por buscador local (nombre de restaurante o texto)
  const filteredReviews = reviews.filter((r) => 
    r.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Data"
        title="Customer Reviews"
        subtitle="Browse and search through real historical customer feedback processed by the sentiment classifier."
      />

      {/* FILTERS BAR */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white/40 p-4 rounded-2xl backdrop-blur-md border border-white/60">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by restaurant or text content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/60 pl-10 pr-4 py-2 text-sm rounded-xl border border-foreground/[0.06] focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="bg-white/60 text-sm rounded-xl border border-foreground/[0.06] px-3 py-2 focus:outline-none"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive Only</option>
            <option value="negative">Negative Only</option>
          </select>
        </div>
      </div>

      {/* REVIEWS LIST */}
      {loading ? (
        <div className="text-center py-20 text-sm text-muted-foreground animate-pulse">
          Loading processed Yelp reviews...
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.slice(0, 30).map((review, idx) => (
            <motion.div
              key={review.review_id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              className="glass-card p-5 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-foreground/[0.03] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground text-sm">{review.business_name}</span>
                  <span className="text-xs text-muted-foreground bg-foreground/[0.04] px-2 py-0.5 rounded-full">
                    {review.city}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= review.review_stars ? "fill-warning text-warning" : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      review.sentiment_binary === "positive"
                        ? "bg-positive/10 text-positive"
                        : "bg-negative/10 text-negative"
                    }`}
                  >
                    {review.sentiment_binary}
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed italic">"{review.text}"</p>
              {review.factor_dominante && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Dominant Factor: <strong className="text-foreground capitalize">{review.factor_dominante}</strong></span>
                </div>
              )}
            </motion.div>
          ))}
          {filteredReviews.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No reviews found matching your search.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

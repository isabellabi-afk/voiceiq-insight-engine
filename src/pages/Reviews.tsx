import { useState } from "react";
import { motion } from "framer-motion";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

import { Search, Star, MessageSquare, Building2, ThumbsUp } from "lucide-react";

const mockReviews = [
  {
    id: "1",
    business_name: "El Charro Cafe",
    city: "Tucson",
    text: "Amazing tacos and great atmosphere.",
    review_stars: 5,
    date: "2026-05-22",
    sentiment_binary: "positive",
  },
  {
    id: "2",
    business_name: "Pizza Roma",
    city: "Chicago",
    text: "Service was slow but food was decent.",
    review_stars: 3,
    date: "2026-05-20",
    sentiment_binary: "neutral",
  },
];

export default function Reviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  const filteredReviews = mockReviews.filter((r) => {
    const matchesSearch =
      r.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.business_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === "all" || String(r.review_stars) === ratingFilter;

    return matchesSearch && matchesRating;
  });

  return (
    <DashboardLayout>
      <PageHeader eyebrow="Feedback" title="Customer Reviews Log" subtitle="Review reconstruction phase." />

      <div className="p-6 space-y-6">
        {/* FILTERS */}

        <div className="flex gap-4">
          <div className="relative w-72">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-foreground/[0.08] bg-white/50 py-2 pr-4 pl-9 text-sm"
            />
          </div>

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

        {/* REVIEW LIST */}

        <div className="space-y-4">
          {filteredReviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: i * 0.05,
              }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />

                    <span className="font-semibold">{r.business_name}</span>

                    <span className="text-xs text-muted-foreground">{r.city}</span>
                  </div>

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
                </div>

                <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary capitalize">
                  {r.sentiment_binary}
                </span>
              </div>

              <p className="mt-4 text-sm">"{r.text}"</p>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
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
      </div>
    </DashboardLayout>
  );
}

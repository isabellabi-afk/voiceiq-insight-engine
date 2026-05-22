import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, Filter, MessageSquare } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReviews, type Review } from "../apiService";

const PAGE_SIZE = 25;

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState<string>("all");
  const [city, setCity] = useState<string>("all");
  const [stars, setStars] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getReviews().then((data) => {
      setReviews(data);
      setLoading(false);
    });
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(reviews.map((r) => r.city).filter(Boolean))).sort(),
    [reviews],
  );

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (sentiment !== "all" && r.sentiment_binary !== sentiment) return false;
      if (city !== "all" && r.city !== city) return false;
      if (stars !== "all" && Math.round(r.review_stars) !== Number(stars)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.business_name?.toLowerCase().includes(q) &&
          !r.text?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [reviews, sentiment, city, stars, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, sentiment, city, stars]);

  const sentimentBadge = (s: string) => {
    if (s === "positive")
      return "bg-positive/15 text-positive";
    if (s === "negative") return "bg-negative/15 text-negative";
    return "bg-warning/15 text-warning";
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Reviews"
        title="Review Explorer"
        subtitle="Browse, filter and analyze every customer review from the live dataset."
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mb-6 p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search business or review text…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border-white/60 bg-white/50 pl-9 backdrop-blur-xl"
            />
          </div>

          <Select value={sentiment} onValueChange={setSentiment}>
            <SelectTrigger className="w-[160px] rounded-full border-white/60 bg-white/50 backdrop-blur-xl">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sentiment</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stars} onValueChange={setStars}>
            <SelectTrigger className="w-[140px] rounded-full border-white/60 bg-white/50 backdrop-blur-xl">
              <SelectValue placeholder="Stars" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stars</SelectItem>
              {[5, 4, 3, 2, 1].map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} stars
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[180px] rounded-full border-white/60 bg-white/50 backdrop-blur-xl">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            {loading ? "Loading…" : `${filtered.length.toLocaleString()} of ${reviews.length.toLocaleString()} reviews`}
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/40 hover:bg-transparent">
              <TableHead>Business</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[100px]">Stars</TableHead>
              <TableHead className="w-[120px]">Sentiment</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  Loading reviews…
                </TableCell>
              </TableRow>
            )}
            {!loading && pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  <MessageSquare className="mx-auto mb-2 h-5 w-5 opacity-50" />
                  No reviews match these filters.
                </TableCell>
              </TableRow>
            )}
            {pageData.map((r) => (
              <TableRow key={r.review_id} className="border-white/40">
                <TableCell className="font-medium text-foreground">{r.business_name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {r.city}, {r.state}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 font-data text-sm">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {r.review_stars}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sentimentBadge(
                      r.sentiment_binary,
                    )}`}
                  >
                    {r.sentiment_binary}
                  </span>
                </TableCell>
                <TableCell className="max-w-[500px] text-sm text-foreground/80">
                  <p className="line-clamp-2">{r.text}</p>
                </TableCell>
                <TableCell className="font-data text-xs text-muted-foreground">
                  {r.date?.slice(0, 10)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/40 px-4 py-3 text-xs text-muted-foreground">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full border border-white/60 bg-white/60 px-3 py-1 font-medium text-foreground backdrop-blur-xl hover:bg-white/80 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-white/60 bg-white/60 px-3 py-1 font-medium text-foreground backdrop-blur-xl hover:bg-white/80 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

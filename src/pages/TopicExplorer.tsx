import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Users,
  Home,
  DollarSign,
  Clock,
  Sparkles,
  Star,
  ThumbsUp,
  Calendar,
  Filter,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getTopicData } from "../apiService";

const iconMap: Record<string, any> = {
  food: ChefHat,
  service: Users,
  ambiance: Home,
  value: DollarSign,
  wait: Clock,
  clean: Sparkles,
};

function isValidNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

function formatNumber(value: unknown) {
  if (!isValidNumber(value)) return "N/A";
  return Number(value).toLocaleString();
}

function formatPercent(value: unknown) {
  if (!isValidNumber(value)) return "N/A";
  return `${Math.round(Number(value))}%`;
}

function SentimentGauge({ value }: { value: number | null }) {
  const safeValue =
    value === null || Number.isNaN(Number(value))
      ? 0
      : Math.max(0, Math.min(100, Number(value)));

  const angle = (safeValue / 100) * 180 - 90;

  return (
    <div className="relative mx-auto w-56">
      <svg viewBox="0 0 200 130" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="hsl(var(--negative))" />
            <stop offset="50%" stopColor="hsl(var(--warning))" />
            <stop offset="100%" stopColor="hsl(var(--positive))" />
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
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "100px 100px", transformBox: "view-box" }}
        />
        <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
        <text
          x="100"
          y="122"
          textAnchor="middle"
          className="font-data fill-foreground"
          style={{ fontSize: "18px", fontWeight: 700 }}
        >
          {value === null ? "N/A" : `${safeValue}%`}
        </text>
      </svg>
      <p className="-mt-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        Positive
      </p>
    </div>
  );
}

function StarRow({ count }: { count: number | null }) {
  const safeCount =
    count === null || Number.isNaN(Number(count))
      ? 0
      : Math.max(0, Math.min(5, Number(count)));

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= safeCount
              ? "fill-warning text-warning"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

const filterChip =
  "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-white/[0.08] transition-colors";

export default function TopicExplorer() {
  const [selected, setSelected] = useState<string>("");
  const [themes, setThemes] = useState<any[]>([]);
  const [deepDiveData, setDeepDiveData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopicData()
      .then((data) => {
        const apiThemes = Array.isArray(data?.themes) ? data.themes : [];
        const apiDeepDive =
          data?.deepDiveData && typeof data.deepDiveData === "object"
            ? data.deepDiveData
            : {};

        setThemes(apiThemes);
        setDeepDiveData(apiDeepDive);

        if (apiThemes.length > 0) {
          setSelected(apiThemes[0].id || "");
        }
      })
      .catch((error) => {
        console.error("Error loading topic data:", error);
        setThemes([]);
        setDeepDiveData({});
      })
      .finally(() => setLoading(false));
  }, []);

  const current = themes.find((theme) => theme.id === selected) || null;
  const data = selected ? deepDiveData[selected] : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading Web Intelligence topics...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Sentiment"
        title="Customer Sentiment Analysis"
        subtitle="This page is ready for Web Intelligence topic, keyword, and representative review data."
      />

      <div className="glass-card mb-6 flex flex-wrap items-center gap-2 p-3">
        <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Filters
        </div>
        <button className={filterChip}>
          <Calendar className="mr-1 inline h-3 w-3" /> Date range
        </button>
        <button className={filterChip}>All sentiment</button>
        <button className={filterChip}>All ratings</button>
        <button className={filterChip}>Sort</button>
      </div>

      {themes.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">
            No topic intelligence available yet.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This section will populate once the Web Intelligence API returns
            themes, sentiment scores, keywords, and representative reviews.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Sentiment Themes
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {themes.map((theme: any, index: number) => {
                const themeId = theme.id || `theme-${index}`;
                const active = selected === theme.id;
                const IconComponent = iconMap[theme.id] || Sparkles;
                const sentiment = isValidNumber(theme.sentiment)
                  ? Number(theme.sentiment)
                  : null;

                return (
                  <button
                    key={themeId}
                    onClick={() => setSelected(theme.id)}
                    className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
                      active
                        ? "border-primary/60 bg-primary/[0.08] glow-insight"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          active
                            ? "bg-primary/20 text-primary"
                            : "bg-white/5 text-foreground/80"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>

                      <span
                        className={`font-data text-xs font-semibold ${
                          sentiment === null
                            ? "text-muted-foreground"
                            : sentiment >= 70
                              ? "text-positive"
                              : sentiment >= 50
                                ? "text-warning"
                                : "text-negative"
                        }`}
                      >
                        {formatPercent(sentiment)}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-foreground">
                      {theme.label || theme.name || "Untitled theme"}
                    </p>
                    <p className="mt-1 font-data text-xs text-muted-foreground">
                      {formatNumber(theme.mentions)} mentions
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {current && (
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="glass-card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                          Theme Deep Dive
                        </p>
                        <h3 className="mt-1 font-display text-2xl font-bold">
                          {current.label || current.name || "Untitled theme"}
                        </h3>
                      </div>
                      <SentimentGauge
                        value={
                          isValidNumber(current.sentiment)
                            ? Number(current.sentiment)
                            : null
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Mentions
                        </p>
                        <p className="font-data text-lg font-bold text-foreground">
                          {formatNumber(current.mentions)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Positive
                        </p>
                        <p className="font-data text-lg font-bold text-positive">
                          {formatNumber(current.positive_mentions)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Negative
                        </p>
                        <p className="font-data text-lg font-bold text-negative">
                          {formatNumber(current.negative_mentions)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="glass-card p-5">
                      <h4 className="mb-3 text-sm font-semibold text-positive">
                        Positive Signals
                      </h4>
                      {Array.isArray(data?.positive) && data.positive.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {data.positive.map((term: string) => (
                            <span
                              key={term}
                              className="rounded-full border border-positive/30 bg-positive/10 px-3 py-1 text-xs font-medium text-positive"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No positive signals available.
                        </p>
                      )}
                    </div>

                    <div className="glass-card p-5">
                      <h4 className="mb-3 text-sm font-semibold text-negative">
                        Negative Signals
                      </h4>
                      {Array.isArray(data?.negative) && data.negative.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {data.negative.map((term: string) => (
                            <span
                              key={term}
                              className="rounded-full border border-negative/30 bg-negative/10 px-3 py-1 text-xs font-medium text-negative"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No negative signals available.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h4 className="mb-4 font-display text-base font-semibold">
                      Representative Reviews
                    </h4>

                    {Array.isArray(data?.reviews) && data.reviews.length > 0 ? (
                      <div className="space-y-3">
                        {data.reviews.map((review: any, i: number) => (
                          <motion.div
                            key={review.review_id || i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <StarRow
                                  count={
                                    isValidNumber(review.stars)
                                      ? Number(review.stars)
                                      : isValidNumber(review.review_stars)
                                        ? Number(review.review_stars)
                                        : null
                                  }
                                />
                                <span className="text-xs text-muted-foreground">
                                  {review.date
                                    ? String(review.date).slice(0, 10)
                                    : "N/A"}
                                </span>
                              </div>

                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  String(review.sentiment).toLowerCase() ===
                                  "positive"
                                    ? "bg-positive/15 text-positive"
                                    : "bg-negative/15 text-negative"
                                }`}
                              >
                                {review.sentiment || "unknown"}
                              </span>
                            </div>

                            <p className="text-sm text-foreground/90">
                              “{review.text || "No review text available."}”
                            </p>

                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex flex-wrap gap-1.5">
                                {Array.isArray(review.themes) &&
                                  review.themes.map((theme: string) => (
                                    <span
                                      key={theme}
                                      className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                                    >
                                      {theme}
                                    </span>
                                  ))}
                              </div>

                              {review.helpful !== undefined && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <ThumbsUp className="h-3 w-3" />{" "}
                                  {review.helpful}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-8 text-center text-sm text-muted-foreground">
                        No representative reviews available for this theme.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
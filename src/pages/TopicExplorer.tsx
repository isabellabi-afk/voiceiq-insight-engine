import { useState } from "react";
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

const themes = [
  { id: "food", label: "Food Quality", icon: ChefHat, sentiment: 78, mentions: 8429 },
  { id: "service", label: "Service Experience", icon: Users, sentiment: 64, mentions: 6214 },
  { id: "ambiance", label: "Ambiance & Atmosphere", icon: Home, sentiment: 71, mentions: 4103 },
  { id: "value", label: "Value & Pricing", icon: DollarSign, sentiment: 52, mentions: 5891 },
  { id: "wait", label: "Wait Time", icon: Clock, sentiment: 34, mentions: 3782 },
  { id: "clean", label: "Cleanliness", icon: Sparkles, sentiment: 81, mentions: 2156 },
] as const;

type ThemeId = (typeof themes)[number]["id"];

const deepDiveData: Record<
  ThemeId,
  {
    positive: string[];
    negative: string[];
    reviews: { stars: number; date: string; text: string; sentiment: "Positive" | "Negative"; themes: string[]; helpful: number }[];
  }
> = {
  food: {
    positive: ["fresh ingredients", "perfectly seasoned", "generous portions", "authentic flavors", "creative menu", "consistently excellent"],
    negative: ["overcooked", "small portions", "bland", "too salty", "inconsistent quality", "limited options"],
    reviews: [
      { stars: 5, date: "Mar 12, 2026", text: "The pasta carbonara was absolutely divine — creamy, perfectly seasoned, and generous portions that left me satisfied.", sentiment: "Positive", themes: ["Food Quality", "Portions"], helpful: 42 },
      { stars: 2, date: "Mar 8, 2026", text: "The steak was overcooked despite ordering medium rare. For the price, I expected far more attention to detail.", sentiment: "Negative", themes: ["Food Quality", "Value"], helpful: 28 },
      { stars: 5, date: "Mar 4, 2026", text: "Authentic flavors that took me right back to Italy. Their seasonal menu is consistently excellent.", sentiment: "Positive", themes: ["Authenticity", "Menu"], helpful: 64 },
    ],
  },
  service: {
    positive: ["attentive staff", "knowledgeable", "warm welcome", "Maria was amazing", "professional", "quick refills"],
    negative: ["slow service", "ignored us", "rude waiter", "forgot our order", "poor communication", "unattentive"],
    reviews: [
      { stars: 5, date: "Mar 14, 2026", text: "Our server Maria was attentive and knowledgeable — every recommendation was spot on.", sentiment: "Positive", themes: ["Service", "Staff"], helpful: 51 },
      { stars: 2, date: "Mar 10, 2026", text: "Waited 20 minutes just to place a drink order. The staff seemed overwhelmed and disorganized.", sentiment: "Negative", themes: ["Service", "Wait Time"], helpful: 19 },
      { stars: 4, date: "Mar 6, 2026", text: "Great food, friendly servers but the kitchen was clearly backed up that night.", sentiment: "Positive", themes: ["Service"], helpful: 22 },
    ],
  },
  ambiance: {
    positive: ["cozy", "intimate lighting", "beautiful decor", "perfect for date night", "great music", "comfortable seating"],
    negative: ["too loud", "cramped", "uncomfortable chairs", "harsh lighting", "noisy", "tight spacing"],
    reviews: [
      { stars: 5, date: "Mar 11, 2026", text: "Intimate lighting and tasteful music created the perfect date night atmosphere.", sentiment: "Positive", themes: ["Ambiance"], helpful: 38 },
      { stars: 3, date: "Mar 7, 2026", text: "Food was excellent but the noise level made conversation nearly impossible.", sentiment: "Negative", themes: ["Ambiance", "Noise"], helpful: 26 },
      { stars: 4, date: "Mar 2, 2026", text: "Loved the modern decor — felt like a hidden gem in the neighborhood.", sentiment: "Positive", themes: ["Ambiance", "Design"], helpful: 17 },
    ],
  },
  value: {
    positive: ["worth every penny", "great portions for price", "good value", "happy hour deals", "lunch specials"],
    negative: ["overpriced", "expensive for what you get", "small portions for the price", "hidden charges", "not worth it"],
    reviews: [
      { stars: 4, date: "Mar 13, 2026", text: "A bit pricey but the quality justifies it. Happy hour is unbeatable.", sentiment: "Positive", themes: ["Value", "Pricing"], helpful: 33 },
      { stars: 2, date: "Mar 9, 2026", text: "$28 for a tiny pasta bowl? Quality was fine but value just isn't there.", sentiment: "Negative", themes: ["Value", "Portions"], helpful: 41 },
      { stars: 3, date: "Mar 1, 2026", text: "Good food but you're paying mostly for the location.", sentiment: "Negative", themes: ["Value"], helpful: 14 },
    ],
  },
  wait: {
    positive: ["quick seating", "no wait", "efficient service", "got us in fast"],
    negative: ["45 minute wait", "long line", "even with reservation", "no estimate given", "ignored on waitlist"],
    reviews: [
      { stars: 2, date: "Mar 15, 2026", text: "Waited 45 minutes for a table despite having a reservation. No apology, no update.", sentiment: "Negative", themes: ["Wait Time", "Reservations"], helpful: 58 },
      { stars: 4, date: "Mar 5, 2026", text: "Got seated immediately on a Tuesday. Weekends are a whole different story.", sentiment: "Positive", themes: ["Wait Time"], helpful: 12 },
      { stars: 1, date: "Feb 28, 2026", text: "Stood at the door for 15 minutes before anyone even acknowledged us.", sentiment: "Negative", themes: ["Wait Time", "Service"], helpful: 47 },
    ],
  },
  clean: {
    positive: ["spotless", "immaculate restrooms", "clean tables", "fresh feeling", "well kept"],
    negative: ["sticky tables", "dirty bathroom", "dusty corners", "needs maintenance"],
    reviews: [
      { stars: 5, date: "Mar 12, 2026", text: "Spotless from the entry to the restrooms. You can tell management cares.", sentiment: "Positive", themes: ["Cleanliness"], helpful: 24 },
      { stars: 4, date: "Mar 6, 2026", text: "Modern, clean, and well-maintained interior.", sentiment: "Positive", themes: ["Cleanliness", "Ambiance"], helpful: 11 },
      { stars: 2, date: "Mar 3, 2026", text: "Bathroom was poorly maintained — out of soap and floors needed mopping.", sentiment: "Negative", themes: ["Cleanliness"], helpful: 16 },
    ],
  },
};

function SentimentGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180 - 90;
  return (
    <div className="relative mx-auto h-32 w-56">
      <svg viewBox="0 0 200 110" className="h-full w-full">
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
          style={{ transformOrigin: "100px 100px" }}
        />
        <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-data text-2xl font-bold text-foreground">{value}%</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Positive</p>
      </div>
    </div>
  );
}

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= count ? "fill-warning text-warning" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

const filterChip =
  "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-white/[0.08] transition-colors";

export default function TopicExplorer() {
  const [selected, setSelected] = useState<ThemeId>("food");
  const current = themes.find((t) => t.id === selected)!;
  const data = deepDiveData[selected];

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Sentiment"
        title="Customer Sentiment Analysis"
        subtitle="Understand what your customers truly feel — across every theme and conversation."
      />

      <div className="glass-card mb-6 flex flex-wrap items-center gap-2 p-3">
        <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Filters
        </div>
        <button className={filterChip}>
          <Calendar className="mr-1 inline h-3 w-3" /> Last 30 days
        </button>
        <button className={filterChip}>All sentiment</button>
        <button className={filterChip}>All ratings</button>
        <button className={filterChip}>Sort: Most recent</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Sentiment Themes
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {themes.map((t) => {
              const active = selected === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
                    active
                      ? "border-primary/60 bg-primary/[0.08] glow-insight"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        active ? "bg-primary/20 text-primary" : "bg-white/5 text-foreground/80"
                      }`}
                    >
                      <t.icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`font-data text-xs font-semibold ${
                        t.sentiment >= 70
                          ? "text-positive"
                          : t.sentiment >= 50
                          ? "text-warning"
                          : "text-negative"
                      }`}
                    >
                      {t.sentiment}%
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="mt-1 font-data text-xs text-muted-foreground">
                    {t.mentions.toLocaleString()} mentions
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
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
                    <h3 className="mt-1 font-display text-2xl font-bold">{current.label}</h3>
                  </div>
                  <SentimentGauge value={current.sentiment} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mentions</p>
                    <p className="font-data text-lg font-bold text-foreground">
                      {current.mentions.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Positive</p>
                    <p className="font-data text-lg font-bold text-positive">
                      {Math.round((current.mentions * current.sentiment) / 100).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Negative</p>
                    <p className="font-data text-lg font-bold text-negative">
                      {Math.round((current.mentions * (100 - current.sentiment)) / 100).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="glass-card p-5">
                  <h4 className="mb-3 text-sm font-semibold text-positive">Positive Signals</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.positive.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-positive/30 bg-positive/10 px-3 py-1 text-xs font-medium text-positive"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="glass-card p-5">
                  <h4 className="mb-3 text-sm font-semibold text-negative">Negative Signals</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.negative.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-negative/30 bg-negative/10 px-3 py-1 text-xs font-medium text-negative"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h4 className="mb-4 font-display text-base font-semibold">Representative Reviews</h4>
                <div className="space-y-3">
                  {data.reviews.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StarRow count={r.stars} />
                          <span className="text-xs text-muted-foreground">{r.date}</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            r.sentiment === "Positive"
                              ? "bg-positive/15 text-positive"
                              : "bg-negative/15 text-negative"
                          }`}
                        >
                          {r.sentiment}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90">"{r.text}"</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {r.themes.map((th) => (
                            <span
                              key={th}
                              className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                            >
                              {th}
                            </span>
                          ))}
                        </div>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" /> {r.helpful}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}

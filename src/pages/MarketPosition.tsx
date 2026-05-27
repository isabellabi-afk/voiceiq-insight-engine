import { motion } from "framer-motion";
import {
  Star,
  Megaphone,
  TrendingUp,
  Trophy,
  Zap,
  AlertOctagon,
  Eye,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

const compCards = [
  {
    title: "Market Standing",
    icon: Trophy,
    rows: [
      { label: "Your rating", value: "4.2 ★", tone: "positive" },
      { label: "Category avg", value: "3.8 ★" },
      { label: "Percentile", value: "Top 15%", tone: "positive" },
    ],
  },
  {
    title: "Share of Voice",
    icon: Megaphone,
    rows: [
      { label: "Your mentions", value: "12,847" },
      { label: "Category total", value: "89,234" },
      { label: "Share", value: "14.4%", tone: "positive" },
    ],
  },
  {
    title: "Sentiment vs Competition",
    icon: TrendingUp,
    rows: [
      { label: "Your NPS", value: "+42", tone: "positive" },
      { label: "Competitor A", value: "+28" },
      { label: "Competitor B", value: "+31" },
      { label: "Category avg", value: "+24" },
    ],
  },
] as const;

type Quadrant = {
  title: string;
  subtitle: string;
  icon: typeof Trophy;
  tone: "positive" | "warning" | "negative" | "muted";
  items: { name: string; meta: string; recommendation: string; impact?: string }[];
};

const matrix: Quadrant[] = [
  {
    title: "Strengths to Leverage",
    subtitle: "High volume × High sentiment",
    icon: Trophy,
    tone: "positive",
    items: [
      { name: "Authentic Cuisine", meta: "3,421 mentions · 91% positive", recommendation: "Highlight in marketing, create signature dish campaign" },
      { name: "Friendly Staff", meta: "2,847 mentions · 88% positive", recommendation: "Feature staff stories on social media" },
      { name: "Unique Atmosphere", meta: "1,923 mentions · 86% positive", recommendation: "Emphasize in photos, consider events" },
    ],
  },
  {
    title: "Quick Wins",
    subtitle: "Low volume × High sentiment",
    icon: Zap,
    tone: "warning",
    items: [
      { name: "Outdoor Seating", meta: "892 mentions · 74% positive", recommendation: "Expand capacity, improve comfort" },
      { name: "Happy Hour Deals", meta: "654 mentions · 71% positive", recommendation: "Promote more heavily, extend hours" },
    ],
  },
  {
    title: "Critical Issues",
    subtitle: "High volume × Low sentiment",
    icon: AlertOctagon,
    tone: "negative",
    items: [
      { name: "Long Wait Times", meta: "3,782 mentions · 34% positive", impact: "−12 NPS pts · losing 8% of potential customers", recommendation: "Implement OpenTable, add bar seating, optimize kitchen flow" },
      { name: "Inconsistent Portions", meta: "1,234 mentions · 41% positive", impact: "Drives price complaints, affects repeat visits", recommendation: "Standardize plating, train kitchen staff, use portion tools" },
    ],
  },
  {
    title: "Monitor",
    subtitle: "Low volume × Mixed sentiment",
    icon: Eye,
    tone: "muted",
    items: [
      { name: "Parking Availability", meta: "445 mentions · 58% positive", recommendation: "Partner with nearby lots, provide validation" },
    ],
  },
];

const toneStyles: Record<Quadrant["tone"], { border: string; chip: string; icon: string; bar: string }> = {
  positive: { border: "border-positive/30", chip: "bg-positive/15 text-positive", icon: "text-positive", bar: "gradient-positive" },
  warning: { border: "border-warning/30", chip: "bg-warning/15 text-warning", icon: "text-warning", bar: "gradient-warning" },
  negative: { border: "border-negative/30", chip: "bg-negative/15 text-negative", icon: "text-negative", bar: "gradient-negative" },
  muted: { border: "border-white/10", chip: "bg-white/10 text-muted-foreground", icon: "text-muted-foreground", bar: "bg-muted" },
};

const priorities = [
  {
    n: 1,
    title: "Reduce Wait Times",
    impact: "−$48K/month in lost revenue",
    improvement: "+15 NPS points",
    steps: [
      { t: "Install reservation system", meta: "2 weeks · $2K" },
      { t: "Add 6 bar seats for waiting guests", meta: "4 weeks · $8K" },
      { t: "Optimize kitchen workflow", meta: "ongoing · $0" },
    ],
    roi: "4.2× within 6 months",
  },
  {
    n: 2,
    title: "Standardize Food Quality",
    impact: "34% of negative reviews",
    improvement: "+8 NPS points",
    steps: [
      { t: "Document all recipes with photos", meta: "2 weeks · $500" },
      { t: "Implement kitchen quality checks", meta: "1 week · $200" },
      { t: "Weekly training sessions", meta: "ongoing · $400/mo" },
    ],
    roi: "3.8× within 4 months",
  },
  {
    n: 3,
    title: "Enhance Value Perception",
    impact: "58% mention pricing concerns",
    improvement: "+12% retention",
    steps: [
      { t: "Introduce lunch specials", meta: "immediate · $0" },
      { t: "Increase portion sizes by 15%", meta: "1 week · $1.2K/mo" },
      { t: "Create shareable appetizer platters", meta: "2 weeks · $600" },
    ],
    roi: "2.9× within 3 months",
  },
];

export default function MarketPosition() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Intelligence"
        title="See How Customers Perceive Your Restaurant"
        subtitle="Real-time analysis combining Yelp reviews + web sentiment from across the market."
      />

      {/* Competitive cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {compCards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">{c.title}</h3>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                <c.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="space-y-2.5">
              {c.rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span
                    className={`font-data font-semibold ${
                      "tone" in r && r.tone === "positive" ? "text-positive" : "text-foreground"
                    }`}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Matrix */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold">Strengths & Weaknesses Matrix</h2>
        <p className="text-sm text-muted-foreground">A 2×2 view of every theme by volume and sentiment.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {matrix.map((q, i) => {
            const style = toneStyles[q.tone];
            return (
              <motion.div
                key={q.title}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`glass-card relative overflow-hidden p-5 ${style.border}`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${style.bar}`} />
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold">{q.title}</h3>
                    <p className="text-xs text-muted-foreground">{q.subtitle}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${style.icon}`}>
                    <q.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-3">
                  {q.items.map((item) => (
                    <div key={item.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.chip}`}>
                          {q.tone === "positive" ? "Strength" : q.tone === "warning" ? "Quick win" : q.tone === "negative" ? "Critical" : "Watch"}
                        </span>
                      </div>
                      <p className="mt-0.5 font-data text-[11px] text-muted-foreground">{item.meta}</p>
                      {item.impact && (
                        <p className="mt-1.5 text-xs text-negative">Impact: {item.impact}</p>
                      )}
                      <p className="mt-2 text-xs text-foreground/80">
                        <span className="font-semibold text-primary">→</span> {item.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Action plan */}
      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-display text-xl font-bold">AI-Powered Action Plan</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {priorities.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover relative overflow-hidden p-5"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Priority {p.n}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold">{p.title}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-insight">
                  <Star className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact</p>
                  <p className="mt-0.5 text-foreground">{p.impact}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.03] p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Estimate</p>
                  <p className="mt-0.5 text-positive">{p.improvement}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {p.steps.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-xs text-foreground">{s.t}</p>
                      <p className="font-data text-[10px] text-muted-foreground">{s.meta}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-positive/20 bg-positive/5 px-3 py-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Expected ROI</span>
                <span className="flex items-center gap-1 font-data text-sm font-bold text-positive">
                  {p.roi} <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

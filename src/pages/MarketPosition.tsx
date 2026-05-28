import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Megaphone,
  TrendingUp,
  Trophy,
  Zap,
  AlertOctagon,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getMarketPositionFormatted } from "../apiService";

const toneStyles = {
  positive: {
    border: "border-positive/30",
    chip: "bg-positive/15 text-positive",
    icon: "text-positive",
    bar: "gradient-positive",
  },
  warning: {
    border: "border-warning/30",
    chip: "bg-warning/15 text-warning",
    icon: "text-warning",
    bar: "gradient-warning",
  },
  negative: {
    border: "border-negative/30",
    chip: "bg-negative/15 text-negative",
    icon: "text-negative",
    bar: "gradient-negative",
  },
  muted: {
    border: "border-white/10",
    chip: "bg-white/10 text-muted-foreground",
    icon: "text-muted-foreground",
    bar: "bg-muted",
  },
};

const emptyCards = [
  {
    title: "Market Standing",
    icon: Trophy,
    rows: [
      { label: "Your rating", value: "N/A" },
      { label: "Category avg", value: "N/A" },
      { label: "Percentile", value: "N/A" },
    ],
  },
  {
    title: "Share of Voice",
    icon: Megaphone,
    rows: [
      { label: "Your mentions", value: "N/A" },
      { label: "Category total", value: "N/A" },
      { label: "Share", value: "N/A" },
    ],
  },
  {
    title: "Sentiment vs Competition",
    icon: TrendingUp,
    rows: [
      { label: "Your NPS", value: "N/A" },
      { label: "Competitor avg", value: "N/A" },
      { label: "Category avg", value: "N/A" },
    ],
  },
];

const quadrants = [
  {
    title: "Strengths to Leverage",
    subtitle: "High volume × High sentiment",
    icon: Trophy,
    tone: "positive" as const,
    emptyText: "No strengths available yet.",
  },
  {
    title: "Quick Wins",
    subtitle: "Low volume × High sentiment",
    icon: Zap,
    tone: "warning" as const,
    emptyText: "No quick wins available yet.",
  },
  {
    title: "Critical Issues",
    subtitle: "High volume × Low sentiment",
    icon: AlertOctagon,
    tone: "negative" as const,
    emptyText: "No critical issues available yet.",
  },
  {
    title: "Monitor",
    subtitle: "Low volume × Mixed sentiment",
    icon: Eye,
    tone: "muted" as const,
    emptyText: "No monitored topics available yet.",
  },
];

export default function MarketPosition() {
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketPositionFormatted()
      .then((data) => setIntelligence(data))
      .catch((error) => {
        console.error("Error loading Web Intelligence data:", error);
        setIntelligence(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = intelligence?.market_position_cards || emptyCards;
  const matrix = intelligence?.strengths_weaknesses_matrix || {};
  const actionPlan = Array.isArray(intelligence?.action_plan)
    ? intelligence.action_plan
    : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
          Loading Web Intelligence data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Intelligence"
        title="See How Customers Perceive Your Restaurant"
        subtitle="This page is ready for Web Intelligence insights once the API provides market perception, strengths, weaknesses, and action plan data."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card: any, i: number) => {
          const Icon = card.icon || emptyCards[i]?.icon || Trophy;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card-hover p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">
                  {card.title}
                </h3>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>

              <div className="space-y-2.5">
                {(card.rows || []).map((row: any) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-data font-semibold text-foreground">
                      {row.value ?? "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold">
          Strengths & Weaknesses Matrix
        </h2>
        <p className="text-sm text-muted-foreground">
          A 2×2 view of customer themes by volume and sentiment.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {quadrants.map((q, i) => {
            const style = toneStyles[q.tone];
            const Icon = q.icon;
            const items = Array.isArray(matrix[q.tone]) ? matrix[q.tone] : [];

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
                    <h3 className="font-display text-lg font-bold">
                      {q.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {q.subtitle}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${style.icon}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item: any, index: number) => (
                      <div
                        key={item.name || index}
                        className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">
                            {item.name}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.chip}`}
                          >
                            {q.title}
                          </span>
                        </div>

                        {item.meta && (
                          <p className="mt-0.5 font-data text-[11px] text-muted-foreground">
                            {item.meta}
                          </p>
                        )}

                        {item.impact && (
                          <p className="mt-1.5 text-xs text-negative">
                            Impact: {item.impact}
                          </p>
                        )}

                        {item.recommendation && (
                          <p className="mt-2 text-xs text-foreground/80">
                            <span className="font-semibold text-primary">
                              →
                            </span>{" "}
                            {item.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-center text-sm text-muted-foreground">
                    {q.emptyText}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="font-display text-xl font-bold">
            AI-Powered Action Plan
          </h2>
        </div>

        {actionPlan.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {actionPlan.map((plan: any, i: number) => (
              <motion.div
                key={plan.title || i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover relative overflow-hidden p-5"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Priority {i + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold">
                  {plan.title}
                </h3>

                {Array.isArray(plan.steps) && (
                  <div className="mt-4 space-y-2">
                    {plan.steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="text-xs text-foreground">
                            {step.t || step.title || step}
                          </p>
                          {step.meta && (
                            <p className="font-data text-[10px] text-muted-foreground">
                              {step.meta}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-sm text-muted-foreground">
            No AI action plan available yet. This section will populate once the
            Web Intelligence API returns recommendations.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
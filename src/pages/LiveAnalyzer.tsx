import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Star,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Users,
  Clock,
  Home,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

const exampleReview =
  "The pasta carbonara was absolutely divine - creamy, perfectly seasoned, and generous portions. Our server Maria was attentive and knowledgeable. However, we waited 45 minutes for a table despite having a reservation, and the noise level made conversation difficult.";

interface Sentence {
  text: string;
  score: number;
  themes: string[];
}

interface Theme {
  label: string;
  icon: typeof ChefHat;
  tone: "positive" | "negative" | "warning";
  confidence: number;
}

interface Result {
  compound: number;
  label: string;
  themes: Theme[];
  sentences: Sentence[];
  similar: { stars: number; text: string; similarity: number; date: string }[];
  actions: { type: "warn" | "ok"; text: string }[];
}

const exampleResult: Result = {
  compound: 0.42,
  label: "Mixed — Positive food/service, negative wait/ambiance",
  themes: [
    { label: "Food Quality", icon: ChefHat, tone: "positive", confidence: 94 },
    { label: "Service", icon: Users, tone: "positive", confidence: 88 },
    { label: "Wait Time", icon: Clock, tone: "negative", confidence: 91 },
    { label: "Ambiance", icon: Home, tone: "warning", confidence: 76 },
  ],
  sentences: [
    {
      text: "The pasta carbonara was absolutely divine - creamy, perfectly seasoned, and generous portions.",
      score: 0.87,
      themes: ["Food Quality", "Portions"],
    },
    {
      text: "Our server Maria was attentive and knowledgeable.",
      score: 0.68,
      themes: ["Service", "Staff"],
    },
    {
      text: "However, we waited 45 minutes for a table despite having a reservation",
      score: -0.72,
      themes: ["Wait Time", "Reservations"],
    },
    {
      text: "the noise level made conversation difficult.",
      score: -0.54,
      themes: ["Ambiance", "Noise"],
    },
  ],
  similar: [
    { stars: 4, text: "Great food but consistently long waits even with a reservation…", similarity: 92, date: "2 weeks ago" },
    { stars: 5, text: "Maria provided excellent service, pasta was amazing — atmosphere lovely…", similarity: 89, date: "1 month ago" },
    { stars: 3, text: "Food quality excellent but atmosphere too loud for conversation…", similarity: 86, date: "3 days ago" },
  ],
  actions: [
    { type: "warn", text: "Address wait time concerns — mentioned in 45% of similar reviews" },
    { type: "ok", text: "Leverage positive food mentions in marketing campaigns" },
    { type: "warn", text: "Consider noise reduction measures — recurring complaint" },
    { type: "ok", text: "Recognize server Maria — consistently praised by guests" },
  ],
};

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= count ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

const toneClasses: Record<Theme["tone"], string> = {
  positive: "border-positive/30 bg-positive/10 text-positive",
  negative: "border-negative/30 bg-negative/10 text-negative",
  warning: "border-warning/30 bg-warning/10 text-warning",
};

export default function LiveAnalyzer() {
  const [text, setText] = useState(exampleReview);
  const [result, setResult] = useState<Result | null>(exampleResult);
  const [analyzing, setAnalyzing] = useState(false);

  const wordCount = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setResult(exampleResult);
      setAnalyzing(false);
    }, 1200);
  };

  const gaugePos = result ? ((result.compound + 1) / 2) * 100 : 50;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Live Analyzer"
        title="Instant Review Intelligence"
        subtitle="Analyze any customer review in real-time using VADER + TF-IDF."
      />

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a customer review here to analyze sentiment, extract themes, and get instant insights..."
          className="min-h-[200px] w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 font-data text-xs text-muted-foreground">
            <span>{text.length} chars</span>
            <span>·</span>
            <span>{wordCount} words</span>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || analyzing}
            className="group flex items-center gap-2 rounded-xl gradient-insight px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${analyzing ? "animate-pulse" : ""}`} />
            {analyzing ? "Analyzing..." : "Analyze Review"}
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="mt-6 space-y-5"
          >
            {/* Section 1: Overall Sentiment */}
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold">Overall Sentiment</h3>
                <span className="font-data text-2xl font-bold text-positive">+{result.compound.toFixed(2)}</span>
              </div>
              <div className="relative">
                <div className="h-3 w-full rounded-full sentiment-gauge-track" />
                <motion.div
                  className="absolute -top-1 h-5 w-1.5 rounded-full bg-foreground shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                  initial={{ left: "50%" }}
                  animate={{ left: `${gaugePos}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  style={{ transform: "translateX(-50%)" }}
                />
              </div>
              <div className="mt-2 flex justify-between font-data text-[10px] text-muted-foreground">
                <span>−1.0</span>
                <span>0</span>
                <span>+1.0</span>
              </div>
              <p className="mt-4 text-sm text-foreground/90">{result.label}</p>
            </div>

            {/* Section 2: Themes */}
            <div className="glass-card p-6">
              <h3 className="mb-4 font-display text-base font-semibold">Theme Detection</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {result.themes.map((t, i) => (
                  <motion.div
                    key={t.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className={`rounded-xl border p-3 ${toneClasses[t.tone]}`}
                  >
                    <div className="flex items-center justify-between">
                      <t.icon className="h-4 w-4" />
                      <span className="font-data text-[10px] uppercase tracking-wider opacity-80">
                        {t.confidence}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{t.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Section 3: Sentence-level */}
            <div className="glass-card p-6">
              <h3 className="mb-4 font-display text-base font-semibold">Sentence-Level Analysis</h3>
              <div className="space-y-3">
                {result.sentences.map((s, i) => {
                  const positive = s.score >= 0;
                  const intensity = Math.min(1, Math.abs(s.score));
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 font-data text-[11px] font-bold ${
                            positive ? "bg-positive/15 text-positive" : "bg-negative/15 text-negative"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {s.score.toFixed(2)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground/90">"{s.text}"</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {s.themes.map((th) => (
                              <span
                                key={th}
                                className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                              >
                                {th}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${intensity * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          className={`h-full rounded-full ${
                            positive ? "gradient-positive" : "gradient-negative"
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Similar Reviews */}
            <div className="glass-card p-6">
              <h3 className="mb-4 font-display text-base font-semibold">Similar Reviews from Database</h3>
              <div className="grid gap-3 lg:grid-cols-3">
                {result.similar.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <StarRow count={r.stars} />
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 font-data text-[10px] font-semibold text-primary">
                        {r.similarity}% match
                      </span>
                    </div>
                    <p className="text-sm text-foreground/85">"{r.text}"</p>
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                      <span className="text-[11px] text-muted-foreground">{r.date}</span>
                      <button className="text-[11px] font-medium text-primary hover:underline">
                        Quick view →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Section 5: Recommended Actions */}
            <div className="glass-card p-6">
              <h3 className="mb-4 font-display text-base font-semibold">Recommended Actions</h3>
              <div className="grid gap-2.5 md:grid-cols-2">
                {result.actions.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className={`flex items-start gap-3 rounded-xl border p-3 ${
                      a.type === "warn"
                        ? "border-warning/25 bg-warning/[0.06]"
                        : "border-positive/25 bg-positive/[0.06]"
                    }`}
                  >
                    {a.type === "warn" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    ) : (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
                    )}
                    <p className="text-sm text-foreground/90">{a.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

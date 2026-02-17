import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Zap, Star } from "lucide-react";

const exampleReview = "The pasta was absolutely delicious and fresh, but we waited over 45 minutes for our table with no explanation from the staff.";

interface AnalysisResult {
  compoundScore: number;
  factors: { label: string; emoji: string; sentiment: "Positive" | "Negative" }[];
  sentences: { text: string; score: number }[];
  similar: { text: string; stars: number; similarity: number }[];
}

const exampleResult: AnalysisResult = {
  compoundScore: 0.31,
  factors: [
    { label: "Food Quality", emoji: "🍕", sentiment: "Positive" },
    { label: "Wait Time", emoji: "⏱️", sentiment: "Negative" },
  ],
  sentences: [
    { text: "The pasta was absolutely delicious and fresh", score: 0.82 },
    { text: "but we waited over 45 minutes for our table with no explanation from the staff.", score: -0.61 },
  ],
  similar: [
    { text: "Food was excellent but the 30 minute wait for a table on a weekday was ridiculous.", stars: 3, similarity: 94 },
    { text: "Amazing flavors and fresh ingredients, though the service was painfully slow.", stars: 3, similarity: 89 },
    { text: "Loved the pasta dishes but had to wait an hour even with a reservation.", stars: 2, similarity: 86 },
  ],
};

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

export default function LiveAnalyzer() {
  const [text, setText] = useState(exampleReview);
  const [result, setResult] = useState<AnalysisResult | null>(exampleResult);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setResult(exampleResult);
      setAnalyzing(false);
    }, 1200);
  };

  const gaugePosition = ((result?.compoundScore ?? 0) + 1) / 2 * 100;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Analyze Any Review in Real Time
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Powered by VADER Sentiment Analysis + TF-IDF Classification
          </p>
        </motion.div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type any customer review here..."
            rows={5}
            className="w-full resize-none rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{text.length} characters</span>
            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || analyzing}
              className="flex items-center gap-2 rounded-lg gradient-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {analyzing ? "Analyzing..." : "Analyze Review"}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              {/* Sentiment gauge */}
              <div className="glass-card p-6">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Sentiment Score</h3>
                <div className="relative">
                  <div className="h-4 w-full rounded-full sentiment-gauge-track overflow-hidden" />
                  <motion.div
                    className="absolute top-0 h-4 w-1 rounded-full bg-foreground shadow-lg"
                    initial={{ left: "50%" }}
                    animate={{ left: `${gaugePosition}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ transform: "translateX(-50%)" }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>-1.0 Negative</span>
                  <span>0 Neutral</span>
                  <span>+1.0 Positive</span>
                </div>
                <p className="mt-3 text-center text-lg font-bold text-foreground">
                  Compound Score: <span className="text-positive">{result.compoundScore}</span>
                </p>
              </div>

              {/* Detected factors */}
              <div className="glass-card p-6">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Detected Factors</h3>
                <div className="flex flex-wrap gap-3">
                  {result.factors.map((f) => (
                    <span
                      key={f.label}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        f.sentiment === "Positive"
                          ? "bg-positive/15 text-positive"
                          : "bg-negative/15 text-negative"
                      }`}
                    >
                      {f.emoji} {f.label} ({f.sentiment})
                    </span>
                  ))}
                </div>
              </div>

              {/* Sentence breakdown */}
              <div className="glass-card p-6">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Sentence-Level Breakdown</h3>
                <div className="space-y-3">
                  {result.sentences.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/30 p-4"
                    >
                      <span
                        className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          s.score >= 0 ? "bg-positive/15 text-positive" : "bg-negative/15 text-negative"
                        }`}
                      >
                        {s.score >= 0 ? "+" : ""}{s.score.toFixed(2)}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">"{s.text}"</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Similar reviews */}
              <div className="glass-card p-6">
                <h3 className="mb-3 text-sm font-semibold text-foreground">Similar Reviews from Dataset</h3>
                <div className="space-y-3">
                  {result.similar.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-4 rounded-lg border border-border/50 bg-secondary/30 p-4"
                    >
                      <div className="flex-1">
                        <StarRating count={s.stars} />
                        <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                        {s.similarity}% match
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

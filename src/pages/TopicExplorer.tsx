import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Star } from "lucide-react";

const topics = [
  { id: "food", label: "Food Quality", emoji: "🍕" },
  { id: "service", label: "Service", emoji: "👥" },
  { id: "ambiance", label: "Ambiance", emoji: "🏠" },
  { id: "price", label: "Price/Value", emoji: "💰" },
  { id: "wait", label: "Wait Time", emoji: "⏱️" },
  { id: "overall", label: "Overall Experience", emoji: "✨" },
];

type TopicId = typeof topics[number]["id"];

interface TopicData {
  sentiment: number;
  positiveWords: string[];
  negativeWords: string[];
  reviews: { stars: number; text: string; sentiment: "Positive" | "Negative"; factor: string }[];
}

const topicDetails: Record<TopicId, TopicData> = {
  food: {
    sentiment: 78,
    positiveWords: ["fresh", "delicious", "amazing", "flavorful", "generous", "authentic", "perfectly cooked", "incredible", "best ever", "mouthwatering"],
    negativeWords: ["bland", "overcooked", "cold", "stale", "small portions", "disappointing", "tasteless", "greasy", "overpriced", "inconsistent"],
    reviews: [
      { stars: 5, text: "The truffle pasta was absolutely incredible — rich, flavorful, and perfectly al dente. Best Italian food I've had in years.", sentiment: "Positive", factor: "Food Quality" },
      { stars: 2, text: "The steak was overcooked and bland. For the price, I expected much better quality ingredients and preparation.", sentiment: "Negative", factor: "Food Quality" },
      { stars: 4, text: "Fresh ingredients and generous portions. The seafood risotto was mouthwatering and authentic.", sentiment: "Positive", factor: "Food Quality" },
    ],
  },
  service: {
    sentiment: 62,
    positiveWords: ["friendly", "attentive", "professional", "welcoming", "prompt", "knowledgeable", "accommodating", "warm", "efficient", "courteous"],
    negativeWords: ["rude", "slow", "inattentive", "dismissive", "unprofessional", "forgetful", "cold", "overwhelmed", "disorganized", "impatient"],
    reviews: [
      { stars: 5, text: "Our server was incredibly attentive and knowledgeable about the menu. Made great wine pairing suggestions.", sentiment: "Positive", factor: "Service" },
      { stars: 1, text: "Waited 20 minutes just to get menus. Server was dismissive and got our order wrong twice.", sentiment: "Negative", factor: "Service" },
      { stars: 4, text: "Staff was warm and welcoming from the moment we walked in. Very professional experience overall.", sentiment: "Positive", factor: "Service" },
    ],
  },
  ambiance: {
    sentiment: 71,
    positiveWords: ["cozy", "elegant", "romantic", "charming", "beautiful", "relaxing", "intimate", "trendy", "atmospheric", "stylish"],
    negativeWords: ["noisy", "cramped", "dingy", "uncomfortable", "sterile", "dark", "crowded", "outdated", "cold", "uninviting"],
    reviews: [
      { stars: 5, text: "Beautiful, intimate setting with soft lighting and elegant décor. Perfect for a romantic dinner.", sentiment: "Positive", factor: "Ambiance" },
      { stars: 2, text: "Way too noisy and cramped. Could barely hear my date across the table. Needs better sound management.", sentiment: "Negative", factor: "Ambiance" },
      { stars: 4, text: "Charming and cozy atmosphere with great attention to detail in the interior design.", sentiment: "Positive", factor: "Ambiance" },
    ],
  },
  price: {
    sentiment: 55,
    positiveWords: ["worth it", "affordable", "good value", "reasonable", "fair", "generous portions", "great deal", "competitive", "budget-friendly", "excellent value"],
    negativeWords: ["overpriced", "expensive", "not worth it", "rip-off", "hidden fees", "small portions", "tourist trap", "outrageous", "unreasonable", "gouging"],
    reviews: [
      { stars: 4, text: "Great value for the quality. Generous portions and reasonable prices for downtown.", sentiment: "Positive", factor: "Price/Value" },
      { stars: 1, text: "Completely overpriced for what you get. $28 for a tiny pasta dish with barely any protein.", sentiment: "Negative", factor: "Price/Value" },
      { stars: 3, text: "Food is good but feels like a tourist trap. Prices don't match the portion sizes.", sentiment: "Negative", factor: "Price/Value" },
    ],
  },
  wait: {
    sentiment: 38,
    positiveWords: ["quick", "no wait", "seated immediately", "efficient", "fast", "prompt", "on time", "well-organized", "smooth", "seamless"],
    negativeWords: ["long wait", "slow", "forever", "understaffed", "no reservation", "disorganized", "delayed", "overcrowded", "frustrating", "chaotic"],
    reviews: [
      { stars: 4, text: "Seated right away even on a Friday night. Food came out quickly and everything was well-timed.", sentiment: "Positive", factor: "Wait Time" },
      { stars: 1, text: "Waited 50 minutes past our reservation time. No apology, no explanation. Absolutely unacceptable.", sentiment: "Negative", factor: "Wait Time" },
      { stars: 2, text: "The food took over 40 minutes. Staff seemed overwhelmed and disorganized.", sentiment: "Negative", factor: "Wait Time" },
    ],
  },
  overall: {
    sentiment: 72,
    positiveWords: ["amazing", "wonderful", "fantastic", "exceptional", "outstanding", "memorable", "perfect", "delightful", "superb", "recommend"],
    negativeWords: ["terrible", "awful", "worst", "never again", "disappointed", "mediocre", "forgettable", "unpleasant", "regret", "avoid"],
    reviews: [
      { stars: 5, text: "An absolutely wonderful dining experience from start to finish. Already planning our next visit!", sentiment: "Positive", factor: "Overall" },
      { stars: 1, text: "Worst restaurant experience in a long time. Terrible food, rude staff, and overpriced. Never again.", sentiment: "Negative", factor: "Overall" },
      { stars: 4, text: "A delightful evening with exceptional food and attentive service. Highly recommend for special occasions.", sentiment: "Positive", factor: "Overall" },
    ],
  },
};

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

export default function TopicExplorer() {
  const [selected, setSelected] = useState<TopicId>("food");
  const data = topicDetails[selected];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Topic Explorer</h2>
          <p className="text-sm text-muted-foreground">Deep dive into what customers are talking about</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Topic grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`glass-card flex items-center gap-3 p-4 text-left text-sm font-medium transition-all duration-300 ${
                    selected === t.id
                      ? "border-accent glow-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Sentiment gauge */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {topics.find((t) => t.id === selected)?.label} — Sentiment
                    </h3>
                    <span className="text-2xl font-bold text-positive">{data.sentiment}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gradient-positive"
                      initial={{ width: 0 }}
                      animate={{ width: `${data.sentiment}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>Negative</span>
                    <span>Positive</span>
                  </div>
                </div>

                {/* Keywords */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="glass-card p-5">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-positive">Positive Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.positiveWords.map((w) => (
                        <span key={w} className="rounded-full bg-positive/15 px-3 py-1 text-xs font-medium text-positive">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-5">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-negative">Negative Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.negativeWords.map((w) => (
                        <span key={w} className="rounded-full bg-negative/15 px-3 py-1 text-xs font-medium text-negative">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-foreground">Representative Reviews</h4>
                  <div className="grid gap-4">
                    {data.reviews.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                        className="glass-card p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <StarRating count={r.stars} />
                          <div className="flex gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              r.sentiment === "Positive" ? "bg-positive/15 text-positive" : "bg-negative/15 text-negative"
                            }`}>
                              {r.sentiment}
                            </span>
                            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                              {r.factor}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

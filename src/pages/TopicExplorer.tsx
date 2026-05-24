import { useState, useEffect, useMemo } from "react";
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
  Building2,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { getTopicData } from "../apiService";

const staticThemes = [
  { id: "food", label: "Food Quality", icon: ChefHat, sentiment: 78, mentions: 8429 },
  { id: "service", label: "Service Experience", icon: Users, sentiment: 64, mentions: 6214 },
  { id: "ambiance", label: "Ambiance & Atmosphere", icon: Home, sentiment: 71, mentions: 4103 },
  { id: "value", label: "Value & Pricing", icon: DollarSign, sentiment: 52, mentions: 5891 },
  { id: "wait", label: "Wait Time", icon: Clock, sentiment: 34, mentions: 3782 },
  { id: "clean", label: "Cleanliness", icon: Sparkles, sentiment: 81, mentions: 2156 },
] as const;

type ThemeId = (typeof staticThemes)[number]["id"];

const staticDeepDiveData: Record<
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
          {value}%
        </text>
      </svg>
      <p className="-mt-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        Positive Ratio
      </p>
    </div>
  );
}

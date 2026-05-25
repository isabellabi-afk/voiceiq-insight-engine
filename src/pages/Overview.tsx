import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, Activity, AlertTriangle, Clock, ShieldCheck } from "lucide-react";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { GlassTooltip } from "@/components/GlassTooltip";

import { getOverviewData, getTopProblemDrivers, getRealRestaurantsList, getRestaurantKPIs } from "../apiService";

// =========================================================
// ANIMATION CONFIG
// =========================================================

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 24,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// =========================================================
// PROGRESS RING
// =========================================================

function ProgressRing({ value }: { value: number }) {
  const r = 28;

  const c = 2 * Math.PI * r;

  const offset = c - (value / 100) * c;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={r} stroke="rgba(31,41,55,0.08)" strokeWidth="6" fill="none" />

      <circle
        cx="36"
        cy="36"
        r={r}
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
        style={{
          transition: "stroke-dashoffset 1s ease-out",
        }}
      />

      <text x="36" y="40" textAnchor="middle" className="font-data fill-foreground text-[13px] font-semibold">
        {value}%
      </text>
    </svg>
  );
}

// =========================================================
// OVERVIEW PAGE
// =========================================================

export default function Overview() {
  // =======================================================
  // STATE
  // =======================================================

  const [backendData, setBackendData] = useState<any>(null);

  const [restaurantKPIs, setRestaurantKPIs] = useState<any>(null);

  const [driversData, setDriversData] = useState<any[]>([]);

  const [realRestaurants, setRealRestaurants] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  // =======================================================
  // GLOBAL RESTAURANT SESSION
  // =======================================================

  const [activeRestaurant, setActiveRestaurant] = useState<string>(() => {
    return localStorage.getItem("selected_yelp_restaurant") || "all";
  });

  // =======================================================
  // GLOBAL RESTAURANT HANDLER
  // =======================================================

  const handleRestaurantChange = (restaurantName: string) => {
    console.log("RESTAURANT_CHANGED_TO", restaurantName);

    setActiveRestaurant(restaurantName);

    localStorage.setItem("selected_yelp_restaurant", restaurantName);

    // =====================================================
    // GLOBAL APP EVENT
    // =====================================================

    window.dispatchEvent(
      new CustomEvent("restaurantChanged", {
        detail: restaurantName,
      }),
    );
  };

  // =======================================================
  // INITIAL DATA LOAD
  // =======================================================

  useEffect(() => {
    async function loadData() {
      try {
        // ================================================
        // OVERVIEW KPIS
        // ================================================

        const overview = await getOverviewData();

        console.log("OVERVIEW_DATA", overview);

        if (overview) {
          setBackendData(overview);
        }

        // ================================================
        // RESTAURANTS
        // ================================================

        const restaurantNames = await getRealRestaurantsList();

        console.log("REAL_RESTAURANTS", restaurantNames);

        setRealRestaurants(restaurantNames || []);

        // ================================================
        // DRIVERS
        // ================================================

        const drivers = await getTopProblemDrivers();

        console.log("TOP_DRIVERS", drivers);

        if (drivers) {
          setDriversData(drivers);
        }
      } catch (err) {
        console.error("Error syncing with Railway:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // =======================================================
  // RESTAURANT KPI LOAD
  // =======================================================

  useEffect(() => {
    async function loadRestaurantKPIs() {
      // ================================================
      // GLOBAL VIEW
      // ================================================

      if (activeRestaurant === "all") {
        setRestaurantKPIs(null);

        return;
      }

      try {
        console.log("LOADING_KPIS_FOR", activeRestaurant);

        const data = await getRestaurantKPIs(activeRestaurant);

        console.log("RESTAURANT_KPI_RESPONSE", data);

        if (data) {
          setRestaurantKPIs(data);
        }
      } catch (err) {
        console.error("Restaurant KPI sync error:", err);
      }
    }

    loadRestaurantKPIs();
  }, [activeRestaurant]);

  // =======================================================
  // ACTIVE KPI SOURCE
  // =======================================================

  const activeKPIs = activeRestaurant !== "all" && restaurantKPIs ? restaurantKPIs : backendData;

  // =======================================================
  // KPI NORMALIZATION
  // =======================================================

  const totalReviews = activeKPIs?.total_reviews || 0;

  const csatValue = activeKPIs?.avg_stars || activeKPIs?.csat || 0;

  const positivePct = activeKPIs?.positive_pct || 75;

  const npsValue = Math.round(positivePct - 20);

  const npsText = npsValue >= 0 ? `+${npsValue}` : `${npsValue}`;

  const responseRate = 100;

  const negativePct = Math.round(100 - positivePct);

  // =======================================================
  // SENTIMENT DATA
  // =======================================================

  const currentSentimentData = [
    {
      name: "Positive Reviews",
      value: positivePct,
      color: "#6EE7B7",
    },

    {
      name: "Negative Reviews",
      value: negativePct,
      color: "#F9A8D4",
    },
  ];

  // =======================================================
  // LOADING STATE
  // =======================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center text-sm text-muted-foreground animate-pulse">
          Querying Yelp SQLite tables and downloading live active brand entities...
        </div>
      </DashboardLayout>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <DashboardLayout>
      {/* ===================================================
          TOP SECTION
      ==================================================== */}

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b border-foreground/[0.04] pb-6">
        {/* HEADER */}

        <PageHeader
          eyebrow="Overview"
          title="Intelligence Dashboard"
          subtitle="Real-time customer analytics extracted from your processed Yelp SQLite dataset."
        />

        {/* RESTAURANT SELECTOR */}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-sm self-start xl:self-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />

            <span>Active Yelp Client Account:</span>
          </div>

          <select
            value={activeRestaurant}
            onChange={(e) => handleRestaurantChange(e.target.value)}
            className="bg-white text-xs font-medium rounded-xl border border-foreground/[0.06] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer text-foreground shadow-sm w-full sm:w-auto max-w-[320px] min-w-[260px]"
          >
            <option value="all">🌐 Global Admin Network View (All Brands)</option>

            {realRestaurants.map((name) => (
              <option key={name} value={name}>
                🏪 {name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </DashboardLayout>
  );
}

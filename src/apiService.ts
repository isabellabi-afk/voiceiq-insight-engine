const BASE_URL = "https://web-production-12dfb.up.railway.app";

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error(`Error fetching ${path}: ${res.status}`);
    return (await res.json()) as T;
  } catch (error) {
    console.error(`API error on ${path}:`, error);
    return null;
  }
}

// ── 1. KPIs (Dashboard principal) ──
export const getOverviewData = async () => {
  const data = await safeFetch<any>("/kpis");
  if (!data) return null;
  return {
    nps: Math.round((data.positive_pct ?? 0) - 20),
    csat: data.avg_stars,
    total_reviews: data.total_reviews,
    total_restaurants: data.total_restaurants,
    positive_pct: data.positive_pct,
    cities: data.cities ?? [],
    volume_trend_pct: "+12%",
    response_rate: 85,
  };
};

// ── 2. Reviews ──
export interface Review {
  review_id: string;
  business_id: string;
  business_name: string;
  city: string;
  state: string;
  categories: string;
  review_stars: number;
  text: string;
  clean_text?: string;
  date: string;
  sentiment_binary: "positive" | "negative" | string;
  review_length: number;
  word_count: number;
  factor_dominante?: string;
  factor_score?: number;
}

export interface ReviewFilters {
  sentiment?: string;
  city?: string;
  factor?: string;
  limit?: number;
}

export const getReviews = async (filters: ReviewFilters = {}): Promise<Review[]> => {
  const params = new URLSearchParams();
  if (filters.sentiment && filters.sentiment !== "all") params.set("sentiment", filters.sentiment);
  if (filters.city && filters.city !== "all") params.set("city", filters.city);
  if (filters.factor && filters.factor !== "all") params.set("factor", filters.factor);
  params.set("limit", String(filters.limit ?? 200));
  const qs = params.toString();
  const data = await safeFetch<Review[] | { reviews: Review[] }>(`/reviews${qs ? `?${qs}` : ""}`);
  if (!data) return [];
  return Array.isArray(data) ? data : (data.reviews ?? []);
};

// ── 3. Restaurants ──
export const getMarketData = async (): Promise<any> => {
  return safeFetch<any>("/restaurants");
};

// ── 4. Business metrics ──
export const getBusinessMetrics = async () => {
  return safeFetch<any[]>("/business-metrics");
};

// Topic / sentiment factors — legacy endpoint kept for compatibility
export const getTopicData = async () => {
  return safeFetch<any>("/factors");
};

export const getTopProblemDrivers = async (city?: string) => {
  const qs = city ? `?city=${encodeURIComponent(city)}` : "";

  const data = await safeFetch<any>(`/intelligence/top-problem-drivers${qs}`);

  if (!data) return [];

  return data.top_problem_drivers.map((d: any) => ({
    name:
      d.factor === "servicio"
        ? "Service"
        : d.factor === "comida"
          ? "Food Quality"
          : d.factor === "ambiente"
            ? "Atmosphere"
            : "Other",
    value: d.negative_reviews,
    tone: d.factor === "servicio" ? "warning" : "positive",
  }));
};

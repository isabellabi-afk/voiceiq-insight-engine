const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://web-production-12dfb.up.railway.app";

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

export interface OverviewData {
  nps: number | null;
  csat: number | null;
  total_reviews: number;
  total_restaurants: number;
  positive_pct: number;
  cities: string[];
  volume_trend_pct: number | null;
  response_rate: number | null;
}

// 1. KPIs dashboard principal. No inventamos métricas si backend no las envía.
export const getOverviewData = async (): Promise<OverviewData | null> => {
  const data = await safeFetch<any>("/kpis");
  if (!data) return null;

  const positivePct = Number(data.positive_pct ?? 0);
  const negativePct = data.negative_pct !== undefined ? Number(data.negative_pct) : Math.max(0, 100 - positivePct);

  return {
    nps: data.nps !== undefined ? Number(data.nps) : Math.round(positivePct - negativePct),
    csat: data.avg_stars !== undefined ? Number(data.avg_stars) : null,
    total_reviews: Number(data.total_reviews ?? 0),
    total_restaurants: Number(data.total_restaurants ?? 0),
    positive_pct: positivePct,
    cities: Array.isArray(data.cities) ? data.cities : [],
    volume_trend_pct: data.volume_trend_pct !== undefined ? Number(data.volume_trend_pct) : null,
    response_rate: data.response_rate !== undefined ? Number(data.response_rate) : null,
  };
};

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
  business_name?: string;
  limit?: number;
}

export const getReviews = async (filters: ReviewFilters = {}): Promise<Review[]> => {
  const params = new URLSearchParams();
  if (filters.sentiment && filters.sentiment !== "all") params.set("sentiment", filters.sentiment);
  if (filters.city && filters.city !== "all") params.set("city", filters.city);
  if (filters.factor && filters.factor !== "all") params.set("factor", filters.factor);
  if (filters.business_name && filters.business_name !== "all") params.set("business_name", filters.business_name);
  params.set("limit", String(filters.limit ?? 200));
  const qs = params.toString();
  const data = await safeFetch<Review[]>(`/reviews${qs ? `?${qs}` : ""}`);
  return data ?? [];
};

export const getReviewsByRestaurant = async (businessName: string, limit = 50): Promise<Review[]> => {
  return getReviews({ business_name: businessName, limit });
};

export const getMarketData = async (): Promise<any> => safeFetch<any>("/restaurants");
export const getBusinessMetrics = async () => safeFetch<any[]>("/business-metrics");
export const getTopicData = async () => safeFetch<any>("/factors");

export const getTopProblemDrivers = async (restaurantName?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (restaurantName && restaurantName !== "all") params.set("business_name", restaurantName);
  const qs = params.toString();
  const data = await safeFetch<any>(`/intelligence/top-problem-drivers${qs ? `?${qs}` : ""}`);
  return data ?? { top_problem_drivers: [] };
};

export const getRealRestaurantsList = async (): Promise<string[]> => {
  const data = await getMarketData();
  if (!data) return [];
  const restaurantsArray = Array.isArray(data) ? data : (data.restaurants ?? []);
  const names = restaurantsArray.map((r: any) => r.business_name || r.name).filter(Boolean);
  return Array.from(new Set(names)) as string[];
};

export const getRestaurantKPIs = async (businessName: string) => {
  if (!businessName || businessName === "all") return safeFetch<any>("/kpis");
  return safeFetch<any>(`/restaurant-kpis?business_name=${encodeURIComponent(businessName)}`);
};

export const getPerformanceReviews = async (businessName: string): Promise<Review[]> => {
  return getReviews({ business_name: businessName, limit: 1000 });
};

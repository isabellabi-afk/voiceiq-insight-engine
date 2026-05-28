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

const factorTranslations: Record<string, string> = {
  otros: "Others",
  servicio: "Service",
  comida: "Food",
  ambiente: "Atmosphere",
};

const translateFactor = (factor: string) =>
  factorTranslations[factor.toLowerCase()] ||
  factor.charAt(0).toUpperCase() + factor.slice(1);

export const getOverviewData = async () => {
  const [data, problemDrivers, satisfactionDrivers] = await Promise.all([
    safeFetch<any>("/kpis"),
    safeFetch<any>("/intelligence/top-problem-drivers"),
    safeFetch<any>("/intelligence/top-satisfaction-drivers"),
  ]);

  if (!data) return null;

  const drivers = (satisfactionDrivers?.top_satisfaction_drivers ?? []).map((d: any) => ({
    name: translateFactor(d.factor),
    value: Math.round((d.positive_reviews / (data.total_reviews || 1)) * 100),
  }));

  const issues = (problemDrivers?.top_problem_drivers ?? []).map((d: any) => ({
    title: translateFactor(d.factor),
    detail: `${d.negative_reviews} negative reviews related to this factor.`,
    action: `Review and improve customer experience regarding "${translateFactor(d.factor)}".`,
  }));

  return {
    nps: Math.round((data.positive_pct ?? 0) - 20),
    csat: data.avg_stars,
    total_reviews: data.total_reviews,
    total_restaurants: data.total_restaurants,
    positive_pct: data.positive_pct,
    cities: data.cities ?? [],
    volume_trend_pct: "+12%",
    response_rate: 85,
    drivers,
    issues,
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

export const getReviews = async (): Promise<Review[]> => {
  const data = await safeFetch<Review[]>("/reviews");
  return data ?? [];
};

export const getMarketData = async (): Promise<any> => {
  return safeFetch<any>("/restaurants");
};

export const getBusinessMetrics = async () => {
  return safeFetch<any[]>("/business-metrics");
};

export const getTopicData = async () => {
  return safeFetch<any>("/intelligence/topics");
};

export const getMarketPosition = async () => {
  return safeFetch<any>("/intelligence/market-position");
};

export const getTopProblemDrivers = async (city = "all") => {
  return safeFetch<any>(`/intelligence/top-problem-drivers?city=${city}`);
};

export const getTopSatisfactionDrivers = async (city = "all") => {
  return safeFetch<any>(`/intelligence/top-satisfaction-drivers?city=${city}`);
};

const BASE_URL = "https://web-production-816e4.up.railway.app";

export const getOverviewData = async () => {
  const res = await fetch(`${BASE_URL}/api/overview`);
  return res.ok ? res.json() : null;
};

export const getTopicData = async () => {
  const res = await fetch(`${BASE_URL}/api/topics`);
  return res.ok ? res.json() : null;
};

export const getMarketData = async () => {
  const res = await fetch(`${BASE_URL}/api/market`);
  return res.ok ? res.json() : null;
};

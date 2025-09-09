// app/utils/usCensusCache.ts

type UsYear = {
  poverty_rate: number;
  educational: number;
  income_mean: number;
  income_median: number;
};

import usData from "../utils/us_census_data.json"; // build-time import

export function getUsAverages(year: number): UsYear | null {
  const byYear = usData as Record<string, UsYear>;
  return byYear[String(year)] ?? null;
}

// usage example (optional):
// const y2023 = getUsAverages(2023);

const CACHE_KEY = "us-census-averages-by-year";

type CacheShape = Record<string, UsYear>;

export function getUsAveragesFromCache(year: number): UsYear | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CacheShape = JSON.parse(raw);
    return parsed[String(year)] ?? null;
  } catch {
    return null;
  }
}

export function seedUsAveragesCache(
  years: number[] = [2021, 2022, 2023]
): void {
  if (typeof window === "undefined") return;
  const byYear = usData as Record<string, UsYear>;
  const payload: CacheShape = {};
  for (const y of years) {
    const rec = byYear[String(y)];
    if (rec) payload[String(y)] = rec;
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

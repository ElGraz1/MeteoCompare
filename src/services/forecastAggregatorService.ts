import type { ForecastItem } from "../types/ForecastItem";

import { getForecastFromSite } from "./ilMeteoSiteParser";

import { getForecastFrom3BMeteo } from "./treBMeteoSiteParser";

interface CacheEntry {
  timestamp: number;
  data: AggregatedForecast;
}

const forecastCache = new Map<string, CacheEntry>();

const CACHE_TTL = 15 * 60 * 1000;

function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

function getFallbackCities(city: string): string[] {
  const normalized = normalizeCity(city);

  const attempts = [normalized];

  const parts = normalized.split(" ");

  if (parts.length > 1) {
    attempts.push(parts[0]);
  }

  return [...new Set(attempts)];
}
export interface ForecastComparisonItem {
  ora: string;

  ilMeteo: ForecastItem | null;

  treBMeteo: ForecastItem | null;

  differenzaTemperatura: number | null;

  differenzaProbabilita: number | null;

  differenzaAccumulo: number | null;

  differenzaUmidita: number | null;

  differenzaPressione: number | null;

  alert: boolean;
}

export interface AggregatedForecast {
  localita: string;

  ilMeteo: ForecastItem[];

  treBMeteo: ForecastItem[];

  confronto: ForecastComparisonItem[];
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function absoluteDifference(firstValue: number, secondValue: number): number {
  return roundToOneDecimal(Math.abs(firstValue - secondValue));
}

function normalizeSlug(slug: string): string {
  const normalizedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/\s+/g, "+");

  if (!normalizedSlug || !/^[a-z0-9+]+$/.test(normalizedSlug)) {
    throw new Error("Slug della località non valido");
  }

  return normalizedSlug;
}

function getProbabilityBehavior(probability: number) {
  return probability >= 50 ? "consider-rain" : "ignore-rain";
}

function hasProbabilityAlert(
  ilMeteoProbability: number,
  treBMeteoProbability: number,
) {
  return (
    getProbabilityBehavior(ilMeteoProbability) !==
    getProbabilityBehavior(treBMeteoProbability)
  );
}

function getAccumulationBehavior(accumulation: number) {
  if (accumulation <= 0.5) {
    return "dry";
  }

  if (accumulation <= 2) {
    return "negligible";
  }

  if (accumulation <= 10) {
    return "umbrella";
  }

  return "mobility-impact";
}

function hasAccumulationAlert(
  ilMeteoAccumulation: number,
  treBMeteoAccumulation: number,
) {
  return (
    getAccumulationBehavior(ilMeteoAccumulation) !==
    getAccumulationBehavior(treBMeteoAccumulation)
  );
}
export function buildForecastComparison(
  ilMeteoForecasts: ForecastItem[],
  treBMeteoForecasts: ForecastItem[],
): ForecastComparisonItem[] {
  console.log("[BUILD FORECAST COMPARISON]");
  const ilMeteoByHour = new Map(
    ilMeteoForecasts.map((forecast) => [forecast.ora, forecast]),
  );

  const treBMeteoByHour = new Map(
    treBMeteoForecasts.map((forecast) => [forecast.ora, forecast]),
  );

  const hours = Array.from(
    new Set([...ilMeteoByHour.keys(), ...treBMeteoByHour.keys()]),
  ).sort((firstHour, secondHour) => {
    const firstValue = Number.parseInt(firstHour, 10);

    const secondValue = Number.parseInt(secondHour, 10);

    return firstValue - secondValue;
  });

  return hours.map((ora) => {
    const ilMeteo = ilMeteoByHour.get(ora) ?? null;

    const treBMeteo = treBMeteoByHour.get(ora) ?? null;

    if (!ilMeteo || !treBMeteo) {
      return {
        ora,
        ilMeteo,
        treBMeteo,
        differenzaTemperatura: null,
        differenzaProbabilita: null,
        differenzaAccumulo: null,
        differenzaUmidita: null,
        differenzaPressione: null,
        alert: false,
      };
    }

    const differenzaTemperatura = absoluteDifference(
      ilMeteo.temperatura,
      treBMeteo.temperatura,
    );

    const differenzaProbabilita = absoluteDifference(
      ilMeteo.probabilita,
      treBMeteo.probabilita,
    );

    const differenzaAccumulo = absoluteDifference(
      ilMeteo.accumulo,
      treBMeteo.accumulo,
    );

    const differenzaUmidita = absoluteDifference(
      ilMeteo.umidita,
      treBMeteo.umidita,
    );

    const differenzaPressione = absoluteDifference(
      ilMeteo.pressione,
      treBMeteo.pressione,
    );

    const probabilityAlert = hasProbabilityAlert(
      ilMeteo.probabilita,
      treBMeteo.probabilita,
    );

    const accumulationAlert = hasAccumulationAlert(
      ilMeteo.accumulo,
      treBMeteo.accumulo,
    );

    //const alert = probabilityAlert || accumulationAlert;

    const alert = false;

    if (alert) {
      console.log(`[ALERT ${ora}]`, {
        probILM: ilMeteo.probabilita,
        prob3BM: treBMeteo.probabilita,

        accILM: ilMeteo.accumulo,
        acc3BM: treBMeteo.accumulo,

        probabilityBehavior: getProbabilityBehavior(ilMeteo.probabilita),

        probabilityBehavior3BM: getProbabilityBehavior(treBMeteo.probabilita),

        accumulationBehaviorILM: getAccumulationBehavior(ilMeteo.accumulo),

        accumulationBehavior3BM: getAccumulationBehavior(treBMeteo.accumulo),

        probabilityAlert,
        accumulationAlert,
      });
    }
    return {
      ora,
      ilMeteo,
      treBMeteo,
      differenzaTemperatura,
      differenzaProbabilita,
      differenzaAccumulo,
      differenzaUmidita,
      differenzaPressione,
      alert,
    };
  });
}

export async function getAggregatedForecast(
  slug: string,
  day: number = 0,
): Promise<AggregatedForecast> {
  const cityToSearch = normalizeCity(slug);

  if (cityToSearch !== slug.toLowerCase()) {
  }

  console.log("[CITY]", slug);
  console.log("[CITY_TO_SEARCH]", cityToSearch);
  const normalizedSlug = normalizeSlug(cityToSearch);

  const cacheKey = `${normalizedSlug}-${day}`;

  const cached = forecastCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[CACHE HIT] ${cacheKey}`);

    console.log("[CACHE DATA]", cacheKey, {
      ilMeteo: cached.data.ilMeteo.length,
      treBMeteo: cached.data.treBMeteo.length,
      confronto: cached.data.confronto.length,
    });

    return cached.data;
  }

  console.log(`[CACHE MISS] ${cacheKey}`);

  const [ilMeteo, treBMeteo] = await Promise.all([
    getForecastFromSite(normalizedSlug, day),
    getForecastFrom3BMeteo(normalizedSlug, day),
  ]);

  if (ilMeteo.length === 0) {
    throw new Error(
      `iLMeteo non ha restituito previsioni per ${normalizedSlug}`,
    );
  }

  if (treBMeteo.length === 0) {
    throw new Error(
      `3BMeteo non ha restituito previsioni per ${normalizedSlug}`,
    );
  }

  const result = {
    localita: normalizedSlug,

    ilMeteo,

    treBMeteo,

    confronto: buildForecastComparison(ilMeteo, treBMeteo),
  };

  forecastCache.set(cacheKey, {
    timestamp: Date.now(),
    data: result,
  });

  return result;
}

import type {
  ForecastItem,
} from "../types/ForecastItem";

import {
  getForecastFromSite,
} from "./ilMeteoSiteParser";

import {
  getForecastFrom3BMeteo,
} from "./treBMeteoSiteParser";

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

function roundToOneDecimal(
  value: number
): number {
  return Math.round(value * 10) / 10;
}

function absoluteDifference(
  firstValue: number,
  secondValue: number
): number {
  return roundToOneDecimal(
    Math.abs(firstValue - secondValue)
  );
}

function normalizeSlug(
  slug: string
): string {
  const normalizedSlug = slug
    .trim()
    .toLowerCase();

  if (
    !normalizedSlug ||
    !/^[a-z0-9-]+$/.test(normalizedSlug)
  ) {
    throw new Error(
      "Slug della località non valido"
    );
  }

  return normalizedSlug;
}

export function buildForecastComparison(
  ilMeteoForecasts: ForecastItem[],
  treBMeteoForecasts: ForecastItem[]
): ForecastComparisonItem[] {
  const ilMeteoByHour = new Map(
    ilMeteoForecasts.map(
      (forecast) => [
        forecast.ora,
        forecast,
      ]
    )
  );

  const treBMeteoByHour = new Map(
    treBMeteoForecasts.map(
      (forecast) => [
        forecast.ora,
        forecast,
      ]
    )
  );

  const hours = Array.from(
    new Set([
      ...ilMeteoByHour.keys(),
      ...treBMeteoByHour.keys(),
    ])
  ).sort((firstHour, secondHour) => {
    const firstValue = Number.parseInt(
      firstHour,
      10
    );

    const secondValue = Number.parseInt(
      secondHour,
      10
    );

    return firstValue - secondValue;
  });

  return hours.map((ora) => {
    const ilMeteo =
      ilMeteoByHour.get(ora) ?? null;

    const treBMeteo =
      treBMeteoByHour.get(ora) ?? null;

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

    const differenzaTemperatura =
      absoluteDifference(
        ilMeteo.temperatura,
        treBMeteo.temperatura
      );

    const differenzaProbabilita =
      absoluteDifference(
        ilMeteo.probabilita,
        treBMeteo.probabilita
      );

    const differenzaAccumulo =
      absoluteDifference(
        ilMeteo.accumulo,
        treBMeteo.accumulo
      );

    const differenzaUmidita =
      absoluteDifference(
        ilMeteo.umidita,
        treBMeteo.umidita
      );

    const differenzaPressione =
      absoluteDifference(
        ilMeteo.pressione,
        treBMeteo.pressione
      );

    const alert =
      differenzaProbabilita > 20 ||
      differenzaAccumulo > 3;

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
  slug: string
): Promise<AggregatedForecast> {
  const normalizedSlug =
    normalizeSlug(slug);

  const [
    ilMeteo,
    treBMeteo,
  ] = await Promise.all([
    getForecastFromSite(
      normalizedSlug
    ),

    getForecastFrom3BMeteo(
      normalizedSlug
    ),
  ]);

  if (ilMeteo.length === 0) {
    throw new Error(
      `iLMeteo non ha restituito previsioni per ${normalizedSlug}`
    );
  }

  if (treBMeteo.length === 0) {
    throw new Error(
      `3BMeteo non ha restituito previsioni per ${normalizedSlug}`
    );
  }

  return {
    localita: normalizedSlug,

    ilMeteo,

    treBMeteo,

    confronto:
      buildForecastComparison(
        ilMeteo,
        treBMeteo
      ),
  };
}
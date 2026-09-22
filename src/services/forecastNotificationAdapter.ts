import type { ForecastItem } from "../types/ForecastItem";

import type { ForecastHour } from "./notificationEvaluator";

interface ComparisonItem {
  ora: string;

  ilMeteo: ForecastItem | null;

  treBMeteo: ForecastItem | null;
}

export function toNotificationForecast(
  confronto: ComparisonItem[],
): ForecastHour[] {
  return confronto.map((item) => ({
    time: item.ora,

    ilmProbability: item.ilMeteo?.probabilita ?? 0,

    ilmAccumulation: item.ilMeteo?.accumulo ?? 0,

    bmProbability: item.treBMeteo?.probabilita ?? 0,

    bmAccumulation: item.treBMeteo?.accumulo ?? 0,
  }));
}

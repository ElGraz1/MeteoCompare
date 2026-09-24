export type NotificationProvider = "ilm" | "3bm" | "both" | "max";

export interface NotificationSettings {
  provider: NotificationProvider;
  probabilityThreshold: number;
  accumulationThreshold: number;
  criticalStart: string;
  criticalEnd: string;
}

export interface ForecastHour {
  time: string;

  ilmProbability: number;
  ilmAccumulation: number;

  bmProbability: number;
  bmAccumulation: number;
}

function isInsideRange(time: string, start: string, end: string) {
  return time >= start && time <= end;
}

export function evaluateNotification(
  forecast: ForecastHour[],
  settings: NotificationSettings,
): NotificationResult {
  const filtered = forecast.filter((hour) =>
    isInsideRange(hour.time, settings.criticalStart, settings.criticalEnd),
  );
  let maxProbability = 0;
  let maxAccumulation = 0;

  let firstCriticalHour: string | undefined;
  let lastCriticalHour: string | undefined;

  for (const hour of filtered) {
    const values = getValues(hour, settings.provider);

    const accumulation = values.probability < 25 ? 0 : values.accumulation;

    maxProbability = Math.max(maxProbability, values.probability);

    maxAccumulation = Math.max(maxAccumulation, accumulation);
  }

  const shouldNotify =
    maxProbability >= settings.probabilityThreshold ||
    maxAccumulation >= settings.accumulationThreshold;

  if (shouldNotify) {
    const impacted = filtered.filter((hour) => {
      const values = getValues(hour, settings.provider);

      const accumulation = values.probability < 25 ? 0 : values.accumulation;

      return (
        values.probability >= settings.probabilityThreshold ||
        accumulation >= settings.accumulationThreshold
      );
    });

    if (impacted.length > 0) {
      firstCriticalHour = impacted[0].time;

      const lastHour = Number(impacted[impacted.length - 1].time.split(":")[0]);

      lastCriticalHour = `${String(lastHour + 1).padStart(2, "0")}:00`;
    }
    ``;
  }
  return {
    shouldNotify,
    maxProbability,
    maxAccumulation,
    firstCriticalHour,
    lastCriticalHour,
    providerUsed: settings.provider,
  };
}

function getValues(hour: ForecastHour, provider: NotificationProvider) {
  switch (provider) {
    case "ilm":
      return {
        probability: hour.ilmProbability,
        accumulation: hour.ilmAccumulation,
      };

    case "3bm":
      return {
        probability: hour.bmProbability,
        accumulation: hour.bmAccumulation,
      };

    case "both":
      return {
        probability: Math.min(hour.ilmProbability, hour.bmProbability),
        accumulation: Math.min(hour.ilmAccumulation, hour.bmAccumulation),
      };

    case "max":
    default:
      return {
        probability: Math.max(hour.ilmProbability, hour.bmProbability),
        accumulation: Math.max(hour.ilmAccumulation, hour.bmAccumulation),
      };
  }
}
export interface NotificationResult {
  shouldNotify: boolean;

  maxProbability: number;
  maxAccumulation: number;

  firstCriticalHour?: string;
  lastCriticalHour?: string;

  providerUsed: NotificationProvider;
}

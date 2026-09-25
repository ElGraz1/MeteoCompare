import { getAggregatedForecast } from "../../src/services/forecastAggregatorService";
import { toNotificationForecast } from "../../src/services/forecastNotificationAdapter";
import { evaluateNotification } from "../../src/services/notificationEvaluator";
import { buildNotificationMessage } from "../../src/services/buildNotificationMessage";

export async function generateServerNotification(
  city: string,
  settings: {
    provider: "ilm" | "3bm" | "both" | "max";
    probabilityThreshold: number;
    accumulationThreshold: number;
    criticalStart: string;
    criticalEnd: string;
  },
) {
  const data = await getAggregatedForecast(city, 1);

  const forecast = toNotificationForecast(data.confronto);

  const result = evaluateNotification(forecast, settings);

  const message = buildNotificationMessage(city, result);

  if (!message) {
    return null;
  }

  return {
    message,
    result,
  };
}
``;

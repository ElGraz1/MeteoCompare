import { getForecastsByCity } from "./apiForecastService";

import { loadNotificationSettings } from "./notificationSettingsService";

import { toNotificationForecast } from "./forecastNotificationAdapter";

import { evaluateNotification } from "./notificationEvaluator";

import { buildNotificationMessage } from "./buildNotificationMessage";

export async function generateNotification() {
  const { city, settings } = await loadNotificationSettings();

  if (!city) {
    return null;
  }

  const data = await getForecastsByCity(city, 1);

  const forecast = toNotificationForecast(data.confronto);

  const result = evaluateNotification(forecast, settings);

  const message = buildNotificationMessage(city, result);

  if (message) {
    return message;
  }

  return `Nessuna notifica da inviare

Probabilità massima rilevata:
${result.maxProbability}%

Accumulo massimo rilevato:
${result.maxAccumulation} mm

Soglie impostate:

Probabilità:
${settings.probabilityThreshold}%

Accumulo:
${settings.accumulationThreshold} mm`;
}

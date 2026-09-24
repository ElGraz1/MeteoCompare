import {
  NotificationResult,
  NotificationProvider,
} from "./notificationEvaluator";

function providerLabel(provider: NotificationProvider) {
  switch (provider) {
    case "ilm":
      return "iLMeteo";

    case "3bm":
      return "3BMeteo";

    case "both":
      return "Entrambi";

    case "max":
    default:
      return "Più prudente";
  }
}

function getRainDescription(accumulation: number) {
  if (accumulation <= 2) {
    return "🌦 Possibili precipitazioni";
  }

  if (accumulation <= 10) {
    return "🌧 Pioggia prevista";
  }

  return "⛈ Pioggia intensa prevista";
}
export function buildNotificationMessage(
  city: string,
  result: NotificationResult,
) {
  if (!result.shouldNotify) {
    return null;
  }

  return `🌧 MeteoCompare

${city}

${getRainDescription(result.maxAccumulation)} domani.

Ore interessate:
${result.firstCriticalHour} → ${result.lastCriticalHour}

Probabilità massima:
${result.maxProbability}%

Accumulo massimo:
${result.maxAccumulation} mm

Fonte:
${providerLabel(result.providerUsed)}
`;
}

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

export function buildNotificationMessage(
  city: string,
  result: NotificationResult,
) {
  if (!result.shouldNotify) {
    return null;
  }

  return `🌧 MeteoCompare

${city}

Domani è prevista pioggia significativa.

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

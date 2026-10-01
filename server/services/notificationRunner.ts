import fs from "fs";
import path from "path";

import { generateServerNotification } from "./generateServerNotification";
import { sendPushNotification } from "./expoPushService";

export async function runNotifications() {
  const filePath = path.join(
    process.cwd(),
    "data",
    "notification-subscriptions.json",
  );

  const subscriptions = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const now = new Date();

  const currentTime = now.toLocaleTimeString("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowDate = tomorrow.toISOString().split("T")[0];
  let sentNotifications = 0;

  for (const subscription of subscriptions) {
    console.log(
      "[SUBSCRIPTION]",
      subscription.city,
      subscription.notificationHour,
      currentTime,
    );
    if (!subscription.notificationsEnabled) {
      continue;
    }

    console.log(
      "[CUSTOM CHECK]",
      subscription.city,
      tomorrowDate,
      subscription.selectedDates,
    );
    if (subscription.lastNotificationDate === today) {
      continue;
    }

    if (subscription.notificationHour !== currentTime) {
      continue;
    }

    if (subscription.notificationMode === "custom") {
      if (
        !subscription.selectedDates ||
        !subscription.selectedDates.includes(tomorrowDate)
      ) {
        continue;
      }
    }

    const notification = await generateServerNotification(subscription.city, {
      provider: subscription.provider,
      probabilityThreshold: Number(subscription.probabilityThreshold),
      accumulationThreshold: Number(subscription.accumulationThreshold),
      criticalStart: subscription.criticalStart,
      criticalEnd: subscription.criticalEnd,
    });

    if (!notification) {
      continue;
    }
    const tickets = await sendPushNotification(
      subscription.expoPushToken,
      "🌧 MeteoCompare",
      notification.message,
      {
        city: subscription.city,
        startHour: notification.result.firstCriticalHour ?? "",
        endHour: notification.result.lastCriticalHour ?? "",
        probability: notification.result.maxProbability,
        accumulation: notification.result.maxAccumulation,
        provider: notification.result.providerUsed,
      },
    );
    const hasInvalidTicket = tickets?.some(
      (ticket: any) =>
        ticket.status === "error" &&
        ticket.details?.error === "DeviceNotRegistered",
    );

    if (hasInvalidTicket) {
      subscriptions.splice(subscriptions.indexOf(subscription), 1);

      continue;
    }
    subscription.lastNotificationDate = today;

    sentNotifications++;
  }

  fs.writeFileSync(filePath, JSON.stringify(subscriptions, null, 2));
  return sentNotifications;
}

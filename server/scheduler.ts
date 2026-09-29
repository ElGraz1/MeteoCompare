import cron from "node-cron";

import { runNotifications } from "./services/notificationRunner";

export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      const sentNotifications = await runNotifications();

      if (sentNotifications > 0) {
        console.log(`[NOTIFICATIONS SENT] ${sentNotifications}`);
      }
    } catch (error) {
      console.error("Notification scheduler error:", error);
    }
  });
}

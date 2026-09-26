import cron from "node-cron";

import { runNotifications } from "./services/notificationRunner";

export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    console.log("Running scheduled notifications...");

    try {
      const sentNotifications = await runNotifications();

      console.log(`Notifications sent: ${sentNotifications}`);
    } catch (error) {
      console.error("Notification scheduler error:", error);
    }
  });
}

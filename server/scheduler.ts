import cron from "node-cron";

import { runNotifications } from "./services/notificationRunner";

export function startScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      await runNotifications();
    } catch (error) {
      console.error("Notification scheduler error:", error);
    }
  });
}

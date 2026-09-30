import * as Notifications from "expo-notifications";

Notifications.setNotificationChannelAsync("default", {
  name: "default",
  importance: Notifications.AndroidImportance.MAX,
  enableVibrate: true,
  vibrationPattern: [0, 250, 250, 250],
  lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
});
console.log("NOTIFICATION HANDLER LOADED");
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function showLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null,
  });
}

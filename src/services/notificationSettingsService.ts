import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  NotificationSettings,
  NotificationProvider,
} from "./notificationEvaluator";

export async function loadNotificationSettings(): Promise<{
  city: string;
  settings: NotificationSettings;
}> {
  const values = await AsyncStorage.multiGet([
    "preferredCity",
    "provider",
    "rainThreshold",
    "accumulationThreshold",
    "criticalStart",
    "criticalEnd",
  ]);

  const data = Object.fromEntries(values);

  return {
    city: data.preferredCity ?? "",

    settings: {
      provider: (data.provider as NotificationProvider) ?? "max",

      probabilityThreshold: Number(data.rainThreshold ?? "60"),

      accumulationThreshold: Number(data.accumulationThreshold ?? "3"),

      criticalStart: data.criticalStart ?? "07:00",

      criticalEnd: data.criticalEnd ?? "20:00",
    },
  };
}

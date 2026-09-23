import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (!data) {
          return;
        }

        router.push({
          pathname: "/notification-details",
          params: {
            city: String(data.city ?? ""),
            startHour: String(data.startHour ?? ""),
            endHour: String(data.endHour ?? ""),
            probability: String(data.probability ?? ""),
            accumulation: String(data.accumulation ?? ""),
            provider: String(data.provider ?? ""),
          },
        });
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="settings"
        options={{
          title: "Impostazioni",
        }}
      />
      <Stack.Screen
        name="probability-info"
        options={{
          title: "Probabilità minima",
        }}
      />

      <Stack.Screen
        name="accumulation-info"
        options={{
          title: "Accumulo minimo",
        }}
      />
      <Stack.Screen
        name="notification-details"
        options={{
          title: "Dettaglio notifica",
        }}
      />
      <Stack.Screen
        name="provider-info"
        options={{
          title: "Fonte notifica",
        }}
      />
    </Stack>
  );
}

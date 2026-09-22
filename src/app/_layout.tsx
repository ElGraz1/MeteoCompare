import { Stack } from "expo-router";

export default function RootLayout() {
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
    </Stack>
  );
}

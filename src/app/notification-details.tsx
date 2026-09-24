import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

function getRainDescription(accumulation: number) {
  if (accumulation <= 2) {
    return "🌦 Possibili precipitazioni domani.";
  }

  if (accumulation <= 10) {
    return "🌧 Pioggia prevista domani.";
  }

  return "⛈ Pioggia intensa prevista domani.";
}

export default function NotificationDetailsScreen() {
  const { city, startHour, endHour, probability, accumulation, provider } =
    useLocalSearchParams();

  const providerLabel =
    provider === "ilm"
      ? "iLMeteo"
      : provider === "3bm"
        ? "3BMeteo"
        : provider === "both"
          ? "Entrambi"
          : "Più prudente";

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        🌧 Dettaglio notifica
      </Text>

      <View
        style={{
          backgroundColor: "white",
          borderRadius: 15,
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 15,
          }}
        >
          📍 {city}
        </Text>

        <Text
          style={{
            marginBottom: 15,
            fontSize: 16,
          }}
        >
          {getRainDescription(Number(accumulation))}
        </Text>

        <Text
          style={{
            fontWeight: "700",
            marginBottom: 5,
          }}
        >
          ⏰ Ore interessate
        </Text>

        <Text
          style={{
            marginBottom: 15,
          }}
        >
          {startHour} → {endHour}
        </Text>

        <Text
          style={{
            fontWeight: "700",
            marginBottom: 5,
          }}
        >
          🌧 Probabilità massima
        </Text>

        <Text
          style={{
            marginBottom: 15,
          }}
        >
          {probability}%
        </Text>

        <Text
          style={{
            fontWeight: "700",
            marginBottom: 5,
          }}
        >
          💧 Accumulo massimo
        </Text>

        <Text
          style={{
            marginBottom: 15,
          }}
        >
          {accumulation} mm
        </Text>

        <Text
          style={{
            fontWeight: "700",
            marginBottom: 5,
          }}
        >
          ☁️ Fonte
        </Text>

        <Text>{providerLabel}</Text>
      </View>
    </ScrollView>
  );
}

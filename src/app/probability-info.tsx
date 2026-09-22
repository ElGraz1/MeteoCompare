import { ScrollView, Text } from "react-native";

export default function ProbabilityInfoScreen() {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        🌧 Probabilità minima
      </Text>

      <Text>
        La notifica viene generata quando la probabilità di precipitazione
        raggiunge o supera la soglia impostata durante le ore critiche.
      </Text>

      <Text
        style={{
          marginTop: 20,
        }}
      >
        Esempio:
      </Text>

      <Text>Soglia: 60%</Text>

      <Text>Previsione: 75%</Text>

      <Text>✅ Notifica generata</Text>
    </ScrollView>
  );
}

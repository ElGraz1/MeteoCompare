import { ScrollView, Text } from "react-native";

export default function AccumulationInfoScreen() {
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
        💧 Accumulo minimo
      </Text>

      <Text>
        La notifica viene generata quando l'accumulo previsto raggiunge o supera
        la soglia impostata durante le ore critiche.
      </Text>

      <Text
        style={{
          marginTop: 20,
        }}
      >
        Esempio:
      </Text>

      <Text>Soglia: 3 mm</Text>

      <Text>Previsione: 5 mm</Text>

      <Text>✅ Notifica generata</Text>
    </ScrollView>
  );
}

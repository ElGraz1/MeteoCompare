import { ScrollView, Text, View } from "react-native";

export default function ProviderInfoScreen() {
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
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
        ☁️ Fonte notifica
      </Text>

      <Text
        style={{
          marginBottom: 20,
          color: "#475569",
          lineHeight: 22,
        }}
      >
        La fonte notifica determina quali dati vengono utilizzati per valutare
        il rischio di pioggia.
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          iLMeteo
        </Text>

        <Text style={{ color: "#475569", lineHeight: 22 }}>
          Utilizza esclusivamente probabilità e accumulo previsti da iLMeteo.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          3BMeteo
        </Text>

        <Text style={{ color: "#475569", lineHeight: 22 }}>
          Utilizza esclusivamente probabilità e accumulo previsti da 3BMeteo.
        </Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          Entrambi
        </Text>

        <Text style={{ color: "#475569", lineHeight: 22 }}>
          Richiede consenso tra i due provider.
          {"\n\n"}
          Probabilità = valore minimo tra iLMeteo e 3BMeteo.
          {"\n"}
          Accumulo = valore minimo tra iLMeteo e 3BMeteo.
          {"\n\n"}È la modalità più prudente verso i falsi allarmi.
        </Text>
      </View>

      <View>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          Più prudente
        </Text>

        <Text style={{ color: "#475569", lineHeight: 22 }}>
          Considera sempre lo scenario più piovoso.
          {"\n\n"}
          Probabilità = valore massimo tra iLMeteo e 3BMeteo.
          {"\n"}
          Accumulo = valore massimo tra iLMeteo e 3BMeteo.
          {"\n\n"}È la modalità consigliata per chi preferisce non rischiare di
          sottovalutare una possibile pioggia.
        </Text>
      </View>
    </ScrollView>
  );
}

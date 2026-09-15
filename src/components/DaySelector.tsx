import { View, Pressable, Text } from "react-native";

type Props = {
  giorni: string[];
  giorno: string;
  setGiorno: (giorno: string) => void;
};

export default function DaySelector({
  giorni,
  giorno,
  setGiorno,
}: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
      }}
    >
      {giorni.map((g) => (
        <Pressable
          key={g}
          onPress={() => setGiorno(g)}
          style={{
            backgroundColor:
              giorno === g
                ? "#2563eb"
                : "#e5e7eb",
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color:
                giorno === g
                  ? "white"
                  : "black",
            }}
          >
            {g}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
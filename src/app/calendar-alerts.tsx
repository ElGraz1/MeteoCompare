import { useState, useEffect } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

LocaleConfig.locales["it"] = {
  monthNames: [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ],
  monthNamesShort: [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic",
  ],
  dayNames: [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
};

LocaleConfig.defaultLocale = "it";

export default function CalendarAlertsScreen() {
  const [selectedDates, setSelectedDates] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadDates() {
      const stored = await AsyncStorage.getItem("calendarSelectedDates");

      if (!stored) {
        return;
      }

      const dates: string[] = JSON.parse(stored);

      const loadedDates: Record<string, any> = {};

      dates.forEach((date) => {
        loadedDates[date] = {
          selected: true,
          selectedColor: "#2563eb",
        };
      });

      setSelectedDates(loadedDates);
    }

    loadDates();
  }, []);

  async function saveDates() {
    await AsyncStorage.setItem(
      "calendarSelectedDates",
      JSON.stringify(Object.keys(selectedDates)),
    );

    Alert.alert(
      "Calendario salvato",
      `${Object.keys(selectedDates).length} date salvate`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <Calendar
        firstDay={1}
        enableSwipeMonths
        markedDates={selectedDates}
        onDayPress={(day) => {
          setSelectedDates((prev) => {
            const updated = { ...prev };

            if (updated[day.dateString]) {
              delete updated[day.dateString];
            } else {
              updated[day.dateString] = {
                selected: true,
                selectedColor: "#2563eb",
              };
            }

            return updated;
          });
        }}
      />

      <View
        style={{
          padding: 20,
        }}
      >
        <Text
          style={{
            marginBottom: 15,
            color: "#64748b",
            fontSize: 14,
          }}
        >
          Date selezionate: {Object.keys(selectedDates).length}
        </Text>

        <Pressable
          onPress={saveDates}
          style={{
            backgroundColor: "#2563eb",
            padding: 14,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            Conferma
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LocationInput from "../components/LocationInput";
import { TextInput, Switch } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Modal, FlatList } from "react-native";

export default function SettingsScreen() {
  const [localita, setLocalita] = useState("");

  const [savedMessage, setSavedMessage] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [notificationHour, setNotificationHour] = useState("21:00");

  const [rainThreshold, setRainThreshold] = useState("60");

  const [accumulationThreshold, setAccumulationThreshold] = useState("5");

  const [provider, setProvider] = useState("max");

  const [showTimePicker, setShowTimePicker] = useState(false);

  const [showRainPicker, setShowRainPicker] = useState(false);

  const [showAccumulationPicker, setShowAccumulationPicker] = useState(false);

  const [time, setTime] = useState(new Date());

  const [showRainModal, setShowRainModal] = useState(false);

  const [showAccumulationModal, setShowAccumulationModal] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const values = await AsyncStorage.multiGet([
        "preferredCity",
        "notificationsEnabled",
        "notificationHour",
        "rainThreshold",
        "accumulationThreshold",
        "provider",
      ]);

      const settings = Object.fromEntries(values);

      if (settings.preferredCity) {
        setLocalita(settings.preferredCity);
      }

      if (settings.notificationsEnabled) {
        setNotificationsEnabled(settings.notificationsEnabled === "true");
      }

      if (settings.notificationHour) {
        setNotificationHour(settings.notificationHour);
      }

      if (settings.rainThreshold) {
        setRainThreshold(settings.rainThreshold);
      }

      if (settings.accumulationThreshold) {
        setAccumulationThreshold(settings.accumulationThreshold);
      }

      if (settings.provider) {
        setProvider(settings.provider);
      }
    }

    loadSettings();
  }, []);

  async function savePreferredCity() {
    await AsyncStorage.multiSet([
      ["preferredCity", localita],
      ["notificationsEnabled", String(notificationsEnabled)],
      ["notificationHour", notificationHour],
      ["rainThreshold", rainThreshold],
      ["accumulationThreshold", accumulationThreshold],
      ["provider", provider],
    ]);

    setSavedMessage(true);

    setTimeout(() => {
      setSavedMessage(false);
    }, 2000);
  }

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);

    if (!selectedDate) {
      return;
    }

    setTime(selectedDate);

    const hh = String(selectedDate.getHours()).padStart(2, "0");

    const mm = String(selectedDate.getMinutes()).padStart(2, "0");

    setNotificationHour(`${hh}:${mm}`);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        📍 Località preferita
      </Text>

      <LocationInput localita={localita} setLocalita={setLocalita} />

      <View style={{ marginTop: -35 }} />

      <Text
        style={{
          marginTop: 25,
          marginBottom: 10,
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        🔔 Notifiche pioggia
      </Text>

      <Text
        style={{
          color: "#64748b",
          fontSize: 13,
          marginTop: 4,
          marginBottom: 12,
        }}
      >
        Ti avviseremo la sera prima se è prevista pioggia significativa nella
        località preferita.
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Text>Attiva notifiche</Text>

        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>
      <View
        style={{
          marginTop: -10,
        }}
      >
        <Text>🕘 Ora notifica</Text>

        <Pressable
          onPress={() => setShowTimePicker(true)}
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
            marginBottom: 15,
          }}
        >
          <Text>{notificationHour}</Text>
        </Pressable>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour
            onChange={onTimeChange}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour
            onChange={onTimeChange}
          />
        )}
        <Text>🌧 Probabilità minima (%)</Text>

        <Pressable
          onPress={() => setShowRainModal(true)}
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
            marginBottom: 15,
          }}
        >
          <Text>{rainThreshold}%</Text>
        </Pressable>

        <Text>💧 Accumulo minimo (mm)</Text>

        <Pressable
          onPress={() => setShowAccumulationModal(true)}
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
            marginBottom: 15,
          }}
        >
          <Text>{accumulationThreshold} mm</Text>
        </Pressable>

        <Text>☁️ Provider notifiche</Text>

        <Pressable
          onPress={() => setProvider("max")}
          style={{
            padding: 10,
            backgroundColor: "#e5e7eb",
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <Text>Più prudente</Text>
        </Pressable>

        <Pressable
          onPress={savePreferredCity}
          style={{
            marginTop: 10,
            backgroundColor: "#2563eb",
            padding: 12,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Salva
          </Text>
        </Pressable>
        {savedMessage && (
          <Text
            style={{
              marginTop: 10,
              fontSize: 13,
              color: "#15803d",
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            ✅ Impostazioni salvate
          </Text>
        )}
      </View>
      <Modal visible={showRainModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 15,
              padding: 20,
              maxHeight: 400,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 15,
              }}
            >
              🌧 Probabilità minima
            </Text>

            <FlatList
              data={Array.from({ length: 21 }, (_, i) => i * 5)}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setRainThreshold(String(item));
                    setShowRainModal(false);
                  }}
                  style={{
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {item}%
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
      <Modal visible={showAccumulationModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 15,
              padding: 20,
              maxHeight: 400,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 15,
              }}
            >
              💧 Accumulo minimo
            </Text>

            <FlatList
              data={Array.from({ length: 51 }, (_, i) => i)}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setAccumulationThreshold(String(item));
                    setShowAccumulationModal(false);
                  }}
                  style={{
                    padding: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {item} mm
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

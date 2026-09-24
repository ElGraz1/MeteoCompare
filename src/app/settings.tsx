import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LocationInput from "../components/LocationInput";
import { Switch } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, FlatList } from "react-native";
import { ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { generateNotification } from "../services/notificationService";
import { showLocalNotification } from "../services/localNotificationService";
import { registerNotificationSubscription } from "../services/notificationSubscriptionService";
``;

export default function SettingsScreen() {
  const [localita, setLocalita] = useState("");

  const [savedMessage, setSavedMessage] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [notificationHour, setNotificationHour] = useState("20:00");

  const [rainThreshold, setRainThreshold] = useState("60");

  const [accumulationThreshold, setAccumulationThreshold] = useState("3");

  const [provider, setProvider] = useState("max");

  const [showTimePicker, setShowTimePicker] = useState(false);

  const [time, setTime] = useState(new Date());

  const [showRainModal, setShowRainModal] = useState(false);

  const [showAccumulationModal, setShowAccumulationModal] = useState(false);

  const [criticalStart, setCriticalStart] = useState("07:00");

  const [criticalEnd, setCriticalEnd] = useState("20:00");

  const [showCriticalStartPicker, setShowCriticalStartPicker] = useState(false);

  const [showCriticalEndPicker, setShowCriticalEndPicker] = useState(false);

  const [criticalStartDate, setCriticalStartDate] = useState(new Date());

  const [criticalEndDate, setCriticalEndDate] = useState(new Date());

  async function requestNotificationPermission() {
    const { status } = await Notifications.requestPermissionsAsync();

    return status === "granted";
  }
  useEffect(() => {
    async function loadSettings() {
      const values = await AsyncStorage.multiGet([
        "preferredCity",
        "notificationsEnabled",
        "notificationHour",
        "rainThreshold",
        "accumulationThreshold",
        "provider",
        "criticalStart",
        "criticalEnd",
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
      if (settings.criticalStart) {
        setCriticalStart(settings.criticalStart);
      }

      if (settings.criticalEnd) {
        setCriticalEnd(settings.criticalEnd);
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
      ["criticalStart", criticalStart],
      ["criticalEnd", criticalEnd],
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
  const onCriticalStartChange = (event: any, selectedDate?: Date) => {
    setShowCriticalStartPicker(false);

    if (!selectedDate) {
      return;
    }

    setCriticalStartDate(selectedDate);

    const hh = String(selectedDate.getHours()).padStart(2, "0");

    const mm = String(selectedDate.getMinutes()).padStart(2, "0");

    setCriticalStart(`${hh}:${mm}`);
  };
  const onCriticalEndChange = (event: any, selectedDate?: Date) => {
    setShowCriticalEndPicker(false);

    if (!selectedDate) {
      return;
    }

    setCriticalEndDate(selectedDate);

    const hh = String(selectedDate.getHours()).padStart(2, "0");

    const mm = String(selectedDate.getMinutes()).padStart(2, "0");

    setCriticalEnd(`${hh}:${mm}`);
  };

  const [showProviderModal, setShowProviderModal] = useState(false);

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 40,
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
        {showCriticalStartPicker && (
          <DateTimePicker
            value={criticalStartDate}
            mode="time"
            is24Hour
            onChange={onCriticalStartChange}
          />
        )}
        {showCriticalEndPicker && (
          <DateTimePicker
            value={criticalEndDate}
            mode="time"
            is24Hour
            onChange={onCriticalEndChange}
          />
        )}
        <Text>🌧 Probabilità minima (%)</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 15,
          }}
        >
          <Pressable
            onPress={() => setShowRainModal(true)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text>{rainThreshold}%</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/probability-info")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#dbeafe",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#2563eb",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              i
            </Text>
          </Pressable>
        </View>
        <Text>💧 Accumulo minimo (mm)</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 15,
          }}
        >
          <Pressable
            onPress={() => setShowAccumulationModal(true)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text>{accumulationThreshold} mm</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/accumulation-info")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#dbeafe",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#2563eb",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              i
            </Text>
          </Pressable>
        </View>
        <Text
          style={{
            marginBottom: 8,
          }}
        >
          ☁️ Fonte notifica
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <Pressable
            onPress={() => setShowProviderModal(true)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text>
              {provider === "ilm"
                ? "iLMeteo"
                : provider === "3bm"
                  ? "3BMeteo"
                  : provider === "both"
                    ? "Entrambi"
                    : "Più prudente"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/provider-info")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#dbeafe",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#2563eb",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              i
            </Text>
          </Pressable>
        </View>
        <Text
          style={{
            marginTop: 10,
            marginBottom: 10,
            fontWeight: "bold",
          }}
        >
          ⏰ Ore critiche
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 15,
          }}
        >
          <Pressable
            onPress={() => setShowCriticalStartPicker(true)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text
              style={{
                textAlign: "center",
              }}
            >
              {criticalStart}
            </Text>
          </Pressable>

          <Text
            style={{
              marginHorizontal: 12,
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            →
          </Text>

          <Pressable
            onPress={() => setShowCriticalEndPicker(true)}
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
            }}
          >
            <Text
              style={{
                textAlign: "center",
              }}
            >
              {criticalEnd}
            </Text>
          </Pressable>
        </View>
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
        <Pressable
          onPress={async () => {
            try {
              //da cancellare riga seguente
              await registerNotificationSubscription();

              const granted = await requestNotificationPermission();

              if (!granted) {
                Alert.alert(
                  "Permesso negato",
                  "Le notifiche non sono abilitate.",
                );

                return;
              }

              const notification = await generateNotification();

              if (notification?.message) {
                await showLocalNotification(
                  "🌧 MeteoCompare",
                  notification.message,
                  {
                    city: notification.city,
                    startHour: notification.startHour,
                    endHour: notification.endHour,
                    probability: notification.probability,
                    accumulation: notification.accumulation,
                    provider: notification.provider,
                  },
                );
              } else {
                Alert.alert(
                  "Test motore notifiche",
                  "Nessuna notifica da inviare",
                );
              }
            } catch (error) {
              console.error(error);

              Alert.alert("Errore", "Impossibile generare la notifica.");
            }
          }}
          style={{
            marginTop: 10,
            backgroundColor: "#0f766e",
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
            🔔 Simula notifica
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
                      fontWeight:
                        rainThreshold === String(item) ? "700" : "400",
                      color:
                        rainThreshold === String(item) ? "#2563eb" : "black",
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
                      fontWeight:
                        accumulationThreshold === String(item) ? "700" : "400",
                      color:
                        accumulationThreshold === String(item)
                          ? "#2563eb"
                          : "black",
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
      <Modal visible={showProviderModal} transparent animationType="fade">
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
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 15,
              }}
            >
              ☁️ Fonte notifica
            </Text>

            <Pressable
              onPress={() => {
                setProvider("ilm");
                setShowProviderModal(false);
              }}
              style={{ padding: 12 }}
            >
              <Text
                style={{
                  fontWeight: provider === "ilm" ? "700" : "400",
                  color: provider === "ilm" ? "#2563eb" : "black",
                }}
              >
                iLMeteo
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setProvider("3bm");
                setShowProviderModal(false);
              }}
              style={{ padding: 12 }}
            >
              <Text
                style={{
                  fontWeight: provider === "3bm" ? "700" : "400",
                  color: provider === "3bm" ? "#2563eb" : "black",
                }}
              >
                3BMeteo
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setProvider("both");
                setShowProviderModal(false);
              }}
              style={{ padding: 12 }}
            >
              <Text
                style={{
                  fontWeight: provider === "both" ? "700" : "400",
                  color: provider === "both" ? "#2563eb" : "black",
                }}
              >
                Entrambi
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setProvider("max");
                setShowProviderModal(false);
              }}
              style={{ padding: 12 }}
            >
              <Text
                style={{
                  fontWeight: provider === "max" ? "700" : "400",
                  color: provider === "max" ? "#2563eb" : "black",
                }}
              >
                Più prudente
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

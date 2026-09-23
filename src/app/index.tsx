import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import LocationInput from "../components/LocationInput";
import { getForecastsByCity } from "../services/apiForecastService";
import { useEffect } from "react";
import { weatherIcons } from "../constants/weatherIcons";
import { mapIlMeteoCode } from "../constants/weatherTypeMapper";
import { map3BMeteoDescription } from "../constants/weatherTypeMapper";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { router } from "expo-router";

function getDays() {
  const labels: string[] = [];

  const giorniSettimana = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

  for (let i = 0; i <= 6; i++) {
    const date = new Date();

    date.setDate(date.getDate() + i);

    if (i === 0) {
      labels.push("Oggi");
      continue;
    }

    const giorno = giorniSettimana[date.getDay()];

    const numero = String(date.getDate()).padStart(2, "0");

    labels.push(`${giorno} ${numero}`);
  }

  return labels;
}

export default function HomeScreen() {
  const [orariAperti, setOrariAperti] = useState<string[]>([]);
  const toggleOrario = (ora: string) => {
    if (orariAperti.includes(ora)) {
      setOrariAperti(orariAperti.filter((o) => o !== ora));
    } else {
      setOrariAperti([...orariAperti, ora]);
    }
  };
  const [localita, setLocalita] = useState("");
  const [giorno, setGiorno] = useState("Oggi");
  const [confrontoCorrente, setConfrontoCorrente] = useState<any[]>([]);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  useEffect(() => {
    async function loadPreferredCity() {
      const city = await AsyncStorage.getItem("preferredCity");

      if (city) {
        setLocalita(city);
      } else {
        setShowWelcomeModal(true);
      }
    }

    loadPreferredCity();
  }, []);

  useEffect(() => {
    if (!localita) {
      return;
    }

    const day = giorni.indexOf(giorno);

    setIsLoadingForecast(true);

    getForecastsByCity(localita, day)
      .then((result) => {
        setConfrontoCorrente(result.confronto);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoadingForecast(false);
      });
  }, [localita, giorno]);
  const giorni = getDays();
  if (isLoadingForecast && localita) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f1f5f9",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#2563eb" />

          <Text
            style={{
              marginTop: 12,
              color: "#64748b",
            }}
          >
            Caricamento previsioni...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f1f5f9",
      }}
    >
      <View
        style={{
          flex: 1,
          padding: 20,
        }}
      >
        <LocationInput localita={localita} setLocalita={setLocalita} />
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
              onPress={() => {
                setOrariAperti([]);
                setGiorno(g);
              }}
              style={{
                backgroundColor: giorno === g ? "#2563eb" : "#e5e7eb",
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: giorno === g ? "white" : "black",
                }}
              >
                {g}
              </Text>
            </Pressable>
          ))}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
            }}
          >
            🌍 {localita}
          </Text>

          <Pressable onPress={() => router.push("/settings")}>
            <Text
              style={{
                fontSize: 28,
              }}
            >
              ⚙️
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 15,
              borderRadius: 15,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                marginBottom: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  width: 70,
                  fontWeight: "bold",
                }}
              >
                Ora
              </Text>

              <Text
                style={{
                  width: 110,
                  fontWeight: "bold",
                  color: "#2563eb",
                  textAlign: "left",
                  paddingLeft: 10,
                }}
              >
                iLM
              </Text>

              <Text
                style={{
                  width: 110,
                  fontWeight: "bold",
                  color: "#16a34a",
                  textAlign: "left",
                  paddingLeft: 10,
                }}
              >
                3bM
              </Text>
            </View>

            {confrontoCorrente.map((item) => (
              <View
                key={item.ora}
                style={{
                  marginBottom: 15,
                }}
              >
                <Pressable
                  onPress={() => {
                    const negligibleRain =
                      item.ilMeteo.accumulo <= 0.3 &&
                      (item.treBMeteo?.accumulo ?? 0) <= 0.3;

                    if (!negligibleRain) {
                      toggleOrario(item.ora);
                    }
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          width: 70,
                          fontWeight: "600",
                          fontSize: 16,
                        }}
                      >
                        {item.ora}
                      </Text>

                      <Text
                        style={{
                          width: 110,
                          fontSize: 16,
                        }}
                      >
                        {weatherIcons[mapIlMeteoCode(item.ilMeteo.codiceIcona)]}{" "}
                        {item.ilMeteo.temperatura}°
                      </Text>

                      <Text
                        style={{
                          width: 90,
                          fontSize: 16,
                        }}
                      >
                        {
                          weatherIcons[
                            map3BMeteoDescription(
                              item.treBMeteo?.descrizione ?? "",
                            )
                          ]
                        }{" "}
                        {item.treBMeteo?.temperatura}°
                      </Text>

                      <Text>
                        {!(
                          item.ilMeteo.accumulo <= 0.3 &&
                          (item.treBMeteo?.accumulo ?? 0) <= 0.3
                        )
                          ? orariAperti.includes(item.ora)
                            ? "▲"
                            : "▼"
                          : ""}{" "}
                        {item.alert ? "⚠️" : ""}
                      </Text>
                    </View>
                  </View>
                </Pressable>

                {orariAperti.includes(item.ora) && (
                  <View
                    style={{
                      marginTop: 10,
                      padding: 10,
                      backgroundColor: "#f8fafc",
                      borderRadius: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <Text>iLM</Text>
                        <Text>{item.ilMeteo.probabilita}%</Text>

                        <Text>{item.ilMeteo.accumulo} mm</Text>
                      </View>

                      <View
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <Text>3BM</Text>

                        <Text>{item.treBMeteo?.probabilita}%</Text>

                        <Text>{item.treBMeteo?.accumulo} mm</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <Modal visible={showWelcomeModal} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              🌧 Benvenuto in MeteoCompare
            </Text>

            <Text
              style={{
                textAlign: "center",
                marginBottom: 20,
                color: "#64748b",
              }}
            >
              Seleziona la tua località preferita per iniziare.
            </Text>

            <LocationInput localita={localita} setLocalita={setLocalita} />

            <Text
              style={{
                textAlign: "center",
                marginBottom: 20,
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Potrai modificarla in qualsiasi momento dalle impostazioni.
            </Text>

            <Pressable
              onPress={async () => {
                if (!localita.trim()) {
                  return;
                }

                await AsyncStorage.setItem("preferredCity", localita);

                setShowWelcomeModal(false);
              }}
              style={{
                backgroundColor: "#2563eb",
                padding: 14,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Inizia
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

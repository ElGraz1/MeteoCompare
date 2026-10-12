import { useState, useEffect } from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";

import { searchCity, CitySuggestion } from "../services/ilMeteoService";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BorderRadius,
  Colors,
  Elevation,
  Spacing,
  Typography,
} from "../constants/theme";
import { useColorScheme } from "../hooks/use-color-scheme";

type Props = {
  localita: string;
  setLocalita: (valore: string) => void;
};

export default function LocationInput({ localita, setLocalita }: Props) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const [testo, setTesto] = useState(localita);

  const [suggerimenti, setSuggerimenti] = useState<CitySuggestion[]>([]);
  const [recentCities, setRecentCities] = useState<string[]>([]);

  const [ricercaInCorso, setRicercaInCorso] = useState(false);
  const displayedRecentCities =
    recentCities.length > 0 ? recentCities : localita.trim() ? [localita] : [];

  const handleTestoChange = async (nuovoTesto: string) => {
    setTesto(nuovoTesto);

    if (nuovoTesto.trim().length < 2) {
      setSuggerimenti([]);
      return;
    }

    setRicercaInCorso(true);

    try {
      const risultati = await searchCity(nuovoTesto);
      setSuggerimenti(risultati);
    } finally {
      setRicercaInCorso(false);
    }
  };

  const saveRecentCity = async (city: string) => {
    const updated = [
      city,
      ...recentCities.filter((item) => item !== city),
    ].slice(0, 5);

    setRecentCities(updated);

    await AsyncStorage.setItem("recentCities", JSON.stringify(updated));

    await AsyncStorage.setItem("preferredCity", city);
  };

  const selezionaLocalita = async (localitaScelta: CitySuggestion) => {
    setTesto(localitaScelta.nome);

    setLocalita(localitaScelta.nome);

    setSuggerimenti([]);

    await saveRecentCity(localitaScelta.nome);
  };

  useEffect(() => {
    async function loadRecentCities() {
      const saved = await AsyncStorage.getItem("recentCities");

      if (saved) {
        setRecentCities(JSON.parse(saved));
      }
    }

    loadRecentCities();
  }, []);

  return (
    <View
      style={{
        marginBottom: 0,
        zIndex: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: BorderRadius.md,
          paddingHorizontal: Spacing.md,
          height: 48,
          minHeight: 48,
          ...Elevation.card,
        }}
      >
        <Text
          accessibilityElementsHidden
          style={{
            color: colors.primary,
            fontSize: 19,
            marginRight: Spacing.sm,
          }}
        >
          ⌕
        </Text>
        <TextInput
          value={testo}
          onChangeText={handleTestoChange}
          placeholder="Inserisci località"
          placeholderTextColor={colors.textTertiary}
          autoCorrect={false}
          style={{
            flex: 1,
            color: colors.text,
            fontSize: Typography.scale.body.fontSize,
            paddingVertical: 12,
          }}
        />
        {ricercaInCorso && (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>
      {suggerimenti.length === 0 &&
        displayedRecentCities.length > 0 &&
        testo.trim() === localita.trim() && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 7,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color: colors.textTertiary,
                fontSize: 11,
                fontWeight: "700",
                marginRight: 8,
              }}
            >
              Recenti
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ alignItems: "center", gap: 8 }}
            >
              {displayedRecentCities.map((city) => (
                <Pressable
                  key={city}
                  accessibilityRole="button"
                  onPress={async () => {
                    setTesto(city);
                    setLocalita(city);
                    await saveRecentCity(city);
                  }}
                  style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    {city}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      {suggerimenti.length > 0 && (
        <View
          style={{
            marginTop: 4,
            backgroundColor: colors.surface,
            borderRadius: BorderRadius.md,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight: 250,
            ...Elevation.card,
          }}
        >
          <ScrollView nestedScrollEnabled>
            {suggerimenti.map((suggerimento) => (
              <Pressable
                key={suggerimento.id}
                onPress={() => selezionaLocalita(suggerimento)}
                style={({ pressed }) => ({
                  padding: 14,
                  backgroundColor: pressed
                    ? colors.primaryContainer
                    : colors.surface,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                })}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 17,
                    fontWeight: "500",
                  }}
                >
                  {suggerimento.nome}
                </Text>

                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    color: colors.textSecondary,
                  }}
                >
                  {suggerimento.provincia} · {suggerimento.regione}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {testo.trim().length >= 2 &&
        !ricercaInCorso &&
        suggerimenti.length === 0 &&
        testo !== localita && (
          <Text
            style={{
              marginTop: 6,
              color: colors.textSecondary,
              fontSize: 13,
            }}
          >
            Nessuna località trovata
          </Text>
        )}
    </View>
  );
}

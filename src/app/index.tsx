import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LocationInput from "../components/LocationInput";
import {
  BorderRadius,
  Colors,
  Elevation,
  Spacing,
  Typography,
  type AppTheme,
} from "../constants/theme";
import { weatherIcons } from "../constants/weatherIcons";
import { mapDescriptionToWeatherType } from "../constants/weatherTypeMapper";
import { useColorScheme } from "../hooks/use-color-scheme";
import {
  clearForecastCache,
  getForecastsByCity,
} from "../services/apiForecastService";
import type { ForecastComparisonItem } from "../services/forecastAggregatorService";
import type { ForecastItem } from "../types/ForecastItem";

function getDays() {
  const labels: {
    value: string;
    label: string;
    subtitle: string;
    fullSubtitle: string;
  }[] = [];
  const weekdays = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const fullWeekdays = [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ];
  const months = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  const fullMonths = [
    "gennaio",
    "febbraio",
    "marzo",
    "aprile",
    "maggio",
    "giugno",
    "luglio",
    "agosto",
    "settembre",
    "ottobre",
    "novembre",
    "dicembre",
  ];

  for (let offset = 0; offset <= 6; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const weekday = weekdays[date.getDay()];
    const dateLabel = `${date.getDate()} ${months[date.getMonth()]}`;
    const fullDateLabel = `${fullWeekdays[date.getDay()]} ${date.getDate()} ${fullMonths[date.getMonth()]}`;
    const value =
      offset === 0
        ? "Oggi"
        : `${weekday} ${String(date.getDate()).padStart(2, "0")}`;

    labels.push({
      value,
      label: offset === 0 ? "Oggi" : weekday,
      subtitle: dateLabel,
      fullSubtitle: fullDateLabel,
    });
  }

  return labels;
}

function WeatherDetails({ forecast }: { forecast: ForecastItem | null }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  if (!forecast) {
    return (
      <View style={styles.missingForecast}>
        <Text style={[styles.missingText, { color: colors.textSecondary }]}>
          Dato non disponibile
        </Text>
      </View>
    );
  }

  const details = [
    ["Condizioni", forecast.descrizione],
    ["Vento", forecast.vento],
    ["Umidità", `${forecast.umidita}%`],
    ["Pioggia", `${forecast.probabilita}% · ${forecast.accumulo} mm`],
  ];

  return (
    <View>
      {details.map(([label, value]) => (
        <View key={label} style={styles.detailLine}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            {label}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.detailValue, { color: colors.text }]}
          >
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const days = useMemo(() => getDays(), []);
  const [openHour, setOpenHour] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [selectedDay, setSelectedDay] = useState("Oggi");
  const [comparison, setComparison] = useState<ForecastComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    async function loadPreferredCity() {
      const city = await AsyncStorage.getItem("preferredCity");
      if (city) {
        setLocation(city);
      } else {
        setShowWelcomeModal(true);
      }
    }

    void loadPreferredCity();
  }, []);

  const loadForecast = useCallback(
    async (refreshCache = false) => {
      if (!location.trim()) {
        return;
      }

      const dayIndex = days.findIndex((day) => day.value === selectedDay);
      setIsLoading(true);

      try {
        if (refreshCache) {
          await clearForecastCache(location);
        }
        const result = await getForecastsByCity(location, dayIndex);
        setComparison(result.confronto);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [days, location, selectedDay],
  );

  useEffect(() => {
    const request = setTimeout(() => {
      void loadForecast();
    }, 0);

    return () => clearTimeout(request);
  }, [loadForecast]);

  const alertCount = comparison.filter((item) => item.alert).length;
  const highlightedForecast =
    comparison.find((item) => item.ilMeteo || item.treBMeteo)?.ilMeteo ??
    comparison.find((item) => item.ilMeteo || item.treBMeteo)?.treBMeteo ??
    null;
  const highlightedWeather = highlightedForecast
    ? mapDescriptionToWeatherType(highlightedForecast.descrizione)
    : null;

  const saveWelcomeLocation = async () => {
    if (!location.trim()) {
      return;
    }

    await AsyncStorage.setItem("preferredCity", location);
    setShowWelcomeModal(false);
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.page}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="Icona MeteoCompare"
              source={require("../../assets/images/icon.png")}
              style={styles.brandMark}
            />
            <View>
              <Text style={[styles.brandName, { color: colors.text }]}>
                MeteoCompare
              </Text>
              <Text style={[styles.brandCaption, { color: colors.textTertiary }]}>
                Due fonti. Una vista chiara.
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Aggiorna previsioni"
              accessibilityRole="button"
              disabled={isLoading || !location}
              onPress={() => void loadForecast(true)}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={[styles.actionGlyph, { color: colors.textSecondary }]}>
                  ↻
                </Text>
              )}
            </Pressable>
            <Pressable
              accessibilityLabel="Apri impostazioni"
              accessibilityRole="button"
              onPress={() => router.push("/settings")}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.actionGlyph, { color: colors.textSecondary }]}>
                ⚙
              </Text>
            </Pressable>
          </View>
        </View>

        <LocationInput
          key={location}
          localita={location}
          setLocalita={setLocation}
        />

        <ScrollView
          horizontal
          style={styles.daysViewport}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.days}
          accessibilityLabel="Giorni di previsione"
        >
          {days.map((day) => {
            const selected = selectedDay === day.value;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={day.value}
                onPress={() => {
                  setOpenHour(null);
                  setSelectedDay(day.value);
                }}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: selected
                      ? colors.primary
                      : colors.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: selected ? colors.onPrimary : colors.textSecondary },
                  ]}
                >
                  {day.label}
                </Text>
                <Text
                  style={[
                    styles.daySubtext,
                    { color: selected ? colors.onPrimary : colors.textTertiary },
                  ]}
                >
                  {day.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.cityHeading}>
          <View style={styles.cityDetails}>
            <Text style={[styles.eyebrow, { color: colors.textTertiary }]}>
              LA TUA LOCALITÀ
            </Text>
            <Text style={[styles.cityName, { color: colors.text }]}>
              {location || "Scegli una località"}
            </Text>
            <Text style={[styles.citySubtitle, { color: colors.textSecondary }]}>
              {selectedDay === "Oggi"
                ? `Oggi · ${days[0].fullSubtitle}`
                : `${selectedDay} · ${days.find((day) => day.value === selectedDay)?.fullSubtitle}`}
            </Text>
          </View>
          {highlightedForecast && highlightedWeather ? (
            <View style={styles.currentWeather}>
              <Text style={styles.currentWeatherIcon}>
                {weatherIcons[highlightedWeather]}
              </Text>
              <View>
                <Text style={[styles.currentTemperature, { color: colors.text }]}>
                  {highlightedForecast.temperatura}°
                </Text>
                <Text style={[styles.currentWeatherLabel, { color: colors.textSecondary }]}>
                  {highlightedForecast.descrizione}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.primaryContainer },
          ]}
        >
          <View style={[styles.summaryIcon, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.primary, fontSize: 18 }}>↗</Text>
          </View>
          <View pointerEvents="none" style={styles.summaryOuterRing} />
          <View pointerEvents="none" style={styles.summaryInnerRing} />
          <View style={styles.summaryCopy}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {selectedDay === "Oggi"
                ? "Il confronto di oggi"
                : `Il confronto di ${selectedDay}`}
            </Text>
            <Text style={[styles.summaryDescription, { color: colors.textSecondary }]}>
              {alertCount > 0
                ? "Previsioni simili, con alcune differenze."
                : "I due provider sono in linea sulle fasce orarie."}
            </Text>
          </View>
          <View
            style={[
              styles.alertBadge,
              {
                backgroundColor:
                  alertCount > 0 ? colors.warningContainer : colors.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.alertBadgeText,
                { color: alertCount > 0 ? colors.warning : colors.textSecondary },
              ]}
            >
              {alertCount > 0
                ? `${alertCount} da notare`
                : "In linea"}
            </Text>
          </View>
        </View>

        <View style={styles.forecastHeading}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Previsioni orarie
          </Text>
          <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>
            Tocca un’ora per i dettagli
          </Text>
        </View>

        {isLoading && comparison.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Caricamento previsioni…
            </Text>
          </View>
        ) : comparison.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.emptyIcon}>☁️</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {location
                ? "Non ci sono previsioni disponibili per questo giorno."
                : "Cerca una località per confrontare le previsioni."}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.forecastScroll}
            contentContainerStyle={styles.forecastList}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.forecastGroup,
                { backgroundColor: colors.surface },
              ]}
            >
            {comparison.map((item, index) => {
              const open = openHour === item.ora;

              return (
                <View
                  key={item.ora}
                  style={[
                    styles.forecastRow,
                    index > 0 && {
                      borderTopColor: colors.border,
                      borderTopWidth: StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    onPress={() => setOpenHour(open ? null : item.ora)}
                    style={({ pressed }) => [
                      styles.hourRow,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.hour, { color: colors.text }]}>
                      {item.ora}
                    </Text>
                    <View style={styles.providerColumns}>
                      <ProviderSummary
                        forecast={item.ilMeteo}
                        label="iLMeteo"
                        color={colors.providerIlMeteo}
                        colors={colors}
                      />
                      <ProviderSummary
                        forecast={item.treBMeteo}
                        label="3BMeteo"
                        color={colors.provider3BMeteo}
                        colors={colors}
                      />
                    </View>
                    <View style={styles.rowTrailing}>
                      {item.alert ? (
                        <View
                          style={[
                            styles.alertPill,
                            { backgroundColor: colors.warningContainer },
                          ]}
                        >
                          <Text style={[styles.alertPillText, { color: colors.warning }]}>
                            DIFF.
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.alertPlaceholder} />
                      )}
                      <Text style={[styles.chevron, { color: colors.textTertiary }]}>
                        {open ? "⌃" : "⌄"}
                      </Text>
                    </View>
                  </Pressable>
                  {open ? (
                    <View
                      style={[
                        styles.details,
                      ]}
                    >
                      <View
                        style={[
                          styles.detailColumn,
                          { backgroundColor: colors.surfaceVariant },
                        ]}
                      >
                        <Text
                          style={[
                            styles.detailProvider,
                            { color: colors.providerIlMeteo },
                          ]}
                        >
                          iLMETEO
                        </Text>
                        <WeatherDetails forecast={item.ilMeteo} />
                      </View>
                      <View
                        style={[
                          styles.detailColumn,
                          { backgroundColor: colors.surfaceVariant },
                        ]}
                      >
                        <Text
                          style={[
                            styles.detailProvider,
                            { color: colors.provider3BMeteo },
                          ]}
                        >
                          3BMETEO
                        </Text>
                        <WeatherDetails forecast={item.treBMeteo} />
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
            </View>
          </ScrollView>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={showWelcomeModal}
        onRequestClose={() => setShowWelcomeModal(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.scrim }]}>
          <View
            style={[
              styles.welcomeCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={[styles.welcomeIcon, { backgroundColor: colors.primaryContainer }]}>
              <Text style={{ fontSize: 27 }}>🌦️</Text>
            </View>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              Benvenuto in MeteoCompare
            </Text>
            <Text style={[styles.welcomeCopy, { color: colors.textSecondary }]}>
              Scegli la tua località preferita per iniziare a confrontare le previsioni.
            </Text>
            <LocationInput
              key={location}
              localita={location}
              setLocalita={setLocation}
            />
            <Pressable
              accessibilityRole="button"
              disabled={!location.trim()}
              onPress={() => void saveWelcomeLocation()}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                  opacity: location.trim() ? (pressed ? 0.85 : 1) : 0.5,
                },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
                Inizia
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ProviderSummary({
  forecast,
  label,
  color,
  colors,
}: {
  forecast: ForecastItem | null;
  label: string;
  color: string;
  colors: AppTheme;
}) {
  const weatherType = forecast
    ? mapDescriptionToWeatherType(forecast.descrizione)
    : null;

  return (
    <View
      style={[
        styles.provider,
        { backgroundColor: colors.surfaceVariant, borderLeftColor: color },
      ]}
    >
      <Text style={[styles.providerLabel, { color: colors.textSecondary }]}>
        <Text style={[styles.providerDot, { color }]}>● </Text>
        {label}
      </Text>
      <Text style={[styles.providerValue, { color: colors.text }]}>
        {weatherType ? `${weatherIcons[weatherType]}  ` : ""}
        {forecast ? `${forecast.temperatura}°` : "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.sm,
  },
  brandName: { ...Typography.scale.subtitle, fontWeight: "700" },
  brandCaption: { ...Typography.scale.micro, marginTop: 1 },
  actions: { flexDirection: "row", gap: Spacing.sm },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    ...Elevation.card,
  },
  actionGlyph: { fontSize: 21, fontWeight: "500" },
  pressed: { opacity: 0.76 },
  daysViewport: {
    height: 52,
    flexGrow: 0,
    flexShrink: 0,
  },
  days: {
    alignItems: "center",
    gap: 7,
    paddingRight: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dayChip: {
    minWidth: 61,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: BorderRadius.sm,
    ...Elevation.card,
  },
  dayText: { ...Typography.scale.label },
  daySubtext: { ...Typography.scale.micro, marginTop: 2 },
  cityHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  cityDetails: { flex: 1, paddingRight: Spacing.sm },
  eyebrow: { ...Typography.scale.micro, letterSpacing: 1 },
  cityName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    marginTop: Spacing.xs,
    letterSpacing: -0.6,
  },
  citySubtitle: { ...Typography.scale.caption, marginTop: Spacing.xs },
  currentWeather: {
    maxWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currentWeatherIcon: { fontSize: 30 },
  currentTemperature: { ...Typography.scale.title, fontSize: 25 },
  currentWeatherLabel: { ...Typography.scale.micro, maxWidth: 100 },
  summaryCard: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 68,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginBottom: Spacing.md,
    overflow: "hidden",
    borderRadius: BorderRadius.lg,
  },
  summaryOuterRing: {
    position: "absolute",
    width: 104,
    height: 104,
    right: -23,
    top: -21,
    borderWidth: 1,
    borderColor: "rgba(75, 137, 226, 0.15)",
    borderRadius: 52,
  },
  summaryInnerRing: {
    position: "absolute",
    width: 77,
    height: 77,
    right: -9,
    top: -7,
    borderWidth: 1,
    borderColor: "rgba(75, 137, 226, 0.12)",
    borderRadius: 40,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.sm,
  },
  summaryCopy: { flex: 1, zIndex: 1 },
  summaryTitle: { ...Typography.scale.label },
  summaryDescription: { ...Typography.scale.micro, marginTop: 3 },
  alertBadge: {
    zIndex: 1,
    maxWidth: 102,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  alertBadgeText: { ...Typography.scale.micro, textAlign: "center" },
  forecastHeading: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  sectionTitle: { ...Typography.scale.subtitle },
  sectionHint: { ...Typography.scale.micro, marginLeft: Spacing.sm },
  forecastScroll: { flex: 1 },
  forecastList: { paddingBottom: Spacing.xl },
  forecastGroup: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.lg,
    ...Elevation.card,
  },
  forecastRow: {
    paddingVertical: 13,
  },
  hourRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  hour: { width: 39, flexShrink: 0, ...Typography.scale.label },
  providerColumns: { flex: 1, flexDirection: "row", gap: 7 },
  provider: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderLeftWidth: 2,
    borderRadius: BorderRadius.xs,
  },
  providerLabel: { ...Typography.scale.micro, fontSize: 10 },
  providerDot: { fontSize: 8 },
  providerValue: {
    ...Typography.scale.label,
    marginTop: 2,
    fontSize: 15,
  },
  rowTrailing: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  alertPill: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
  },
  alertPillText: { fontSize: 9, fontWeight: "800" },
  alertPlaceholder: { height: 15 },
  chevron: { fontSize: 14, lineHeight: 15 },
  details: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 48,
    paddingTop: 12,
    paddingBottom: 2,
  },
  detailColumn: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    borderRadius: 12,
  },
  detailProvider: {
    ...Typography.scale.micro,
    marginBottom: 7,
    letterSpacing: 0.5,
  },
  detailLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3,
  },
  detailLabel: { ...Typography.scale.micro, fontSize: 10, flexShrink: 0 },
  detailValue: {
    ...Typography.scale.micro,
    fontSize: 10,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
  missingForecast: { paddingVertical: Spacing.sm },
  missingText: { ...Typography.scale.micro },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    minHeight: 132,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Elevation.card,
  },
  emptyIcon: { fontSize: 25 },
  emptyText: { ...Typography.scale.body, textAlign: "center" },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  welcomeCard: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    ...Elevation.raised,
  },
  welcomeIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  welcomeTitle: { ...Typography.scale.title, marginBottom: Spacing.xs },
  welcomeCopy: { ...Typography.scale.body, marginBottom: Spacing.md },
  primaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  primaryButtonText: { ...Typography.scale.subtitle },
});

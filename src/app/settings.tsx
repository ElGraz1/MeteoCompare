import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Stack, router } from "expo-router";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
import { useColorScheme } from "../hooks/use-color-scheme";
import { getInstallationId } from "../services/installationIdService";
import { registerNotificationSubscription } from "../services/notificationSubscriptionService";
import type { NotificationProvider } from "../services/notificationEvaluator";

type NotificationMode = "daily" | "custom";

function timeFromString(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

function formatTime(value: Date) {
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  const [location, setLocation] = useState("");
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationHour, setNotificationHour] = useState("20:00");
  const [rainThreshold, setRainThreshold] = useState("60");
  const [accumulationThreshold, setAccumulationThreshold] = useState("3");
  const [provider, setProvider] = useState<NotificationProvider>("max");
  const [notificationMode, setNotificationMode] =
    useState<NotificationMode>("daily");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, setTime] = useState(() => timeFromString("20:00"));
  const [showRainModal, setShowRainModal] = useState(false);
  const [showAccumulationModal, setShowAccumulationModal] = useState(false);
  const [criticalStart, setCriticalStart] = useState("07:00");
  const [criticalEnd, setCriticalEnd] = useState("20:00");
  const [showCriticalStartPicker, setShowCriticalStartPicker] = useState(false);
  const [showCriticalEndPicker, setShowCriticalEndPicker] = useState(false);
  const [criticalStartDate, setCriticalStartDate] = useState(() =>
    timeFromString("07:00"),
  );
  const [criticalEndDate, setCriticalEndDate] = useState(() =>
    timeFromString("20:00"),
  );
  const [calendarSelectedDates, setCalendarSelectedDates] = useState<string[]>([]);
  const [showNotificationModeModal, setShowNotificationModeModal] =
    useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const values = await AsyncStorage.multiGet([
          "preferredCity",
          "notificationsEnabled",
          "notificationHour",
          "rainThreshold",
          "accumulationThreshold",
          "provider",
          "criticalStart",
          "criticalEnd",
          "notificationMode",
          "calendarSelectedDates",
        ]);
        const settings = Object.fromEntries(values);

        if (settings.preferredCity) setLocation(settings.preferredCity);
        if (settings.notificationsEnabled) {
          setNotificationsEnabled(settings.notificationsEnabled === "true");
        }
        if (settings.notificationHour) {
          setNotificationHour(settings.notificationHour);
          setTime(timeFromString(settings.notificationHour));
        }
        if (settings.rainThreshold) setRainThreshold(settings.rainThreshold);
        if (settings.accumulationThreshold) {
          setAccumulationThreshold(settings.accumulationThreshold);
        }
        if (
          settings.provider === "ilm" ||
          settings.provider === "3bm" ||
          settings.provider === "both" ||
          settings.provider === "max"
        ) {
          setProvider(settings.provider);
        }
        if (
          settings.notificationMode === "daily" ||
          settings.notificationMode === "custom"
        ) {
          setNotificationMode(settings.notificationMode);
        }
        if (settings.criticalStart) {
          setCriticalStart(settings.criticalStart);
          setCriticalStartDate(timeFromString(settings.criticalStart));
        }
        if (settings.criticalEnd) {
          setCriticalEnd(settings.criticalEnd);
          setCriticalEndDate(timeFromString(settings.criticalEnd));
        }
        if (settings.calendarSelectedDates) {
          const parsedDates: unknown = JSON.parse(settings.calendarSelectedDates);
          if (
            Array.isArray(parsedDates) &&
            parsedDates.every((date) => typeof date === "string")
          ) {
            setCalendarSelectedDates(parsedDates);
          }
        }
      } catch (error) {
        console.error("Impossibile caricare le impostazioni:", error);
        setSaveError("Non è stato possibile caricare tutte le preferenze salvate.");
      }
    }

    void loadSettings();
  }, []);

  async function saveSettings() {
    setSaving(true);
    setSaveError(null);
    setSavedMessage(false);

    try {
      await AsyncStorage.multiSet([
        ["preferredCity", location],
        ["notificationsEnabled", String(notificationsEnabled)],
        ["notificationHour", notificationHour],
        ["rainThreshold", rainThreshold],
        ["accumulationThreshold", accumulationThreshold],
        ["provider", provider],
        ["criticalStart", criticalStart],
        ["criticalEnd", criticalEnd],
        ["notificationMode", notificationMode],
      ]);

      await Notifications.requestPermissionsAsync();
      const installationId = await getInstallationId();
      const pushToken = await Notifications.getExpoPushTokenAsync();

      await registerNotificationSubscription({
        installationId,
        expoPushToken: pushToken.data,
        city: location,
        provider,
        probabilityThreshold: rainThreshold,
        accumulationThreshold,
        notificationHour,
        criticalStart,
        criticalEnd,
        notificationsEnabled,
        notificationMode,
        selectedDates: calendarSelectedDates,
      });

      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    } catch (error) {
      console.error("Impossibile salvare le impostazioni:", error);
      setSaveError(
        "Salvataggio non riuscito. Controlla la connessione e riprova.",
      );
    } finally {
      setSaving(false);
    }
  }

  const onNotificationTimeChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowTimePicker(false);
    if (!selectedDate) return;
    setTime(selectedDate);
    setNotificationHour(formatTime(selectedDate));
  };

  const onCriticalStartChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowCriticalStartPicker(false);
    if (!selectedDate) return;
    setCriticalStartDate(selectedDate);
    setCriticalStart(formatTime(selectedDate));
  };

  const onCriticalEndChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowCriticalEndPicker(false);
    if (!selectedDate) return;
    setCriticalEndDate(selectedDate);
    setCriticalEnd(formatTime(selectedDate));
  };

  const providerName =
    provider === "ilm"
      ? "iLMeteo"
      : provider === "3bm"
        ? "3BMeteo"
        : provider === "both"
          ? "Entrambi"
          : "Più prudente";

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Torna indietro"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surface },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.backGlyph, { color: colors.text }]}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: colors.text }]}>
              Impostazioni
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Personalizza località e avvisi meteo.
            </Text>
          </View>
        </View>

        <SettingsSection title="LOCALITÀ" colors={colors}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowLocationEditor(true)}
            style={[
              styles.locationCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={[styles.leadingIcon, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.leadingGlyph, { color: colors.primary }]}>⌖</Text>
            </View>
            <View style={styles.locationCopy}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Località preferita
              </Text>
              <Text style={[styles.rowHint, { color: colors.textTertiary }]}>
                Usata per previsioni e notifiche
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={[styles.locationValue, { color: colors.textSecondary }]}
            >
              {location || "Seleziona"}
            </Text>
            <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
          </Pressable>
        </SettingsSection>

        <SettingsSection
          title="NOTIFICHE METEO"
          badge={notificationsEnabled ? "ATTIVE" : "DISATTIVATE"}
          colors={colors}
        >
          <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <LeadingIcon glyph="♧" colors={colors} />
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Avvisi pioggia
                </Text>
                <Text style={[styles.rowHint, { color: colors.textTertiary }]}>
                  Notifiche per pioggia significativa
                </Text>
              </View>
              <Switch
                accessibilityLabel="Attiva notifiche meteo"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.outline, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
            <SettingRow
              glyph="◷"
              title="Frequenza"
              hint="Quando vuoi ricevere gli avvisi"
              value={notificationMode === "daily" ? "Quotidiana" : "Personalizzata"}
              colors={colors}
              onPress={() => setShowNotificationModeModal(true)}
            />
            <SettingRow
              glyph="▦"
              title="Calendario"
              hint={
                notificationMode === "daily"
                  ? "Disponibile con frequenza personalizzata"
                  : `${calendarSelectedDates.length} date selezionate`
              }
              value={
                notificationMode === "daily"
                  ? "Non attivo"
                  : `${calendarSelectedDates.length} date`
              }
              colors={colors}
              disabled={notificationMode === "daily"}
              onPress={() => router.push("/calendar-alerts")}
            />
            <SettingRow
              glyph="◷"
              title="Ora notifica"
              hint="Promemoria del giorno prima"
              value={notificationHour}
              colors={colors}
              onPress={() => setShowTimePicker(true)}
            />
          </View>
        </SettingsSection>

        <SettingsSection title="CRITERI METEO" colors={colors}>
          <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
            <SettingRow
              glyph="☂"
              title="Probabilità minima"
              hint="Soglia per generare un avviso"
              value={`${rainThreshold}%`}
              colors={colors}
              onPress={() => setShowRainModal(true)}
              onInfoPress={() => router.push("/probability-info")}
            />
            <SettingRow
              glyph="⌁"
              title="Accumulo minimo"
              hint="Quantità minima di pioggia"
              value={`${accumulationThreshold} mm`}
              colors={colors}
              onPress={() => setShowAccumulationModal(true)}
              onInfoPress={() => router.push("/accumulation-info")}
            />
            <SettingRow
              glyph="◉"
              title="Fonte notifica"
              hint="Provider usato per valutare la pioggia"
              value={providerName}
              colors={colors}
              onPress={() => setShowProviderModal(true)}
              onInfoPress={() => router.push("/provider-info")}
            />
            <View style={styles.settingRow}>
              <LeadingIcon glyph="◷" colors={colors} />
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  Ore critiche
                </Text>
                <Text style={[styles.rowHint, { color: colors.textTertiary }]}>
                  Fascia da monitorare
                </Text>
              </View>
              <Pressable
                accessibilityLabel={`Ora iniziale ${criticalStart}`}
                accessibilityRole="button"
                onPress={() => setShowCriticalStartPicker(true)}
                style={[styles.timeChip, { backgroundColor: colors.surfaceVariant }]}
              >
                <Text style={[styles.timeText, { color: colors.text }]}>
                  {criticalStart}
                </Text>
              </Pressable>
              <Text style={[styles.timeSeparator, { color: colors.textTertiary }]}>
                —
              </Text>
              <Pressable
                accessibilityLabel={`Ora finale ${criticalEnd}`}
                accessibilityRole="button"
                onPress={() => setShowCriticalEndPicker(true)}
                style={[styles.timeChip, { backgroundColor: colors.surfaceVariant }]}
              >
                <Text style={[styles.timeText, { color: colors.text }]}>
                  {criticalEnd}
                </Text>
              </Pressable>
            </View>
          </View>
        </SettingsSection>

        {showTimePicker ? (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour
            onChange={onNotificationTimeChange}
          />
        ) : null}
        {showCriticalStartPicker ? (
          <DateTimePicker
            value={criticalStartDate}
            mode="time"
            is24Hour
            onChange={onCriticalStartChange}
          />
        ) : null}
        {showCriticalEndPicker ? (
          <DateTimePicker
            value={criticalEndDate}
            mode="time"
            is24Hour
            onChange={onCriticalEndChange}
          />
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={() => void saveSettings()}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              opacity: saving ? 0.65 : pressed ? 0.86 : 1,
            },
          ]}
        >
          <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
            {saving ? "Salvataggio…" : "Salva impostazioni"}
          </Text>
        </Pressable>
        {savedMessage ? (
          <Text style={[styles.feedback, { color: colors.success }]}>
            ✓ Preferenze salvate
          </Text>
        ) : null}
        {saveError ? (
          <Text
            accessibilityRole="alert"
            style={[styles.feedback, { color: colors.error }]}
          >
            {saveError}
          </Text>
        ) : null}
      </ScrollView>

      <Modal
        visible={showLocationEditor}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationEditor(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.scrim }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chiudi selezione località"
            onPress={() => setShowLocationEditor(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Località preferita
            </Text>
            <LocationInput
              key={location}
              localita={location}
              setLocalita={setLocation}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowLocationEditor(false)}
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
                Fatto
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ChoiceModal
        title="Probabilità minima"
        visible={showRainModal}
        selected={rainThreshold}
        values={Array.from({ length: 21 }, (_, index) => String(index * 5))}
        formatValue={(value) => `${value}%`}
        onSelect={(value) => {
          setRainThreshold(value);
          setShowRainModal(false);
        }}
        onClose={() => setShowRainModal(false)}
      />
      <ChoiceModal
        title="Accumulo minimo"
        visible={showAccumulationModal}
        selected={accumulationThreshold}
        values={Array.from({ length: 51 }, (_, index) => String(index))}
        formatValue={(value) => `${value} mm`}
        onSelect={(value) => {
          setAccumulationThreshold(value);
          setShowAccumulationModal(false);
        }}
        onClose={() => setShowAccumulationModal(false)}
      />
      <ChoiceModal
        title="Frequenza notifiche"
        visible={showNotificationModeModal}
        selected={notificationMode}
        values={["daily", "custom"] as const}
        formatValue={(value) =>
          value === "daily" ? "Quotidiana" : "Personalizzata"
        }
        onSelect={(value) => {
          setNotificationMode(value);
          setShowNotificationModeModal(false);
        }}
        onClose={() => setShowNotificationModeModal(false)}
      />
      <ChoiceModal
        title="Fonte notifica"
        visible={showProviderModal}
        selected={provider}
        values={["ilm", "3bm", "both", "max"] as const}
        formatValue={(value) =>
          value === "ilm"
            ? "iLMeteo"
            : value === "3bm"
              ? "3BMeteo"
              : value === "both"
                ? "Entrambi"
                : "Più prudente"
        }
        onSelect={(value) => {
          setProvider(value);
          setShowProviderModal(false);
        }}
        onClose={() => setShowProviderModal(false)}
      />
    </SafeAreaView>
  );
}

function SettingsSection({
  title,
  badge,
  colors,
  children,
}: {
  title: string;
  badge?: string;
  colors: AppTheme;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
          {title}
        </Text>
        {badge ? (
          <Text style={[styles.sectionBadge, { color: colors.success, backgroundColor: colors.successContainer }]}>
            {badge}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function LeadingIcon({
  glyph,
  colors,
}: {
  glyph: string;
  colors: AppTheme;
}) {
  return (
    <View style={[styles.leadingIcon, { backgroundColor: colors.primaryContainer }]}>
      <Text style={[styles.leadingGlyph, { color: colors.primary }]}>{glyph}</Text>
    </View>
  );
}

function SettingRow({
  glyph,
  title,
  hint,
  value,
  colors,
  disabled = false,
  onPress,
  onInfoPress,
}: {
  glyph: string;
  title: string;
  hint?: string;
  value: string;
  colors: (typeof Colors)[keyof typeof Colors];
  disabled?: boolean;
  onPress: () => void;
  onInfoPress?: () => void;
}) {
  return (
    <View
      style={[
        styles.settingRow,
        styles.separatedRow,
        { borderTopColor: colors.border },
        disabled && styles.disabledRow,
      ]}
    >
      <LeadingIcon glyph={glyph} colors={colors} />
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [styles.rowCopy, pressed && styles.pressed]}
      >
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        {hint ? (
          <Text style={[styles.rowHint, { color: colors.textTertiary }]}>
            {hint}
          </Text>
        ) : null}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [styles.valuePressable, pressed && styles.pressed]}
      >
        <Text
          numberOfLines={1}
          style={[styles.rowValue, { color: colors.textSecondary }]}
        >
          {value}
        </Text>
      </Pressable>
      {onInfoPress ? (
        <Pressable
          accessibilityLabel={`Informazioni: ${title}`}
          accessibilityRole="button"
          onPress={onInfoPress}
          style={({ pressed }) => [
            styles.infoButton,
            { backgroundColor: colors.primaryContainer },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.infoText, { color: colors.primary }]}>i</Text>
        </Pressable>
      ) : (
        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
      )}
    </View>
  );
}

function ChoiceModal<T extends string>({
  title,
  visible,
  selected,
  values,
  formatValue,
  onSelect,
  onClose,
}: {
  title: string;
  visible: boolean;
  selected: T;
  values: readonly T[];
  formatValue: (value: T) => string;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalBackdrop, { backgroundColor: colors.scrim }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chiudi finestra"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <FlatList
            data={values}
            keyExtractor={(value) => value}
            style={styles.choiceList}
            renderItem={({ item }) => {
              const isSelected = item === selected;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect(item)}
                  style={[
                    styles.choiceRow,
                    isSelected && { backgroundColor: colors.primaryContainer },
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontWeight: isSelected ? "700" : "500",
                      },
                    ]}
                  >
                    {formatValue(item)}
                  </Text>
                  {isSelected ? (
                    <Text style={[styles.choiceCheck, { color: colors.primary }]}>
                      ✓
                    </Text>
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    ...Elevation.card,
  },
  backGlyph: { fontSize: 28, lineHeight: 32 },
  headerCopy: { flex: 1 },
  title: { ...Typography.scale.title },
  subtitle: { ...Typography.scale.caption, marginTop: Spacing.xs },
  section: { marginTop: Spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionLabel: { ...Typography.scale.micro, letterSpacing: 1.1 },
  sectionBadge: {
    overflow: "hidden",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    fontSize: 9,
    fontWeight: "800",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 60,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Elevation.card,
  },
  locationCopy: { flex: 1 },
  locationValue: { maxWidth: 105, ...Typography.scale.caption, fontWeight: "600" },
  settingsCard: {
    overflow: "hidden",
    borderRadius: BorderRadius.md,
    ...Elevation.card,
  },
  settingRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  separatedRow: { borderTopWidth: StyleSheet.hairlineWidth },
  leadingIcon: {
    width: 32,
    height: 32,
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.xs,
  },
  leadingGlyph: { fontSize: 16, fontWeight: "600" },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { ...Typography.scale.label },
  rowHint: { ...Typography.scale.micro, marginTop: 4 },
  rowValue: { ...Typography.scale.caption, fontWeight: "600" },
  valuePressable: { maxWidth: 118, alignItems: "flex-end" },
  chevron: { marginLeft: -2, fontSize: 19 },
  infoButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.pill,
  },
  infoText: { fontSize: 15, fontWeight: "800" },
  disabledRow: { opacity: 0.55 },
  timeChip: { paddingVertical: 8, paddingHorizontal: 9, borderRadius: 8 },
  timeText: { ...Typography.scale.caption, fontWeight: "700" },
  timeSeparator: { ...Typography.scale.caption },
  saveButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 19,
    borderRadius: BorderRadius.md,
    ...Elevation.card,
  },
  saveButtonText: { ...Typography.scale.subtitle },
  feedback: { ...Typography.scale.caption, marginTop: Spacing.sm, textAlign: "center" },
  pressed: { opacity: 0.74 },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "76%",
    alignSelf: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Elevation.raised,
  },
  modalTitle: { ...Typography.scale.title, marginBottom: Spacing.md },
  choiceList: { flexGrow: 0 },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 46,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  choiceText: { ...Typography.scale.body },
  choiceCheck: { ...Typography.scale.subtitle },
});

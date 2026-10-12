import { Platform } from "react-native";

const palette = {
  light: {
    text: "#15243A",
    textSecondary: "#65748A",
    textTertiary: "#8794A7",
    background: "#F2F5F9",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#EAF1FA",
    surface: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    surfaceVariant: "#F1F5FA",
    primary: "#2867DB",
    onPrimary: "#FFFFFF",
    primaryContainer: "#E7F0FF",
    secondary: "#158267",
    secondaryContainer: "#E5F5EF",
    success: "#158267",
    successContainer: "#E5F5EF",
    warning: "#A6640A",
    warningContainer: "#FFF2DB",
    error: "#BA3C3C",
    errorContainer: "#FCEAEA",
    border: "#E8EDF4",
    outline: "#D8E0EA",
    scrim: "rgba(15, 27, 45, 0.48)",
    providerIlMeteo: "#2867DB",
    provider3BMeteo: "#158267",
  },
  dark: {
    text: "#F0F5FD",
    textSecondary: "#A7B5C9",
    textTertiary: "#8393AA",
    background: "#0D1420",
    backgroundElement: "#182437",
    backgroundSelected: "#202F44",
    surface: "#182437",
    surfaceRaised: "#202F44",
    surfaceVariant: "#202F44",
    primary: "#82B2FF",
    onPrimary: "#102039",
    primaryContainer: "#1C3558",
    secondary: "#72D4B4",
    secondaryContainer: "#173C37",
    success: "#72D4B4",
    successContainer: "#173C37",
    warning: "#F2C275",
    warningContainer: "#46351F",
    error: "#FFB4AB",
    errorContainer: "#5A2928",
    border: "#28374C",
    outline: "#384A62",
    scrim: "rgba(0, 0, 0, 0.68)",
    providerIlMeteo: "#82B2FF",
    provider3BMeteo: "#72D4B4",
  },
} as const;

export const Colors = palette;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type AppTheme = (typeof Colors)[keyof typeof Colors];

export const Typography = {
  family: Platform.select({
    ios: "system-ui",
    android: "sans-serif",
    web: "Inter, system-ui, sans-serif",
    default: "System",
  }),
  scale: {
    display: { fontSize: 38, lineHeight: 44, fontWeight: "700" as const },
    headline: { fontSize: 30, lineHeight: 36, fontWeight: "700" as const },
    title: { fontSize: 21, lineHeight: 28, fontWeight: "700" as const },
    subtitle: { fontSize: 17, lineHeight: 24, fontWeight: "600" as const },
    body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
    label: { fontSize: 13, lineHeight: 18, fontWeight: "600" as const },
    caption: { fontSize: 12, lineHeight: 17, fontWeight: "400" as const },
    micro: { fontSize: 10, lineHeight: 14, fontWeight: "600" as const },
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const Elevation = {
  none: {
    elevation: 0,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  card: {
    elevation: 2,
    shadowColor: "#1E314D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  raised: {
    elevation: 5,
    shadowColor: "#1E314D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
} as const;

export const ComponentTokens = {
  button: {
    minHeight: 48,
    radius: BorderRadius.md,
    horizontalPadding: Spacing.lg,
  },
  input: {
    minHeight: 48,
    radius: BorderRadius.md,
    horizontalPadding: Spacing.md,
  },
  card: {
    radius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    minHeight: 36,
    radius: BorderRadius.sm,
    horizontalPadding: Spacing.md,
  },
  iconButton: {
    size: 42,
    radius: BorderRadius.md,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

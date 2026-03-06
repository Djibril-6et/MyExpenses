export type ThemeColors = {
  bg: string;
  card: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  accentMedium: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  text: string;
  textSecondary: string;
  textLight: string;
  border: string;
  inputBg: string;
};

export type ThemeName = "blue" | "pink" | "green";

export const themes: Record<ThemeName, ThemeColors> = {
  blue: {
    bg: "#F5F7FA",
    card: "#FFFFFF",
    primary: "#CBDDE9",
    primaryDark: "#A8C5D5",
    primaryLight: "#E8F0F6",
    accent: "#2872A1",
    accentLight: "#E3F0F7",
    accentMedium: "#C7DBE9",
    success: "#4A9D6E",
    successLight: "#E8F5EF",
    warning: "#D4A750",
    warningLight: "#FEF7E8",
    danger: "#C75656",
    dangerLight: "#FDECE8",
    text: "#1A2733",
    textSecondary: "#5A6E82",
    textLight: "#9CA8B5",
    border: "#DCE4EB",
    inputBg: "#F8F9FC",
  },
  pink: {
    bg: "#F5F7FA",
    card: "#FFFFFF",
    primary: "#E8D4E0",
    primaryDark: "#D4B8C8",
    primaryLight: "#F5E8EE",
    accent: "#FFC5D3",
    accentLight: "#FFE8EF",
    accentMedium: "#FFD6E2",
    success: "#4A9D6E",
    successLight: "#E8F5EF",
    warning: "#D4A750",
    warningLight: "#FEF7E8",
    danger: "#330C15",
    dangerLight: "#e18098",
    text: "#000000",
    textSecondary: "#5A6E82",
    textLight: "#9CA8B5",
    border: "#DCE4EB",
    inputBg: "#F8F9FC",
  },
  green: {
    bg: "#F5F9F6",
    card: "#FFFFFF",
    primary: "#B8D9C4",
    primaryDark: "#9BC9AA",
    primaryLight: "#E5F2EA",
    accent: "#4A9D6E",
    accentLight: "#E8F5EF",
    accentMedium: "#D1EBDE",
    success: "#2D7A4E",
    successLight: "#D8EFE0",
    warning: "#D4A750",
    warningLight: "#FEF7E8",
    danger: "#C75656",
    dangerLight: "#FDECE8",
    text: "#1A2E23",
    textSecondary: "#5A7265",
    textLight: "#9CB5A7",
    border: "#D4E5DA",
    inputBg: "#F4F9F6",
  },
};

export const themeNames: { key: ThemeName; label: string }[] = [
  { key: "blue", label: "Bleu" },
  { key: "pink", label: "Rose" },
  { key: "green", label: "Vert" },
];

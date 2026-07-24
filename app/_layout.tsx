import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useState, useContext } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { SettingsModal } from "@/components/SettingsModal";

type SettingsContextType = {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <SettingsContext.Provider value={{ showSettings, setShowSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

function AppNavigator() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { showSettings, setShowSettings } = useSettings();

  const headerBtnStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.accent },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "bold", fontSize: 18 },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t.expenses,
          headerLeftContainerStyle: { alignItems: "center", paddingLeft: 5 },
          headerRightContainerStyle: { alignItems: "center", paddingRight: 5 },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => setShowSettings(true)}
              style={headerBtnStyle}
            >
              <Ionicons name="settings-outline" size={20} color={theme.accent} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/shopping")}
              style={headerBtnStyle}
            >
              <Text style={{ fontSize: 16 }}>🛒</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="shopping"
        options={{
          title: t.shopping,
          headerLeftContainerStyle: { alignItems: "center", paddingLeft: 5 },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={headerBtnStyle}
            >
              <Ionicons name="arrow-back" size={20} color={theme.accent} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}

function SettingsWrapper() {
  const { showSettings, setShowSettings } = useSettings();

  return (
    <>
      <AppNavigator />
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <SettingsProvider>
              <NavigationThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <SettingsWrapper />
              </NavigationThemeProvider>
            </SettingsProvider>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

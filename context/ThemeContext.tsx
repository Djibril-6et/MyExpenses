import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeColors, ThemeName, themes } from "@/constants/themes";

type ThemeContextType = {
  theme: ThemeColors;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("blue");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await SecureStore.getItemAsync("theme");
      if (stored && (stored === "blue" || stored === "pink" || stored === "green")) {
        setThemeName(stored);
      }
    } catch (e) {
      console.error("Error loading theme", e);
    }
  };

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    try {
      await SecureStore.setItemAsync("theme", name);
    } catch (e) {
      console.error("Error saving theme", e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ theme: themes[themeName], themeName, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

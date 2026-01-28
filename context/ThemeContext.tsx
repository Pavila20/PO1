import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: "light" | "dark";
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: any;
}

const Colors = {
  light: {
    background: "#FFF9F0",
    card: "#FFFFFF",
    text: "#2C2C2C",
    subtext: "#8E8E93",
    primary: "#FF5E3A",
    border: "#E5E5EA",
    input: "#F2F2F7",
  },
  dark: {
    background: "#1C1C1E",
    card: "#2C2C2E",
    text: "#FFFFFF",
    subtext: "#AEAEB2",
    primary: "#FF5E3A",
    border: "#3A3A3C",
    input: "#1C1C1E",
  },
};

// FIX: Provide default values here so it doesn't crash if Provider is missing
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  mode: "system",
  setMode: () => {},
  colors: Colors.light, // Default to light colors
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem("themeMode").then((stored) => {
      if (stored) setMode(stored as ThemeMode);
    });
  }, []);

  const updateMode = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem("themeMode", newMode);
  };

  const activeTheme = mode === "system" ? systemScheme || "light" : mode;

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        mode,
        setMode: updateMode,
        colors: Colors[activeTheme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

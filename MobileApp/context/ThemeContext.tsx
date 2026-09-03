// context/ThemeContext.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { Colors, ThemeColors } from "../src/constants/Colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: "light" | "dark";
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
}

// Provide safe defaults to avoid crashes if Provider is missing
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  mode: "system",
  setMode: () => {},
  colors: Colors.light,
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

  // Determine the active theme based on mode setting and system preference
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

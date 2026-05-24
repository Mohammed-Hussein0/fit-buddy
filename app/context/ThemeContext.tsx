import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ThemeMode = "light" | "dark";

type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  secondaryText: string;
  border: string;
  icon: string;
  statusBarStyle: "dark-content" | "light-content";
};

type ThemeContextValue = {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const lightColors: ThemeColors = {
  background: "#f6f6f6",
  surface: "#ffffff",
  text: "#111111",
  secondaryText: "#666666",
  border: "#e5e5e5",
  icon: "#111111",
  statusBarStyle: "dark-content",
};

const darkColors: ThemeColors = {
  background: "#1c1c1e",
  surface: "#2c2c2f",
  text: "#f2f2f7",
  secondaryText: "#a3a3a6",
  border: "#3a3a3f",
  icon: "#f2f2f7",
  statusBarStyle: "light-content",
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemTheme = useColorScheme() === "dark" ? "dark" : "light";
  const [theme, setTheme] = useState<ThemeMode>(systemTheme);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
      colors: theme === "dark" ? darkColors : lightColors,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeContextProvider");
  }
  return context;
}

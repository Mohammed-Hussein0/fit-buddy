import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type MetricSystem = "metric" | "imperial";

type MetricsContextValue = {
  system: MetricSystem;
  setSystem: (system: MetricSystem) => void;
  isMetric: boolean;
};

const MetricsContext = createContext<MetricsContextValue | undefined>(
  undefined,
);
const METRICS_KEY = "METRICS_SYSTEM";

export function MetricsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [system, setSystemState] = useState<MetricSystem>("metric");
  const [hydrated, setHydrated] = useState(false);

  // Load preference from storage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(METRICS_KEY);
        if (saved) {
          setSystemState(saved as MetricSystem);
        }
      } catch (error) {
        console.error("Error loading metrics preference:", error);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setSystem = async (newSystem: MetricSystem) => {
    try {
      setSystemState(newSystem);
      await AsyncStorage.setItem(METRICS_KEY, newSystem);
    } catch (error) {
      console.error("Error saving metrics preference:", error);
    }
  };

  const value = useMemo(
    () => ({
      system,
      setSystem,
      isMetric: system === "metric",
    }),
    [system],
  );

  if (!hydrated) return null;

  return (
    <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error("useMetrics must be used within MetricsContextProvider");
  }
  return context;
}

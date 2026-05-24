import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";

type LoadState = "loading" | "unavailable" | "denied" | "ready" | "error";

type PedometerAPI = typeof import("expo-sensors").Pedometer;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function loadPedometerModule(): Promise<PedometerAPI | null> {
  if (Platform.OS === "web") return null;
  try {
    const { Pedometer } = await import("expo-sensors");
    return Pedometer;
  } catch {
    return null;
  }
}

function isGranted(status: string): boolean {
  return status === "granted";
}

/** Android 10+ needs a runtime prompt for step sensors; it is named "Physical activity", not location. */
async function ensureAndroidActivityRecognition(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  const api = Platform.Version;
  if (typeof api !== "number" || api < 29) return true;

  try {
    const activityPerm = PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION;
    const already = await PermissionsAndroid.check(activityPerm);
    if (already) return true;

    const result = await PermissionsAndroid.request(activityPerm, {
      title: "Physical activity",
      message:
        "To show your steps, Fit Buddy needs the Physical activity permission (your phone’s step sensor). Location is not used.",
      buttonPositive: "Allow",
      buttonNegative: "Not now",
    });
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

interface ProfileStepsSectionProps {
  /** When true, sits inside the profile header (no extra horizontal padding). */
  embedded?: boolean;
}

export default function ProfileStepsSection({
  embedded = false,
}: ProfileStepsSectionProps) {
  const { colors } = useTheme();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [initKey, setInitKey] = useState(0);
  const [steps, setSteps] = useState(0);
  const androidSessionSteps = useRef(0);
  const lastIosFetchMs = useRef(0);
  const pedometerRef = useRef<PedometerAPI | null>(null);

  const fetchTodayIOS = useCallback(async () => {
    const Pedometer = pedometerRef.current;
    if (!Pedometer || Platform.OS !== "ios") return;
    const start = startOfToday();
    const end = new Date();
    const result = await Pedometer.getStepCountAsync(start, end);
    setSteps(result.steps);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const Pedometer = await loadPedometerModule();
      if (cancelled) return;
      if (!Pedometer) {
        setLoadState("unavailable");
        return;
      }
      pedometerRef.current = Pedometer;

      try {
        const avail = await Pedometer.isAvailableAsync();
        if (cancelled) return;
        if (!avail) {
          setLoadState("unavailable");
          return;
        }

        if (Platform.OS === "android") {
          const arOk = await ensureAndroidActivityRecognition();
          if (cancelled) return;
          if (!arOk) {
            setLoadState("denied");
            return;
          }
        }

        const perm = await Pedometer.getPermissionsAsync();
        const req = isGranted(perm.status)
          ? perm
          : await Pedometer.requestPermissionsAsync();
        if (cancelled) return;
        if (!isGranted(req.status)) {
          setLoadState("denied");
          return;
        }
        if (Platform.OS === "ios") {
          await fetchTodayIOS();
        } else {
          androidSessionSteps.current = 0;
          setSteps(0);
        }
        if (!cancelled) setLoadState("ready");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchTodayIOS, initKey]);

  useEffect(() => {
    if (Platform.OS === "web" || loadState !== "ready") return;
    const Pedometer = pedometerRef.current;
    if (!Pedometer) return;

    if (Platform.OS === "ios") {
      const sub = Pedometer.watchStepCount(() => {
        const now = Date.now();
        if (now - lastIosFetchMs.current < 8_000) return;
        lastIosFetchMs.current = now;
        void fetchTodayIOS();
      });
      const interval = setInterval(() => {
        void fetchTodayIOS();
      }, 60_000);
      return () => {
        sub.remove();
        clearInterval(interval);
      };
    }

    const sub = Pedometer.watchStepCount((result) => {
      androidSessionSteps.current += result.steps;
      setSteps(androidSessionSteps.current);
    });
    return () => sub.remove();
  }, [loadState, fetchTodayIOS]);

  useEffect(() => {
    if (Platform.OS !== "ios" || loadState !== "ready") return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void fetchTodayIOS();
    });
    return () => sub.remove();
  }, [loadState, fetchTodayIOS]);

  const openSettings = () => {
    void Linking.openSettings();
  };

  const wrapStyle = embedded ? styles.wrapEmbedded : styles.wrap;

  if (loadState === "loading") {
    return (
      <View style={wrapStyle}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            ACTIVITY
          </Text>
        </View>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <Ionicons name="footsteps" size={22} color={colors.icon} />
            <Text style={[styles.title, { color: colors.text }]}>
              Steps today
            </Text>
          </View>
          <Text style={styles.muted}>Loading…</Text>
        </View>
      </View>
    );
  }

  if (loadState === "unavailable") {
    return (
      <View style={wrapStyle}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            ACTIVITY
          </Text>
        </View>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <Ionicons
              name="footsteps-outline"
              size={22}
              color={colors.secondaryText}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Steps today
            </Text>
          </View>
          <Text style={[styles.muted, { color: colors.secondaryText }]}>
            {Platform.OS === "web"
              ? "Open the app on iPhone or Android to track steps from your phone."
              : "Step counting is not available on this device."}
          </Text>
        </View>
      </View>
    );
  }

  if (loadState === "denied") {
    return (
      <View style={wrapStyle}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            ACTIVITY
          </Text>
        </View>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color={colors.secondaryText}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Steps today
            </Text>
          </View>
          <Text style={styles.muted}>
            Allow Physical activity for this app (Android 10+). On Samsung:
            Settings → Apps → Fit Buddy → Permissions → Physical activity.
            Location is not required for steps.
          </Text>
          {Platform.OS === "android" && Constants.appOwnership === "expo" && (
            <Text style={styles.hint}>
              You are in Expo Go: enable Physical activity for the Expo Go app
              (Settings → Apps → Expo Go → Permissions), not only Fit Buddy.
            </Text>
          )}
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: colors.icon }]}
            onPress={openSettings}
            activeOpacity={0.75}
          >
            <Text
              style={[styles.settingsBtnText, { color: colors.background }]}
            >
              Open settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loadState === "error") {
    return (
      <View style={wrapStyle}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
            ACTIVITY
          </Text>
        </View>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <Ionicons name="alert-circle-outline" size={22} color="#C0392B" />
            <Text style={[styles.title, { color: colors.text }]}>
              Steps today
            </Text>
          </View>
          <Text style={[styles.muted, { color: colors.secondaryText }]}>
            Could not read steps. Try again.
          </Text>
          <TouchableOpacity
            style={[styles.settingsBtn, { backgroundColor: colors.icon }]}
            onPress={() => {
              setLoadState("loading");
              setInitKey((k) => k + 1);
            }}
            activeOpacity={0.75}
          >
            <Text
              style={[styles.settingsBtnText, { color: colors.background }]}
            >
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={wrapStyle}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
          ACTIVITY
        </Text>
      </View>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.rowBetween}>
          <View style={styles.rowTight}>
            <Ionicons name="footsteps" size={22} color={colors.icon} />
            <Text style={[styles.title, { color: colors.text }]}>
              Steps today
            </Text>
          </View>
          {Platform.OS === "ios" ? (
            <Text style={[styles.badge, { color: colors.secondaryText }]}>
              Today
            </Text>
          ) : (
            <Text style={[styles.badge, { color: colors.secondaryText }]}>
              Live
            </Text>
          )}
        </View>
        <Text style={[styles.stepValue, { color: colors.text }]}>
          {steps.toLocaleString()}
        </Text>
        <Text style={[styles.unit, { color: colors.secondaryText }]}>
          steps
        </Text>
        {Platform.OS === "android" && (
          <Text style={[styles.hint, { color: colors.secondaryText }]}>
            Updates while this screen is open (Android).
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  wrapEmbedded: {
    marginTop: 18,
    marginBottom: 4,
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#000",
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e4e4e4",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  rowTight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 0.3,
  },
  badge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#000",
    marginTop: 2,
  },
  unit: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginTop: 2,
  },
  muted: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
    lineHeight: 18,
    marginTop: 4,
  },
  hint: {
    fontSize: 11,
    fontWeight: "500",
    color: "#777",
    lineHeight: 16,
    marginTop: 10,
  },
  settingsBtn: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  settingsBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
});

import React from "react";
import { View, StyleSheet } from "react-native";
import { SettingsItem, SectionHeader } from "../components/settings-item";
import { useTheme } from "@react-navigation/native";
import { Background } from "@react-navigation/elements";
import { useMetrics } from "../context/MetricsContext";
import { formatHeight, formatWeight } from "../utils/metricsConverter";

// Define the FieldType here or import it from a shared types file
type FieldType =
  | "gender"
  | "currentWeight"
  | "goalWeight"
  | "height"
  | "nutrition";

interface GoalsSectionProps {
  gender: "Male" | "Female" | "Other" | "Prefer not to say"; // Added Gender
  height: string;
  currentWeight: string;
  goalWeight: string;
  nutrition: string;
  onEdit: (field: FieldType, value: string) => void;
}

export default function GoalsSection({
  gender,
  height,
  currentWeight,
  goalWeight,
  nutrition,
  onEdit,
}: GoalsSectionProps) {
  const { colors } = useTheme();
  const { isMetric } = useMetrics();
  const heightNum = parseFloat(height) || 0;
  const currentWeightNum = parseFloat(currentWeight) || 0;
  const goalWeightNum = parseFloat(goalWeight) || 0;
  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <SectionHeader title="MY INFO" />
        <SettingsItem
          icon="resize"
          label="Height"
          value={formatHeight(heightNum, isMetric)}
          onPress={() => onEdit("height", height)}
        />
        <SettingsItem
          icon="body"
          label="Current Weight"
          value={formatWeight(currentWeightNum, isMetric)}
          onPress={() => onEdit("currentWeight", currentWeight)}
        />
        <SettingsItem
          icon="person"
          label="Gender"
          value={gender}
          onPress={() => onEdit("gender", gender)}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <SectionHeader title="MY GOALS" />
        <SettingsItem
          icon="flag"
          label="Goal Weight"
          value={formatWeight(goalWeightNum, isMetric)}
          onPress={() => onEdit("goalWeight", goalWeight)}
        />
        <SettingsItem
          icon="restaurant"
          label="Nutrition Goals"
          value={`${nutrition} kcal`}
          onPress={() => onEdit("nutrition", nutrition)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 24, paddingBottom: 8 },
  card: {
    borderRadius: 24,
    marginHorizontal: 14,
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#d1d1d1",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

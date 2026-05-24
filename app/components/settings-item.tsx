import React from "react";
import { View, Text, TouchableOpacity, Switch, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";

export interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  onSwitch?: (value: boolean) => void;
  switchValue?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  value,
  onPress,
  isSwitch,
  onSwitch,
  switchValue,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: "#00000000" }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Ionicons name={icon} size={20} color={colors.icon} />
        </View>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {value && (
          <Text style={[styles.itemValue, { color: colors.text }]}>
            {value}
          </Text>
        )}
        {isSwitch ? (
          <Switch
            value={!!switchValue}
            onValueChange={onSwitch}
            trackColor={{ false: colors.border, true: colors.icon }}
            thumbColor={colors.surface}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.secondaryText}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export const SectionHeader = ({ title }: { title: string }) => {
  const { colors } = useTheme();

  return (
    <Text style={[styles.sectionHeader, { color: colors.secondaryText }]}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    marginTop:8 ,
    marginBottom: 8,
    paddingHorizontal: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
  },
  itemLeft: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 32,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  itemLabel: { fontSize: 15, fontWeight: "600" },
  itemRight: { flexDirection: "row", alignItems: "center" },
  itemValue: { fontSize: 15, fontWeight: "700", marginRight: 8 },
});

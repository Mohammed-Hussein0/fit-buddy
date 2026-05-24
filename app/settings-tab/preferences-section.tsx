import React from "react";
import { View, StyleSheet } from "react-native";
import { SettingsItem, SectionHeader } from "../components/settings-item";
import { useTheme } from "../context/ThemeContext";

export default function AppPreferences() {
  const { theme, setTheme, colors } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <View>
      <SectionHeader title="APP SETTINGS" />
      <View
        style={[
          styles.section,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <SettingsItem
          icon="notifications"
          label="Push Notifications"
          isSwitch={true}
          switchValue={false}
          onSwitch={() => {}}
        />
        <SettingsItem
          icon="moon"
          label="Dark Mode"
          isSwitch={true}
          switchValue={isDarkMode}
          onSwitch={(value) => setTheme(value ? "dark" : "light")}
          value={isDarkMode ? "Dark" : "Light"}
        />
        <SettingsItem
          icon="resize"
          label="Units"
          value="Metric (kg, cm)"
          onPress={() => {}}
        />
        <SettingsItem
          icon="sync"
          label="Apple Health Sync"
          value="Connected"
          onPress={() => {}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
});

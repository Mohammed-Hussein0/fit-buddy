import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../context/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ff0000",
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          height: 75,
          paddingTop: 10,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          // 2. ICONS MADE SMALLER (Size 24)
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="person" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout Plan",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="barbell" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Advice"
        options={{
          title: "Advice",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="camera" color={color} />
          ),
        }}
      />
      {/*  <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="settings" color={color} />
          ),
        }}
      />*/}
    </Tabs>
  );
}

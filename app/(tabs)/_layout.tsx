import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ff0000",
        tabBarInactiveTintColor: "#746c6c",
        // 1. STYLE THE TAB BAR HERE
        tabBarStyle: {
          backgroundColor: '#ffffff', // Dark background (matches your white/red icons)
          borderTopWidth: 0,          // Remove the flat line at the top
          height: 75,
          paddingTop:10,                 // A bit taller to accommodate the curves
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
        name="nutrition"
        options={{
          title: "Nutrition",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="restaurant" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons size={26} name="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
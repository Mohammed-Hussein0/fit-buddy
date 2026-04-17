import React, { useState, useCallback } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
// CRITICAL: GestureHandlerRootView must wrap the component for swipes to work
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Animated, { 
  FadeInRight, 
  Layout, 
} from "react-native-reanimated";

// --- TYPES & DATA ---
interface Habit {
  id: string;
  text: string;
  icon: string;
  completed: boolean;
}

const AVAILABLE_HABITS = [
  { text: "Hit 4 workouts this week", icon: "barbell-outline" },
  { text: "Drink 3L of water", icon: "water-outline" },
  { text: "Sleep 8 hours", icon: "moon-outline" },
  { text: "Track macros", icon: "nutrition-outline" },
  { text: "10k Steps", icon: "walk-outline" },
  { text: "Morning stretching", icon: "body-outline" },
  { text: "No junk food", icon: "fast-food-outline" },
  { text: "Take vitamins", icon: "medkit-outline" },
];

export default function DailyHabits() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", text: "Hit 4 workouts this week", icon: "barbell-outline", completed: true },
    { id: "2", text: "Drink 3L of water", icon: "water-outline", completed: false },
  ]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // --- LOGIC ---
  const toggleHabit = (id: string) => {
    setHabits((current) =>
      current.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const addHabit = (template: { text: string; icon: string }) => {
    if (habits.length >= 4) {
      alert("Limit Reached: Focus on 4 habits max for better consistency.");
      return;
    }
    if (habits.find((h) => h.text === template.text)) return;

    setHabits([...habits, { id: Math.random().toString(), ...template, completed: false }]);
    setIsMenuVisible(false);
  };

  const removeHabit = (id: string) => {
    setHabits((current) => current.filter((h) => h.id !== id));
  };

  // --- RENDER HELPERS ---
  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => removeHabit(id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.habitsContainer}>
        {/* HEADER SECTION */}
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.sectionTitle}>DAILY HABITS</Text>
            <Text style={styles.sectionSubtitle}>{habits.length}/4 active habits</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* HABIT LIST */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {habits.map((habit) => (
            <Animated.View 
              key={habit.id} 
              entering={FadeInRight.duration(400)} 
              layout={Layout.springify()}
            >
              <Swipeable
                renderRightActions={() => renderRightActions(habit.id)}
                friction={2}
                rightThreshold={40}
                containerStyle={styles.swipeContainer}
              >
                <TouchableOpacity
                  style={[styles.habitCard, habit.completed && styles.habitCardDone]}
                  onPress={() => toggleHabit(habit.id)}
                  activeOpacity={1}
                >
                  <View style={[styles.iconBox, habit.completed && styles.iconBoxDone]}>
                    <Ionicons
                      name={habit.icon as any}
                      size={22}
                      color={habit.completed ? "#fff" : "#000"}
                    />
                  </View>
                  <Text
                    style={[styles.habitText, habit.completed && styles.habitTextDone]}
                    numberOfLines={1}
                  >
                    {habit.text}
                  </Text>
                  <Ionicons
                    name={habit.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={habit.completed ? "#000" : "#ddd"}
                  />
                </TouchableOpacity>
              </Swipeable>
            </Animated.View>
          ))}
        </ScrollView>

        {/* SELECTION MODAL */}
        <Modal visible={isMenuVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.menuCard}>
              <Text style={styles.menuTitle}>CHOOSE A HABIT</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {AVAILABLE_HABITS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.menuItem}
                    onPress={() => addHabit(item)}
                  >
                    <View style={styles.menuIconBox}>
                      <Ionicons name={item.icon as any} size={20} color="#000" />
                    </View>
                    <Text style={styles.menuItemText}>{item.text}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsMenuVisible(false)}
              >
                <Text style={styles.closeButtonText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  habitsContainer: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titleContainer: {
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#000",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  swipeContainer: {
    marginBottom: 12,
    overflow: 'visible', // Keeps shadows visible
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 18,
    padding: 16,
    height: 75, // Consistent height for swipe alignment
  },
  habitCardDone: {
    backgroundColor: "#f9f9f9",
    borderColor: "#f9f9f9",
  },
  deleteAction: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 75, // Matches card height
    borderRadius: 18,
    marginLeft: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconBoxDone: {
    backgroundColor: "#000",
  },
  habitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    includeFontPadding: false,
  },
  habitTextDone: {
    color: "#bbb",
    textDecorationLine: "line-through",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  menuCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "80%",
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1,
  },
});
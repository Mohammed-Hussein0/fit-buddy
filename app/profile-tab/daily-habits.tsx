import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
// State for interactive habits
interface Habit {
  id: string;
  text: string;
  icon: string;
  completed: boolean;
}

export default function DailyHabits() {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      text: "Hit 4 workouts this week",
      icon: "barbell-outline",
      completed: true,
    },
    {
      id: "2",
      text: "Drink 3L of water",
      icon: "water-outline",
      completed: false,
    },
    { id: "3", text: "Sleep 8 hours", icon: "moon-outline", completed: false },
    {
      id: "4",
      text: "Track macros",
      icon: "nutrition-outline",
      completed: true,
    },
  ]);

  const toggleHabit = (id: string) => {
    setHabits((current) =>
      current.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h)),
    );
  };
  return (
         <View style={styles.habitsContainer}>
        <Text style={styles.sectionTitle}>DAILY HABITS</Text>
        <Text style={styles.sectionSubtitle}>Consistency is key.</Text>

        {habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            style={[styles.habitCard, habit.completed && styles.habitCardDone]}
            onPress={() => toggleHabit(habit.id)}
            activeOpacity={0.8}
          >
            <View
              style={[styles.iconBox, habit.completed && styles.iconBoxDone]}
            >
              <Ionicons
                name={habit.icon as any}
                size={22}
                color={habit.completed ? "#fff" : "#000"}
              />
            </View>
            <Text
              style={[
                styles.habitText,
                habit.completed && styles.habitTextDone,
              ]}
            >
              {habit.text}
            </Text>
            <Ionicons
              name={habit.completed ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={habit.completed ? "#000" : "#ddd"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
}
const styles = StyleSheet.create({


  // Sections
  sectionContainer: {
    marginTop: 30,
    paddingHorizontal: 5,
  },
  habitsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
    marginTop: -5,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
  },

  // Habits
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  habitCardDone: {
    backgroundColor: "#f9f9f9",
    borderColor: "#f9f9f9",
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
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  habitTextDone: {
    color: "#bbb",
    textDecorationLine: "line-through",
  },


});

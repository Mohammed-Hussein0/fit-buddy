import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// --- TYPES & DATA ---
interface Workout {
  id: string;
  title: string;
  duration: string;
  dayOfWeek: number;
  note: string;
}

const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const NOTE_LIMIT = 35;

export default function WeeklySchedule({
  activeProgram,
  handleBackToPrograms,
}: any) {
  // Starts empty as requested
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const [isAddMode, setIsAddMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const formOpacity = useSharedValue(0);
  const todayNum = new Date().getDay();

  // --- LOGIC ---
  const toggleAddMode = () => {
    if (isAddMode) {
      Keyboard.dismiss();
      formOpacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => setIsAddMode(false), 200);
    } else {
      setIsAddMode(true);
      formOpacity.value = withTiming(1, { duration: 300 });
    }
  };

  const handleAddWorkout = () => {
    if (!newTitle.trim()) return;
    if (workouts.some((w) => w.dayOfWeek === selectedDay)) {
      Alert.alert(
        "Day Occupied",
        "You already have a workout scheduled for this day.",
      );
      return;
    }

    const newWorkout: Workout = {
      id: Math.random().toString(),
      title: newTitle.trim(),
      duration: "45 min",
      dayOfWeek: selectedDay,
      note: newNote.trim() || "General Session",
    };

    setWorkouts((prev) =>
      [...prev, newWorkout].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
    );

    Keyboard.dismiss();
    formOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => {
      setIsAddMode(false);
      setNewTitle("");
      setNewNote("");
    }, 200);
  };

  const confirmDelete = (id: string) => {
    Alert.alert("Delete Workout", "Are you sure you want to remove this day?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setWorkouts((prev) => prev.filter((w) => w.id !== id));
        },
      },
    ]);
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => confirmDelete(id)}
    >
      <Ionicons name="trash-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const animatedFormStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: withTiming(isAddMode ? 0 : -25) }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable style={styles.container} onPress={Keyboard.dismiss}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleBackToPrograms}
          >
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.programName}>WEEKLY SPLIT</Text>
          <TouchableOpacity
            style={[styles.circleBtn, isAddMode && styles.activeBtn]}
            onPress={toggleAddMode}
          >
            <Ionicons
              name={isAddMode ? "close" : "add"}
              size={24}
              color={isAddMode ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>

        {/* INLINE ADD FORM (IDENTICAL STYLING TO YOURS) */}
        {isAddMode && (
          <Animated.View style={[styles.inlineAddCard, animatedFormStyle]}>
            <Text style={styles.label}>WORKOUT NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Back & Biceps"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              maxLength={25}
            />

            <View style={styles.noteHeader}>
              <Text style={styles.label}>SESSION NOTE / FOCUS</Text>
              <Text
                style={[
                  styles.charLimit,
                  newNote.length >= NOTE_LIMIT && { color: "#ff4444" },
                ]}
              >
                {newNote.length}/{NOTE_LIMIT}
              </Text>
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Focus on form, 12 reps"
              value={newNote}
              onChangeText={setNewNote}
              maxLength={NOTE_LIMIT}
              placeholderTextColor="#ccc"
            />

            <Text style={styles.label}>ASSIGN TO DAY</Text>
            <View style={styles.daySelector}>
              {DAYS.map((day, index) => {
                const isOccupied = workouts.some((w) => w.dayOfWeek === index);
                const isSelected = selectedDay === index;
                return (
                  <TouchableOpacity
                    key={day}
                    disabled={isOccupied}
                    style={[
                      styles.dayOption,
                      isSelected && styles.dayOptionSelected,
                      isOccupied && styles.dayOptionDisabled,
                    ]}
                    onPress={() => setSelectedDay(index)}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        isSelected && styles.dayOptionTextSelected,
                        isOccupied && styles.dayOptionTextDisabled,
                      ]}
                    >
                      {day.substring(0, 1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddWorkout}>
              <Text style={styles.saveText}>CONFIRM DAY</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* LIST WITH SWIPE-TO-DELETE */}
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={Platform.OS === "android"}
          renderItem={({ item }) => {
            const isToday = item.dayOfWeek === todayNum;
            return (
              <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                <TouchableOpacity
                  style={[styles.row, isToday && styles.todayRow]}
                  onPress={() =>
                    Alert.alert("Workout", "Opening " + item.title)
                  }
                  activeOpacity={0.7}
                >
                  <View style={[styles.dayBadge, isToday && styles.todayBadge]}>
                    <Text
                      style={[styles.dayText, isToday && styles.todayDayText]}
                    >
                      {DAYS[item.dayOfWeek].substring(0, 3)}
                    </Text>
                  </View>
                  <View style={styles.rowContent}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSubtitle} numberOfLines={1}>
                      {item.note}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isToday ? "#000" : "#EEE"}
                  />
                </TouchableOpacity>
              </Swipeable>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isAddMode ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color="#eee" />
                <Text style={styles.emptyText}>
                  It's pretty empty in here...
                </Text>
                <Text style={styles.emptySub}>
                  Add a workout to start your week.
                </Text>
              </View>
            ) : null
          }
        />
      </Pressable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  programName: { fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
  activeBtn: { backgroundColor: "#000" },

  // Your Specific Form Styling
  inlineAddCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#000",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: "900",
    color: "#bbb",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 5,
  },

  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charLimit: { fontSize: 10, fontWeight: "700", color: "#ccc" },
  noteInput: {
    fontSize: 15,
    fontWeight: "500",
    color: "#666",
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },

  daySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  dayOption: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
  },
  dayOptionSelected: { backgroundColor: "#000" },
  dayOptionDisabled: { opacity: 0.1 },
  dayOptionText: { fontWeight: "800", color: "#999", fontSize: 13 },
  dayOptionTextSelected: { color: "#fff" },
  dayOptionTextDisabled: { textDecorationLine: "line-through" },

  saveBtn: {
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },

  // List Styling
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 24,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f2f2f2",
  },
  todayRow: { borderColor: "#000", borderWidth: 1.5 },
  dayBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  todayBadge: { backgroundColor: "#000" },
  dayText: { fontSize: 11, fontWeight: "900", color: "#aaa" },
  todayDayText: { color: "#fff" },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 17, fontWeight: "800", color: "#111" },
  rowSubtitle: { fontSize: 13, color: "#aaa", marginTop: 3, fontWeight: "500" },

  // Delete & Empty State
  deleteAction: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 24,
    marginBottom: 14,
    marginLeft: 10,
  },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: "800", color: "#ccc", marginTop: 15 },
  emptySub: { fontSize: 14, color: "#ddd", marginTop: 5, fontWeight: "600" },
});

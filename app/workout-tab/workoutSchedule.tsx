import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Keyboard, Platform, Alert } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { TouchableOpacity } from "react-native";
// Import our new components
import { WorkoutRow } from "./workout-schedule/WorkoutRow";
import { AddWorkoutForm } from "./workout-schedule/AddWorkoutForm";

export default function WeeklySchedule({ activeProgram, workouts, onAddWorkout, onDeleteWorkout, handleBackToPrograms, onSelectWorkout }: any) {
  const [isAddMode, setIsAddMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const formOpacity = useSharedValue(0);
  const todayNum = new Date().getDay();

  const toggleAddMode = () => {
    formOpacity.value = withTiming(isAddMode ? 0 : 1, { duration: 300 });
    if (isAddMode) Keyboard.dismiss();
    setTimeout(() => setIsAddMode(!isAddMode), isAddMode ? 200 : 0);
  };

  const handleConfirm = () => {
    onAddWorkout({
      id: Math.random().toString(),
      title: newTitle.trim(),
      duration: "45 min",
      dayOfWeek: selectedDay,
      note: newNote.trim() || "General Session",
    });
    toggleAddMode();
    setNewTitle("");
    setNewNote("");
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: withTiming(isAddMode ? 0 : -25) }],
  }));

  const sortedWorkouts = [...workouts].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable style={styles.container} onPress={Keyboard.dismiss}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleBtn} onPress={handleBackToPrograms}>
            <Ionicons name="chevron-back" size={20} color="#000" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.programName}>WEEKLY SPLIT</Text>
            <Text style={styles.activeRoutineSub}>{activeProgram.title.toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={[styles.circleBtn, isAddMode && styles.activeBtn]} onPress={toggleAddMode}>
            <Ionicons name={isAddMode ? "close" : "add"} size={24} color={isAddMode ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>

        {isAddMode && (
          <AddWorkoutForm 
            animatedStyle={animatedStyle} title={newTitle} setTitle={setNewTitle}
            note={newNote} setNote={setNewNote} selectedDay={selectedDay}
            setSelectedDay={setSelectedDay} onConfirm={handleConfirm} workouts={workouts}
          />
        )}

        <FlatList
          data={sortedWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkoutRow
              item={item}
              isToday={item.dayOfWeek === todayNum}
              onDelete={() => onDeleteWorkout(item.id)}
              onSelectWorkout={onSelectWorkout}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={isAddMode ? null : <Text style={styles.emptyText}>Pretty empty in here...</Text>}
        />
      </Pressable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: Platform.OS === "ios" ? 60 : 40 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 20 },
  titleContainer: { alignItems: "center" },
  programName: { fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  activeRoutineSub: { fontSize: 9, fontWeight: "700", color: "#888", marginTop: 2 },
  circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f9f9f9", justifyContent: "center", alignItems: "center" },
  activeBtn: { backgroundColor: "#000" },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  emptyText: { textAlign: "center", marginTop: 100, color: "#ccc", fontWeight: "700", fontSize: 18 }
});
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

export const AddWorkoutForm = ({ 
  animatedStyle, title, setTitle, note, setNote, selectedDay, setSelectedDay, onConfirm, workouts 
}: any) => {
  const DAYS_INIT = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Animated.View style={[styles.inlineAddCard, animatedStyle]}>
      <Text style={styles.label}>WORKOUT NAME</Text>
      <TextInput style={styles.input} placeholder="e.g. Back & Biceps" value={title} onChangeText={setTitle} autoFocus maxLength={25} />

      <View style={styles.noteHeader}>
        <Text style={styles.label}>SESSION NOTE</Text>
        <Text style={[styles.charLimit, note.length >= 35 && { color: "#ff4444" }]}>{note.length}/35</Text>
      </View>
      <TextInput style={styles.noteInput} placeholder="e.g. Focus on form" value={note} onChangeText={setNote} maxLength={35} placeholderTextColor="#ccc" />

      <Text style={styles.label}>ASSIGN TO DAY</Text>
      <View style={styles.daySelector}>
        {DAYS_INIT.map((day, index) => {
          const isOccupied = workouts.some((w: any) => w.dayOfWeek === index);
          return (
            <TouchableOpacity 
              key={index} 
              disabled={isOccupied} 
              style={[styles.dayOption, selectedDay === index && styles.dayOptionSelected, isOccupied && styles.dayOptionDisabled]} 
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[styles.dayOptionText, selectedDay === index && styles.dayOptionTextSelected, isOccupied && styles.dayOptionTextDisabled]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={onConfirm}>
        <Text style={styles.saveText}>CONFIRM DAY</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inlineAddCard: { backgroundColor: "#fff", marginHorizontal: 20, padding: 24, borderRadius: 30, borderWidth: 1.5, borderColor: "#000", marginBottom: 25, elevation: 5 },
  label: { fontSize: 10, fontWeight: "900", color: "#bbb", letterSpacing: 1.5, marginBottom: 8 },
  input: { fontSize: 22, fontWeight: "800", color: "#000", marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", paddingBottom: 5 },
  noteHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  charLimit: { fontSize: 10, fontWeight: "700", color: "#ccc" },
  noteInput: { fontSize: 15, fontWeight: "500", color: "#666", backgroundColor: "#f8f8f8", padding: 12, borderRadius: 12, marginBottom: 20 },
  daySelector: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  dayOption: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#f4f4f4", justifyContent: "center", alignItems: "center" },
  dayOptionSelected: { backgroundColor: "#000" },
  dayOptionDisabled: { opacity: 0.1 },
  dayOptionText: { fontWeight: "800", color: "#999", fontSize: 13 },
  dayOptionTextSelected: { color: "#fff" },
  dayOptionTextDisabled: { textDecorationLine: "line-through" },
  saveBtn: { backgroundColor: "#000", padding: 18, borderRadius: 18, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "900", fontSize: 13 },
});
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Platform, Keyboard, Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ExerciseSet {
  id: string;
  reps: string;
  weight: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: ExerciseSet[];
}

interface Props {
  workoutTitle: string;
  exercises: WorkoutExercise[];
  onBack: () => void;
  onAddExercise: (ex: Omit<WorkoutExercise, 'sets'>) => void;
  onAddSet: (exerciseId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
}

// ─── Exercise Library ─────────────────────────────────────────────────────────
const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Calves'];

const EXERCISE_LIBRARY: { name: string; muscleGroup: string }[] = [
  // Chest
  { name: 'Bench Press', muscleGroup: 'Chest' },
  { name: 'Incline Bench Press', muscleGroup: 'Chest' },
  { name: 'Decline Bench Press', muscleGroup: 'Chest' },
  { name: 'Dumbbell Fly', muscleGroup: 'Chest' },
  { name: 'Cable Crossover', muscleGroup: 'Chest' },
  { name: 'Push-Up', muscleGroup: 'Chest' },
  { name: 'Chest Dip', muscleGroup: 'Chest' },
  // Back
  { name: 'Deadlift', muscleGroup: 'Back' },
  { name: 'Pull-Up', muscleGroup: 'Back' },
  { name: 'Barbell Row', muscleGroup: 'Back' },
  { name: 'Seated Cable Row', muscleGroup: 'Back' },
  { name: 'Lat Pulldown', muscleGroup: 'Back' },
  { name: 'T-Bar Row', muscleGroup: 'Back' },
  { name: 'Face Pull', muscleGroup: 'Back' },
  { name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back' },
  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders' },
  { name: 'Front Raise', muscleGroup: 'Shoulders' },
  { name: 'Rear Delt Fly', muscleGroup: 'Shoulders' },
  { name: 'Arnold Press', muscleGroup: 'Shoulders' },
  { name: 'Cable Lateral Raise', muscleGroup: 'Shoulders' },
  // Biceps
  { name: 'Barbell Curl', muscleGroup: 'Biceps' },
  { name: 'Dumbbell Curl', muscleGroup: 'Biceps' },
  { name: 'Hammer Curl', muscleGroup: 'Biceps' },
  { name: 'Preacher Curl', muscleGroup: 'Biceps' },
  { name: 'Cable Curl', muscleGroup: 'Biceps' },
  { name: 'Concentration Curl', muscleGroup: 'Biceps' },
  // Triceps
  { name: 'Tricep Pushdown', muscleGroup: 'Triceps' },
  { name: 'Skull Crusher', muscleGroup: 'Triceps' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Triceps' },
  { name: 'Close-Grip Bench Press', muscleGroup: 'Triceps' },
  { name: 'Tricep Dip', muscleGroup: 'Triceps' },
  { name: 'Diamond Push-Up', muscleGroup: 'Triceps' },
  // Legs
  { name: 'Squat', muscleGroup: 'Legs' },
  { name: 'Leg Press', muscleGroup: 'Legs' },
  { name: 'Hack Squat', muscleGroup: 'Legs' },
  { name: 'Leg Extension', muscleGroup: 'Legs' },
  { name: 'Leg Curl', muscleGroup: 'Legs' },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs' },
  { name: 'Lunges', muscleGroup: 'Legs' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'Legs' },
  // Core
  { name: 'Plank', muscleGroup: 'Core' },
  { name: 'Crunch', muscleGroup: 'Core' },
  { name: 'Cable Crunch', muscleGroup: 'Core' },
  { name: 'Hanging Leg Raise', muscleGroup: 'Core' },
  { name: 'Russian Twist', muscleGroup: 'Core' },
  { name: 'Ab Rollout', muscleGroup: 'Core' },
  { name: 'Side Plank', muscleGroup: 'Core' },
  // Glutes
  { name: 'Hip Thrust', muscleGroup: 'Glutes' },
  { name: 'Cable Kickback', muscleGroup: 'Glutes' },
  { name: 'Glute Bridge', muscleGroup: 'Glutes' },
  { name: 'Sumo Deadlift', muscleGroup: 'Glutes' },
  { name: 'Step-Up', muscleGroup: 'Glutes' },
  // Calves
  { name: 'Standing Calf Raise', muscleGroup: 'Calves' },
  { name: 'Seated Calf Raise', muscleGroup: 'Calves' },
  { name: 'Donkey Calf Raise', muscleGroup: 'Calves' },
];

const MUSCLE_COLORS: Record<string, { bg: string; text: string }> = {
  Chest:     { bg: '#FFE8E8', text: '#C0392B' },
  Back:      { bg: '#E8F4FF', text: '#2980B9' },
  Shoulders: { bg: '#FFF3E0', text: '#E67E22' },
  Biceps:    { bg: '#E8FFE8', text: '#27AE60' },
  Triceps:   { bg: '#F0E8FF', text: '#8E44AD' },
  Legs:      { bg: '#E8FFFF', text: '#16A085' },
  Core:      { bg: '#FFFDE8', text: '#F39C12' },
  Glutes:    { bg: '#FFE8F8', text: '#D63BD6' },
  Calves:    { bg: '#E8FFEF', text: '#1ABC9C' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function MuscleBadge({ group }: { group: string }) {
  const colors = MUSCLE_COLORS[group] || { bg: '#F0F0F0', text: '#888' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{group}</Text>
    </View>
  );
}

function SetRow({ set, onUpdate, onDelete }: {
  set: ExerciseSet;
  onUpdate: (field: 'reps' | 'weight', value: string) => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.setRow}>
      <View style={styles.setField}>
        <Text style={styles.setLabel}>KG</Text>
        <TextInput
          style={styles.setInput}
          value={set.weight}
          onChangeText={v => onUpdate('weight', v)}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#CCC"
          maxLength={5}
        />
      </View>
      <View style={styles.setDivider} />
      <View style={styles.setField}>
        <Text style={styles.setLabel}>REPS</Text>
        <TextInput
          style={styles.setInput}
          value={set.reps}
          onChangeText={v => onUpdate('reps', v)}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="#CCC"
          maxLength={3}
        />
      </View>
      <TouchableOpacity style={styles.setDeleteBtn} onPress={onDelete}>
        <Ionicons name="remove-circle" size={20} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );
}

function ExerciseCard({ exercise, onAddSet, onUpdateSet, onDeleteSet, onDelete }: {
  exercise: WorkoutExercise;
  onAddSet: () => void;
  onUpdateSet: (setId: string, field: 'reps' | 'weight', value: string) => void;
  onDeleteSet: (setId: string) => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <MuscleBadge group={exercise.muscleGroup} />
        </View>
        <TouchableOpacity style={styles.deleteExBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color="#FF4444" />
        </TouchableOpacity>
      </View>

      {exercise.sets.length > 0 && (
        <View style={styles.setsContainer}>
          <View style={styles.setsHeader}>
            <Text style={[styles.setsHeaderLabel, { flex: 1 }]}>WEIGHT (KG)</Text>
            <View style={{ width: 1 }} />
            <Text style={[styles.setsHeaderLabel, { flex: 1, textAlign: 'center' }]}>REPS</Text>
            <View style={{ width: 32 }} />
          </View>
          {exercise.sets.map((set, idx) => (
            <View key={set.id}>
              <View style={styles.setNumberRow}>
                <Text style={styles.setNumber}>Set {idx + 1}</Text>
              </View>
              <SetRow
                set={set}
                onUpdate={(field, value) => onUpdateSet(set.id, field, value)}
                onDelete={() => onDeleteSet(set.id)}
              />
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
        <Ionicons name="add" size={16} color="#000" />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Exercise Library Picker ──────────────────────────────────────────────────
function ExercisePicker({ onAdd, onClose, alreadyAdded }: {
  onAdd: (ex: Omit<WorkoutExercise, 'sets'>) => void;
  onClose: () => void;
  alreadyAdded: string[];
}) {
  const [activeGroup, setActiveGroup] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = EXERCISE_LIBRARY.filter(ex => {
    const matchGroup = activeGroup === 'All' || ex.muscleGroup === activeGroup;
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <Pressable style={styles.pickerOverlay} onPress={onClose}>
      <Pressable style={styles.pickerSheet} onPress={e => e.stopPropagation()}>
        <View style={styles.pickerHandle} />
        <View style={styles.pickerHeaderRow}>
          <Text style={styles.pickerTitle}>Exercise Library</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#AAA" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#AAA"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#AAA" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {MUSCLE_GROUPS.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.filterChip, activeGroup === g && styles.filterChipActive]}
              onPress={() => setActiveGroup(g)}
            >
              <Text style={[styles.filterChipText, activeGroup === g && styles.filterChipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={item => item.name}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => {
            const isAdded = alreadyAdded.includes(item.name);
            return (
              <TouchableOpacity
                style={[styles.libraryRow, isAdded && styles.libraryRowAdded]}
                onPress={() => {
                  if (!isAdded) {
                    onAdd({ id: `ex-${Date.now()}-${Math.random()}`, name: item.name, muscleGroup: item.muscleGroup });
                  }
                }}
                disabled={isAdded}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.libraryName, isAdded && { color: '#BBB' }]}>{item.name}</Text>
                  <MuscleBadge group={item.muscleGroup} />
                </View>
                <Ionicons
                  name={isAdded ? 'checkmark-circle' : 'add-circle-outline'}
                  size={24}
                  color={isAdded ? '#00B894' : '#000'}
                />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyLibrary}>No exercises found</Text>
          }
        />
      </Pressable>
    </Pressable>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExerciseDetail({
  workoutTitle, exercises, onBack, onAddExercise, onAddSet,
  onUpdateSet, onDeleteSet, onDeleteExercise,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const alreadyAdded = exercises.map(e => e.name);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.circleBtn} onPress={onBack}>
              <Ionicons name="chevron-back" size={20} color="#000" />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.screenLabel}>WORKOUT</Text>
              <Text style={styles.workoutTitle} numberOfLines={1}>{workoutTitle.toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.addExBtn} onPress={() => { Keyboard.dismiss(); setShowPicker(true); }}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Exercise List */}
          <FlatList
            data={exercises}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ExerciseCard
                exercise={item}
                onAddSet={() => onAddSet(item.id)}
                onUpdateSet={(setId, field, value) => onUpdateSet(item.id, setId, field, value)}
                onDeleteSet={(setId) => onDeleteSet(item.id, setId)}
                onDelete={() => onDeleteExercise(item.id)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="barbell-outline" size={48} color="#DDD" />
                <Text style={styles.emptyTitle}>No exercises yet</Text>
                <Text style={styles.emptySubtitle}>Tap + to browse the exercise library</Text>
              </View>
            }
          />
        </View>
      </Pressable>

      {showPicker && (
        <ExercisePicker
          onAdd={(ex) => { onAddExercise(ex); }}
          onClose={() => setShowPicker(false)}
          alreadyAdded={alreadyAdded}
        />
      )}
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleContainer: { alignItems: 'center', flex: 1, marginHorizontal: 12 },
  screenLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, color: '#AAA' },
  workoutTitle: { fontSize: 15, fontWeight: '900', color: '#000', letterSpacing: 1, maxWidth: 180 },
  circleBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  addExBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#000', justifyContent: 'center', alignItems: 'center',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 60 },

  // Exercise Card
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  exerciseHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  exerciseName: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 6 },
  deleteExBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center',
  },

  // Badge
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Sets
  setsContainer: { marginBottom: 10 },
  setsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 2 },
  setsHeaderLabel: { fontSize: 9, fontWeight: '900', color: '#CCC', letterSpacing: 1 },
  setNumberRow: { marginBottom: 2 },
  setNumber: { fontSize: 10, fontWeight: '700', color: '#BBB', letterSpacing: 1 },
  setRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F8F8', borderRadius: 12,
    marginBottom: 8, overflow: 'hidden',
  },
  setField: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  setLabel: { fontSize: 9, fontWeight: '900', color: '#BBB', letterSpacing: 1, marginBottom: 2 },
  setInput: {
    fontSize: 22, fontWeight: '800', color: '#000',
    textAlign: 'center', minWidth: 60,
  },
  setDivider: { width: 1, height: 40, backgroundColor: '#EEE' },
  setDeleteBtn: { paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },

  // Add set button
  addSetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#EEE', borderStyle: 'dashed',
    gap: 6,
  },
  addSetText: { fontSize: 13, fontWeight: '700', color: '#000' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#CCC' },
  emptySubtitle: { fontSize: 14, color: '#CCC', fontWeight: '500' },

  // Picker / Sheet
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    height: '82%',
  },
  pickerHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 16,
  },
  pickerHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  pickerTitle: { fontSize: 22, fontWeight: '900', color: '#000' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F4F4F4', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    marginHorizontal: 16, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#000', fontWeight: '500' },
  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F4F4F4', borderWidth: 1.5, borderColor: '#F4F4F4',
  },
  filterChipActive: { backgroundColor: '#000', borderColor: '#000' },
  filterChipText: { fontSize: 13, fontWeight: '700', color: '#666' },
  filterChipTextActive: { color: '#fff' },
  libraryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F4F4F4',
  },
  libraryRowAdded: { opacity: 0.5 },
  libraryName: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
  emptyLibrary: { textAlign: 'center', marginTop: 40, color: '#CCC', fontWeight: '700', fontSize: 16 },
});

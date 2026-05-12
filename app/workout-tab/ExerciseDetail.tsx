import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Platform, Keyboard, Pressable, Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ExerciseSet {
  id: string;
  reps: string;
  weight: string;
  rpe: number; // 0 = not set, 1-10
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  imageUrl: string;
  sets: ExerciseSet[];
}

interface Props {
  workoutTitle: string;
  exercises: WorkoutExercise[];
  onBack: () => void;
  onAddExercise: (ex: Omit<WorkoutExercise, 'sets'>) => void;
  onAddSet: (exerciseId: string) => void;
  onUpdateSet: (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => void;
  onUpdateSetRpe: (exerciseId: string, setId: string, rpe: number) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
}

// ─── Exercise Library ─────────────────────────────────────────────────────────
const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Glutes', 'Calves'];

const EXERCISE_IMAGES: Record<string, string> = {
  'Bench Press':               'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'Incline Bench Press':       'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  'Decline Bench Press':       'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'Dumbbell Fly':              'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
  'Cable Crossover':           'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  'Push-Up':                   'https://images.unsplash.com/photo-1598971639058-fab3c3109a56?w=400',
  'Chest Dip':                 'https://images.unsplash.com/photo-1598971639058-fab3c3109a56?w=400',
  'Deadlift':                  'https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=400',
  'Pull-Up':                   'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=400',
  'Barbell Row':               'https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=400',
  'Seated Cable Row':          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  'Lat Pulldown':              'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  'T-Bar Row':                 'https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=400',
  'Face Pull':                 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  'Single-Arm Dumbbell Row':   'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  'Overhead Press':            'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
  'Dumbbell Lateral Raise':    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  'Front Raise':               'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
  'Rear Delt Fly':             'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  'Arnold Press':              'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
  'Cable Lateral Raise':       'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  'Barbell Curl':              'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  'Dumbbell Curl':             'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  'Hammer Curl':               'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  'Preacher Curl':             'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  'Cable Curl':                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  'Concentration Curl':        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
  'Tricep Pushdown':           'https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400',
  'Skull Crusher':             'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'Overhead Tricep Extension': 'https://images.unsplash.com/photo-1530822847156-5df684ec5105?w=400',
  'Close-Grip Bench Press':    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'Tricep Dip':                'https://images.unsplash.com/photo-1598971639058-fab3c3109a56?w=400',
  'Diamond Push-Up':           'https://images.unsplash.com/photo-1598971639058-fab3c3109a56?w=400',
  'Squat':                     'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
  'Leg Press':                 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
  'Hack Squat':                'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
  'Leg Extension':             'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
  'Leg Curl':                  'https://images.unsplash.com/photo-1552106661-c20ddbcc2b8f?w=400',
  'Romanian Deadlift':         'https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=400',
  'Lunges':                    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
  'Bulgarian Split Squat':     'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
  'Plank':                     'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  'Crunch':                    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  'Cable Crunch':              'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  'Hanging Leg Raise':         'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=400',
  'Russian Twist':             'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  'Ab Rollout':                'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  'Side Plank':                'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  'Hip Thrust':                'https://images.unsplash.com/photo-1552106661-c20ddbcc2b8f?w=400',
  'Cable Kickback':            'https://images.unsplash.com/photo-1552106661-c20ddbcc2b8f?w=400',
  'Glute Bridge':              'https://images.unsplash.com/photo-1552106661-c20ddbcc2b8f?w=400',
  'Sumo Deadlift':             'https://images.unsplash.com/photo-1533681904393-9ab6eee7e408?w=400',
  'Step-Up':                   'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
  'Standing Calf Raise':       'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
  'Seated Calf Raise':         'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
  'Donkey Calf Raise':         'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
};

const EXERCISE_LIBRARY: { name: string; muscleGroup: string }[] = [
  { name: 'Bench Press', muscleGroup: 'Chest' },
  { name: 'Incline Bench Press', muscleGroup: 'Chest' },
  { name: 'Decline Bench Press', muscleGroup: 'Chest' },
  { name: 'Dumbbell Fly', muscleGroup: 'Chest' },
  { name: 'Cable Crossover', muscleGroup: 'Chest' },
  { name: 'Push-Up', muscleGroup: 'Chest' },
  { name: 'Chest Dip', muscleGroup: 'Chest' },
  { name: 'Deadlift', muscleGroup: 'Back' },
  { name: 'Pull-Up', muscleGroup: 'Back' },
  { name: 'Barbell Row', muscleGroup: 'Back' },
  { name: 'Seated Cable Row', muscleGroup: 'Back' },
  { name: 'Lat Pulldown', muscleGroup: 'Back' },
  { name: 'T-Bar Row', muscleGroup: 'Back' },
  { name: 'Face Pull', muscleGroup: 'Back' },
  { name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back' },
  { name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders' },
  { name: 'Front Raise', muscleGroup: 'Shoulders' },
  { name: 'Rear Delt Fly', muscleGroup: 'Shoulders' },
  { name: 'Arnold Press', muscleGroup: 'Shoulders' },
  { name: 'Cable Lateral Raise', muscleGroup: 'Shoulders' },
  { name: 'Barbell Curl', muscleGroup: 'Biceps' },
  { name: 'Dumbbell Curl', muscleGroup: 'Biceps' },
  { name: 'Hammer Curl', muscleGroup: 'Biceps' },
  { name: 'Preacher Curl', muscleGroup: 'Biceps' },
  { name: 'Cable Curl', muscleGroup: 'Biceps' },
  { name: 'Concentration Curl', muscleGroup: 'Biceps' },
  { name: 'Tricep Pushdown', muscleGroup: 'Triceps' },
  { name: 'Skull Crusher', muscleGroup: 'Triceps' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'Triceps' },
  { name: 'Close-Grip Bench Press', muscleGroup: 'Triceps' },
  { name: 'Tricep Dip', muscleGroup: 'Triceps' },
  { name: 'Diamond Push-Up', muscleGroup: 'Triceps' },
  { name: 'Squat', muscleGroup: 'Legs' },
  { name: 'Leg Press', muscleGroup: 'Legs' },
  { name: 'Hack Squat', muscleGroup: 'Legs' },
  { name: 'Leg Extension', muscleGroup: 'Legs' },
  { name: 'Leg Curl', muscleGroup: 'Legs' },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs' },
  { name: 'Lunges', muscleGroup: 'Legs' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'Legs' },
  { name: 'Plank', muscleGroup: 'Core' },
  { name: 'Crunch', muscleGroup: 'Core' },
  { name: 'Cable Crunch', muscleGroup: 'Core' },
  { name: 'Hanging Leg Raise', muscleGroup: 'Core' },
  { name: 'Russian Twist', muscleGroup: 'Core' },
  { name: 'Ab Rollout', muscleGroup: 'Core' },
  { name: 'Side Plank', muscleGroup: 'Core' },
  { name: 'Hip Thrust', muscleGroup: 'Glutes' },
  { name: 'Cable Kickback', muscleGroup: 'Glutes' },
  { name: 'Glute Bridge', muscleGroup: 'Glutes' },
  { name: 'Sumo Deadlift', muscleGroup: 'Glutes' },
  { name: 'Step-Up', muscleGroup: 'Glutes' },
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

const MUSCLE_GROUP_ICONS: Record<string, string> = {
  All: 'apps', Chest: 'body', Back: 'trending-up', Shoulders: 'arrow-up',
  Biceps: 'fitness', Triceps: 'barbell', Legs: 'walk',
  Core: 'ellipse', Glutes: 'chevron-down', Calves: 'footsteps',
};

// RPE color by value
function rpeColor(rpe: number): { bg: string; text: string } {
  if (rpe <= 3) return { bg: '#00B894', text: '#fff' };
  if (rpe <= 6) return { bg: '#FDCB6E', text: '#6D4C00' };
  if (rpe <= 8) return { bg: '#E17055', text: '#fff' };
  return { bg: '#D63031', text: '#fff' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MuscleBadge({ group }: { group: string }) {
  const colors = MUSCLE_COLORS[group] || { bg: '#F0F0F0', text: '#888' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{group}</Text>
    </View>
  );
}

function RpeSelector({ value, onChange }: { value: number; onChange: (rpe: number) => void }) {
  return (
    <View style={styles.rpeRow}>
      <Text style={styles.rpeLabel}>RPE</Text>
      <View style={styles.rpeDots}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
          const isSelected = value === n;
          const color = rpeColor(n);
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onChange(value === n ? 0 : n)}
              style={[
                styles.rpeDot,
                isSelected
                  ? { backgroundColor: color.bg, borderColor: color.bg }
                  : { backgroundColor: '#F4F4F4', borderColor: '#E8E8E8' },
              ]}
            >
              <Text style={[styles.rpeDotText, isSelected ? { color: color.text, fontWeight: '800' } : {}]}>
                {n}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function SetRow({ set, index, onUpdate, onUpdateRpe, onDelete }: {
  set: ExerciseSet;
  index: number;
  onUpdate: (field: 'reps' | 'weight', value: string) => void;
  onUpdateRpe: (rpe: number) => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.setCard}>
      <View style={styles.setCardHeader}>
        <Text style={styles.setNumber}>Set {index + 1}</Text>
        <TouchableOpacity onPress={onDelete} style={styles.setDeleteBtn}>
          <Ionicons name="trash-outline" size={14} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.setInputRow}>
        <View style={styles.setField}>
          <Text style={styles.setLabel}>KG</Text>
          <TextInput
            style={styles.setInput}
            value={set.weight}
            onChangeText={v => onUpdate('weight', v)}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor="#CCC"
            maxLength={5}
            textAlign="center"
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
            placeholder="—"
            placeholderTextColor="#CCC"
            maxLength={3}
            textAlign="center"
          />
        </View>
      </View>

      <RpeSelector value={set.rpe} onChange={onUpdateRpe} />
    </View>
  );
}

function ExerciseCard({ exercise, onAddSet, onUpdateSet, onUpdateSetRpe, onDeleteSet, onDelete }: {
  exercise: WorkoutExercise;
  onAddSet: () => void;
  onUpdateSet: (setId: string, field: 'reps' | 'weight', value: string) => void;
  onUpdateSetRpe: (setId: string, rpe: number) => void;
  onDeleteSet: (setId: string) => void;
  onDelete: () => void;
}) {
  const colors = MUSCLE_COLORS[exercise.muscleGroup];
  return (
    <View style={styles.exerciseCard}>
      {/* Image Banner */}
      <View style={styles.exerciseImageWrap}>
        <Image
          source={{ uri: exercise.imageUrl }}
          style={styles.exerciseImage}
          resizeMode="cover"
        />
        <View style={styles.exerciseImageOverlay} />
        <View style={styles.exerciseImageBadge}>
          <MuscleBadge group={exercise.muscleGroup} />
        </View>
        <TouchableOpacity style={styles.deleteExBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={15} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.exerciseBody}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>

        {exercise.sets.map((set, idx) => (
          <SetRow
            key={set.id}
            set={set}
            index={idx}
            onUpdate={(field, value) => onUpdateSet(set.id, field, value)}
            onUpdateRpe={(rpe) => onUpdateSetRpe(set.id, rpe)}
            onDelete={() => onDeleteSet(set.id)}
          />
        ))}

        <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
          <Ionicons name="add" size={15} color="#000" />
          <Text style={styles.addSetText}>Add Set</Text>
        </TouchableOpacity>
      </View>
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
    <View style={styles.pickerFullScreen}>
      <View style={styles.pickerTopBar}>
        <TouchableOpacity style={styles.pickerBackBtn} onPress={onClose}>
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.pickerScreenLabel}>BROWSE</Text>
          <Text style={styles.pickerTitle}>Exercise Library</Text>
        </View>
        <View style={styles.pickerCountBadge}>
          <Text style={styles.pickerCountText}>{filtered.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#AAA" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#AAA"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#CCC" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterGrid}>
        {MUSCLE_GROUPS.map(g => {
          const isActive = activeGroup === g;
          const colors = g !== 'All' ? MUSCLE_COLORS[g] : null;
          return (
            <TouchableOpacity
              key={g}
              style={[
                styles.filterTile,
                isActive && colors
                  ? { backgroundColor: colors.bg, borderColor: colors.text, borderWidth: 2 }
                  : isActive
                  ? { backgroundColor: '#111', borderColor: '#111', borderWidth: 2 }
                  : {},
              ]}
              onPress={() => setActiveGroup(g)}
            >
              <Ionicons
                name={MUSCLE_GROUP_ICONS[g] as any}
                size={14}
                color={isActive ? (colors ? colors.text : '#fff') : '#999'}
              />
              <Text
                style={[
                  styles.filterTileText,
                  isActive && colors ? { color: colors.text, fontWeight: '800' } : {},
                  isActive && !colors ? { color: '#fff', fontWeight: '800' } : {},
                ]}
                numberOfLines={1}
              >
                {g}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.pickerDivider} />

      <FlatList
        data={filtered}
        keyExtractor={item => item.name}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item }) => {
          const isAdded = alreadyAdded.includes(item.name);
          const rowColors = MUSCLE_COLORS[item.muscleGroup];
          const imgUrl = EXERCISE_IMAGES[item.name] ?? '';
          return (
            <TouchableOpacity
              style={[styles.libraryRow, isAdded && styles.libraryRowAdded]}
              onPress={() => {
                if (!isAdded) {
                  onAdd({
                    id: `ex-${Date.now()}-${Math.random()}`,
                    name: item.name,
                    muscleGroup: item.muscleGroup,
                    imageUrl: EXERCISE_IMAGES[item.name] ?? '',
                  });
                }
              }}
              disabled={isAdded}
              activeOpacity={0.7}
            >
              {imgUrl ? (
                <Image source={{ uri: imgUrl }} style={styles.libraryThumb} />
              ) : (
                <View style={[styles.libraryGroupDot, { backgroundColor: rowColors?.bg ?? '#F0F0F0' }]}>
                  <Ionicons name={MUSCLE_GROUP_ICONS[item.muscleGroup] as any} size={16} color={rowColors?.text ?? '#888'} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.libraryName, isAdded && { color: '#BBB' }]}>{item.name}</Text>
                <Text style={[styles.libraryGroup, rowColors && { color: rowColors.text }, isAdded && { color: '#DDD' }]}>
                  {item.muscleGroup}
                </Text>
              </View>
              <View style={[styles.addIconWrap, isAdded && { backgroundColor: '#E8FFF4' }]}>
                <Ionicons name={isAdded ? 'checkmark' : 'add'} size={18} color={isAdded ? '#00B894' : '#000'} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Ionicons name="search-outline" size={40} color="#DDD" />
            <Text style={styles.emptyLibrary}>No exercises found</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExerciseDetail({
  workoutTitle, exercises, onBack, onAddExercise, onAddSet,
  onUpdateSet, onUpdateSetRpe, onDeleteSet, onDeleteExercise,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const alreadyAdded = exercises.map(e => e.name);

  if (showPicker) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ExercisePicker
          onAdd={ex => { onAddExercise(ex); }}
          onClose={() => setShowPicker(false)}
          alreadyAdded={alreadyAdded}
        />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={styles.container}>
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
                onUpdateSetRpe={(setId, rpe) => onUpdateSetRpe(item.id, setId, rpe)}
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
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, marginBottom: 20,
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
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },

  // Badge
  badge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  // Exercise Card
  exerciseCard: {
    backgroundColor: '#fff', borderRadius: 20,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  exerciseImageWrap: { height: 130, position: 'relative' },
  exerciseImage: { width: '100%', height: '100%' },
  exerciseImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  exerciseImageBadge: { position: 'absolute', bottom: 10, left: 14 },
  deleteExBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  exerciseBody: { padding: 14 },
  exerciseName: { fontSize: 17, fontWeight: '800', color: '#111', marginBottom: 12 },

  // Set card
  setCard: {
    backgroundColor: '#F8F8F8', borderRadius: 14,
    padding: 12, marginBottom: 10,
  },
  setCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  setNumber: { fontSize: 11, fontWeight: '800', color: '#AAA', letterSpacing: 1 },
  setDeleteBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#FFE8E8', justifyContent: 'center', alignItems: 'center',
  },
  setInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 10,
    marginBottom: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: '#EFEFEF',
  },
  setField: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  setLabel: { fontSize: 8, fontWeight: '900', color: '#BBB', letterSpacing: 1.5, marginBottom: 2 },
  setInput: {
    fontSize: 18, fontWeight: '800', color: '#000',
    textAlign: 'center', minWidth: 50, paddingVertical: 2,
  },
  setDivider: { width: 1, height: 36, backgroundColor: '#EFEFEF' },

  // RPE
  rpeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rpeLabel: { fontSize: 9, fontWeight: '900', color: '#BBB', letterSpacing: 1.5, width: 26 },
  rpeDots: { flexDirection: 'row', gap: 4, flexWrap: 'nowrap', flex: 1 },
  rpeDot: {
    flex: 1, height: 26, borderRadius: 7,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5,
  },
  rpeDotText: { fontSize: 11, fontWeight: '700', color: '#AAA' },

  // Add set
  addSetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 9, borderRadius: 11,
    borderWidth: 1.5, borderColor: '#E8E8E8', borderStyle: 'dashed', gap: 5,
    marginTop: 2,
  },
  addSetText: { fontSize: 13, fontWeight: '700', color: '#000' },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#CCC' },
  emptySubtitle: { fontSize: 14, color: '#CCC', fontWeight: '500' },

  // ── Picker ──
  pickerFullScreen: {
    flex: 1, backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  pickerTopBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 18,
  },
  pickerBackBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  pickerScreenLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, color: '#AAA' },
  pickerTitle: { fontSize: 22, fontWeight: '900', color: '#000' },
  pickerCountBadge: {
    backgroundColor: '#111', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  pickerCountText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    marginHorizontal: 20, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#000', fontWeight: '500' },
  filterGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 8, marginBottom: 14,
  },
  filterTile: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#EFEFEF',
  },
  filterTileText: { fontSize: 12, fontWeight: '700', color: '#999' },
  pickerDivider: { height: 1, backgroundColor: '#E8E8E8', marginHorizontal: 20, marginBottom: 8 },
  libraryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: '#F2F2F7',
  },
  libraryRowAdded: { opacity: 0.45 },
  libraryThumb: {
    width: 52, height: 52, borderRadius: 12,
    marginRight: 14, backgroundColor: '#EEE',
  },
  libraryGroupDot: {
    width: 52, height: 52, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  libraryName: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
  libraryGroup: { fontSize: 12, fontWeight: '600', color: '#AAA' },
  addIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
  },
  emptyLibrary: { marginTop: 12, color: '#CCC', fontWeight: '700', fontSize: 16 },
});

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  Keyboard,
  Pressable,
  Image,
  Animated,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../context/ThemeContext";
import { useMetrics } from "../context/MetricsContext";
import {
  EXERCISES,
  EXERCISE_LABELS,
  EXERCISE_IMAGES,
  ExerciseId,
} from "../../Constants/Exercises.ts";
import { usePRStore, PREntry } from "../../store/PRs.ts";

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
  exerciseDraftDirty?: boolean;
  onBack: () => void;
  onSave: () => void | Promise<void>;
  onAddExercise: (ex: Omit<WorkoutExercise, "sets">) => void;
  onAddSet: (exerciseId: string) => void;
  onUpdateSet: (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: string,
  ) => void;
  onUpdateSetRpe: (exerciseId: string, setId: string, rpe: number) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
}

// ─── Exercise Library ─────────────────────────────────────────────────────────
const MUSCLE_GROUPS = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Core",
  "Glutes",
  "Calves",
];

const EXERCISE_LIBRARY: { idKey: ExerciseId; muscleGroup: string }[] = [
  { idKey: EXERCISES.BARBELL_BENCH_PRESS, muscleGroup: "Chest" },
  { idKey: EXERCISES.INCLINE_BARBELL_BENCH_PRESS, muscleGroup: "Chest" },
  { idKey: EXERCISES.DUMBBELL_BENCH_PRESS, muscleGroup: "Chest" },
  { idKey: EXERCISES.INCLINE_DUMBBELL_BENCH_PRESS, muscleGroup: "Chest" },
  { idKey: EXERCISES.CHEST_FLY_MACHINE, muscleGroup: "Chest" },
  { idKey: EXERCISES.CABLE_CROSSOVER, muscleGroup: "Chest" },
  { idKey: EXERCISES.DIPS, muscleGroup: "Chest" },

  { idKey: EXERCISES.DEADLIFT, muscleGroup: "Back" },
  { idKey: EXERCISES.PULLUPS, muscleGroup: "Back" },
  { idKey: EXERCISES.BARBELL_ROW, muscleGroup: "Back" },
  { idKey: EXERCISES.SEATED_CABLE_ROW, muscleGroup: "Back" },
  { idKey: EXERCISES.LAT_PULLDOWN, muscleGroup: "Back" },
  { idKey: EXERCISES.T_BAR_ROW, muscleGroup: "Back" },
  { idKey: EXERCISES.DUMBBELL_ROW, muscleGroup: "Back" },
  { idKey: EXERCISES.HYPEREXTENSIONS, muscleGroup: "Back" },

  { idKey: EXERCISES.OVERHEAD_PRESS, muscleGroup: "Shoulders" },
  { idKey: EXERCISES.DUMBBELL_SHOULDER_PRESS, muscleGroup: "Shoulders" },
  { idKey: EXERCISES.DUMBBELL_LATERAL_RAISE, muscleGroup: "Shoulders" },
  { idKey: EXERCISES.CABLE_LATERAL_RAISE, muscleGroup: "Shoulders" },
  { idKey: EXERCISES.REAR_DELT_FLY, muscleGroup: "Shoulders" },
  { idKey: EXERCISES.BARBELL_SHRUGS, muscleGroup: "Shoulders" },

  { idKey: EXERCISES.BARBELL_CURL, muscleGroup: "Biceps" },
  { idKey: EXERCISES.DUMBBELL_BICEP_CURL, muscleGroup: "Biceps" },
  { idKey: EXERCISES.INCLINE_DUMBBELL_CURL, muscleGroup: "Biceps" },
  { idKey: EXERCISES.HAMMER_CURL, muscleGroup: "Biceps" },
  { idKey: EXERCISES.PREACHER_CURL, muscleGroup: "Biceps" },
  { idKey: EXERCISES.CABLE_BICEP_CURL, muscleGroup: "Biceps" },

  { idKey: EXERCISES.TRICEP_PUSH_DOWN, muscleGroup: "Triceps" },
  { idKey: EXERCISES.SKULL_CRUSHERS, muscleGroup: "Triceps" },
  { idKey: EXERCISES.OVERHEAD_TRICEP_EXTENSION, muscleGroup: "Triceps" },
  { idKey: EXERCISES.CLOSE_GRIP_BENCH_PRESS, muscleGroup: "Triceps" },

  { idKey: EXERCISES.BARBELL_SQUAT, muscleGroup: "Legs" },
  { idKey: EXERCISES.LEG_PRESS, muscleGroup: "Legs" },
  { idKey: EXERCISES.HACK_SQUAT, muscleGroup: "Legs" },
  { idKey: EXERCISES.LEG_EXTENSION, muscleGroup: "Legs" },
  { idKey: EXERCISES.LEG_CURL, muscleGroup: "Legs" },
  { idKey: EXERCISES.ROMANIAN_DEADLIFT, muscleGroup: "Legs" },
  { idKey: EXERCISES.BULGARIAN_SPLIT_SQUAT, muscleGroup: "Legs" },

  { idKey: EXERCISES.PLANK, muscleGroup: "Core" },
  { idKey: EXERCISES.CRUNCHES, muscleGroup: "Core" },
  { idKey: EXERCISES.CABLE_CRUNCH, muscleGroup: "Core" },
  { idKey: EXERCISES.HANGING_LEG_RAISE, muscleGroup: "Core" },

  { idKey: EXERCISES.STANDING_CALF_RAISE, muscleGroup: "Calves" },
  { idKey: EXERCISES.SEATED_CALF_RAISE, muscleGroup: "Calves" },
];

const MUSCLE_COLORS: Record<string, { bg: string; text: string }> = {
  Chest: { bg: "#FFE8E8", text: "#C0392B" },
  Back: { bg: "#E8F4FF", text: "#2980B9" },
  Shoulders: { bg: "#FFF3E0", text: "#E67E22" },
  Biceps: { bg: "#E8FFE8", text: "#27AE60" },
  Triceps: { bg: "#F0E8FF", text: "#8E44AD" },
  Legs: { bg: "#E8FFFF", text: "#16A085" },
  Core: { bg: "#FFFDE8", text: "#F39C12" },
  Glutes: { bg: "#FFE8F8", text: "#D63BD6" },
  Calves: { bg: "#E8FFEF", text: "#1ABC9C" },
};

const MUSCLE_GROUP_ICONS: Record<string, string> = {
  All: "apps",
  Chest: "body",
  Back: "trending-up",
  Shoulders: "arrow-up",
  Biceps: "fitness",
  Triceps: "barbell",
  Legs: "walk",
  Core: "ellipse",
  Glutes: "chevron-down",
  Calves: "footsteps",
};

function rpeTextColor(rpe: number): string {
  if (rpe === 0) return "#CCC";
  if (rpe <= 3) return "#00B894";
  if (rpe <= 6) return "#ffc800";
  if (rpe <= 8) return "#cf431f";
  return "#D63031";
}

const MAX_SETS_PER_EXERCISE = 10;
const PR_CHECK_DEBOUNCE_MS = 800;

function sanitizeIntegerInput(value: string): string {
  const trimmed = value.trim();
  const firstDigits = trimmed.match(/\d+/);
  return firstDigits ? firstDigits[0] : "";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function MuscleBadge({ group }: { group: string }) {
  const colors = MUSCLE_COLORS[group] || { bg: "#F0F0F0", text: "#888" };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{group}</Text>
    </View>
  );
}

function RpeStepper({
  value,
  onChange,
  colors,
}: {
  value: number;
  onChange: (rpe: number) => void;
  colors: any;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(Math.min(10, value + 1));

  const commitDraft = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= 1 && n <= 10) onChange(n);
    else if (draft === "" || draft === "0") onChange(0);
    setEditing(false);
  };

  return (
    <View style={[styles.rpeStepper, { backgroundColor: colors.surface }]}>
      <TouchableOpacity onPress={dec} style={styles.rpeStepBtn} disabled={value <= 0}>
        <Ionicons name="remove" size={12} color={value <= 0 ? colors.border : colors.secondaryText} />
      </TouchableOpacity>

      {editing ? (
        <TextInput
          style={[styles.rpeStepInput, { color: colors.text }]}
          value={draft}
          onChangeText={setDraft}
          keyboardType="number-pad"
          maxLength={2}
          autoFocus
          onBlur={commitDraft}
          onSubmitEditing={commitDraft}
          selectTextOnFocus
        />
      ) : (
        <TouchableOpacity onPress={() => { setDraft(value > 0 ? String(value) : ""); setEditing(true); }}>
          <Text style={[styles.rpeStepValue, { color: rpeTextColor(value) }]}>
            {value === 0 ? "—" : value}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={inc} style={styles.rpeStepBtn} disabled={value >= 10}>
        <Ionicons name="add" size={12} color={value >= 10 ? colors.border : colors.secondaryText} />
      </TouchableOpacity>
    </View>
  );
}

// ─── PR Badge: inline green 1RM cell shown when a PR is active ────────────────
function OneRmCell({
  oneRm,
  isPR,
  colors,
}: {
  oneRm: number | null;
  isPR: boolean;
  colors: any;
}) {
  // Fade-in animation that re-triggers whenever isPR flips to true.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prevIsPR = useRef(false);

  if (isPR && !prevIsPR.current) {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }
  prevIsPR.current = isPR;

  if (oneRm === null) {
    // RPE not set yet — show a neutral dash.
    return (
      <View style={styles.oneRmWrap}>
        <Text style={[styles.oneRmValue, { color: colors.border }]}>—</Text>
      </View>
    );
  }

  if (isPR) {
    return (
      <Animated.View style={[styles.oneRmWrap, styles.oneRmPrWrap, { opacity: fadeAnim }]}>
        <Text style={[styles.oneRmValue, styles.oneRmPrText]}>{Math.round(oneRm)} <Text style = {{fontSize : '6'}}>PR</Text></Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.oneRmWrap}>
      <Text style={[styles.oneRmValue, { color: colors.text }]}>{Math.round(oneRm)}</Text>
    </View>
  );
}

// ─── Set Row ──────────────────────────────────────────────────────────────────
function SetRow({
  set,
  index,
  exerciseName,
  onUpdate,
  onUpdateRpe,
  onDelete,
  onNewPRDiscovered,
  sessionPRs,
  colors,
}: {
  set: ExerciseSet;
  index: number;
  exerciseName: string;
  onUpdate: (field: "reps" | "weight", value: string) => void;
  onUpdateRpe: (rpe: number) => void;
  onDelete: () => void;
  onNewPRDiscovered: (entry: PREntry) => void;
  sessionPRs: Record<string, PREntry>;
  colors: any;
}) {
  const calculateEpley1RM = usePRStore((state) => state.calculateEpley1RM);
  const globalPRs = usePRStore((state) => state.personalRecords) ?? {};

  const prDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track whether THIS specific set is currently showing a PR badge.
  const [isThisSetPR, setIsThisSetPR] = useState(false);

  const parsedW = parseInt(set.weight, 10);
  const parsedR = parseInt(set.reps, 10);
  const hasValidInputs = !isNaN(parsedW) && parsedW > 0 && !isNaN(parsedR) && parsedR > 0;

  // 1RM is only calculated — and only displayed — when RPE is set.
  const rpeIsSet = set.rpe >= 1;
  const oneRm = rpeIsSet && hasValidInputs ? calculateEpley1RM(parsedW, parsedR) : null;

  /**
   * Debounced PR check.
   *
   * Fires only after the user pauses typing. Requires:
   *   • Both weight and reps to be valid positive numbers.
   *   • RPE to be set (≥ 1) — this is the gate for 1RM display and PR tracking.
   *
   * Comparison priority:
   *   1. Higher 1RM beats everything.
   *   2. Equal 1RM with lower RPE = better fitness, still a PR.
   *
   * The ceiling is always max(historicalBest, sessionBest) so earlier sets in
   * the same workout protect against false re-alerts.
   */
  const scheduleDelayedPRCheck = (
    updatedWeight: string,
    updatedReps: string,
    currentRpe: number,
  ) => {
    if (prDebounceTimer.current) clearTimeout(prDebounceTimer.current);

    prDebounceTimer.current = setTimeout(() => {
      const w = parseInt(updatedWeight, 10);
      const r = parseInt(updatedReps, 10);

      // Need all three fields valid before comparing.
      if (isNaN(w) || w <= 0 || isNaN(r) || r <= 0 || currentRpe < 1) {
        setIsThisSetPR(false);
        return;
      }

      const calculated1RM = calculateEpley1RM(w, r);

      const historicalEntry = globalPRs?.[exerciseName as ExerciseId];
      const sessionEntry = sessionPRs?.[exerciseName];

      // Build a unified ceiling from history + session.
      const ceilingOneRM = Math.max(
        historicalEntry?.oneRM ?? 0,
        sessionEntry?.oneRM ?? 0,
      );
      // For RPE tie-breaking: use the lowest RPE we've ever seen at this 1RM.
      const ceilingRpe = (() => {
        if (calculated1RM === (historicalEntry?.oneRM ?? -1)) return historicalEntry!.rpe;
        if (calculated1RM === (sessionEntry?.oneRM ?? -1)) return sessionEntry!.rpe;
        return Infinity; // No existing record at this exact 1RM — anything wins.
      })();

      const isNewPR =
        calculated1RM > ceilingOneRM ||
        (calculated1RM === ceilingOneRM && currentRpe < ceilingRpe);

      setIsThisSetPR(isNewPR);

      if (isNewPR) {
        onNewPRDiscovered({ oneRM: calculated1RM, rpe: currentRpe });
      }
    }, PR_CHECK_DEBOUNCE_MS);
  };

  // If the user clears RPE, immediately hide the PR badge for this row.
  const handleRpeChange = (newRpe: number) => {
    onUpdateRpe(newRpe);
    if (newRpe < 1) {
      setIsThisSetPR(false);
      if (prDebounceTimer.current) clearTimeout(prDebounceTimer.current);
    } else {
      scheduleDelayedPRCheck(set.weight, set.reps, newRpe);
    }
  };

  return (
    <View style={styles.setRow}>
      <Text style={[styles.setNum, { color: colors.secondaryText }]}>{index + 1}</Text>

      {/* KG / LBS INPUT */}
      <TextInput
        style={[styles.setInput, styles.setInputKg, { backgroundColor: colors.surface, color: colors.text }]}
        value={set.weight}
        onChangeText={(v) => {
          const sanitized = sanitizeIntegerInput(v);
          onUpdate("weight", sanitized);
          scheduleDelayedPRCheck(sanitized, set.reps, set.rpe);
        }}
        keyboardType="number-pad"
        placeholder="—"
        placeholderTextColor={colors.border}
        maxLength={5}
        textAlign="center"
      />

      {/* REPS INPUT */}
      <TextInput
        style={[styles.setInput, styles.setInputReps, { backgroundColor: colors.surface, color: colors.text }]}
        value={set.reps}
        onChangeText={(v) => {
          const sanitized = sanitizeIntegerInput(v);
          onUpdate("reps", sanitized);
          scheduleDelayedPRCheck(set.weight, sanitized, set.rpe);
        }}
        keyboardType="number-pad"
        placeholder="—"
        placeholderTextColor={colors.border}
        maxLength={3}
        textAlign="center"
      />

      {/* RPE STEPPER */}
      <RpeStepper value={set.rpe} onChange={handleRpeChange} colors={colors} />

      {/* 1RM — only visible once RPE is set; green + arrow when it's a PR */}
      <OneRmCell oneRm={oneRm} isPR={isThisSetPR} colors={colors} />

      <TouchableOpacity onPress={onDelete} style={styles.setDeleteBtn}>
        <Ionicons name="remove-circle-outline" size={18} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────
function ExerciseCard({
  exercise,
  onAddSet,
  onUpdateSet,
  onUpdateSetRpe,
  onDeleteSet,
  onDelete,
  onStagePR,
  sessionPRs,
  colors,
}: {
  exercise: WorkoutExercise;
  onAddSet: () => void;
  onUpdateSet: (setId: string, field: "reps" | "weight", value: string) => void;
  onUpdateSetRpe: (setId: string, rpe: number) => void;
  onDeleteSet: (setId: string) => void;
  onDelete: () => void;
  onStagePR: (entry: PREntry) => void;
  sessionPRs: Record<string, PREntry>;
  colors: any;
}) {
  const [expanded, setExpanded] = useState(true);
  const { isMetric } = useMetrics();
  const canAddSet = exercise.sets.length < MAX_SETS_PER_EXERCISE;

  return (
    <View style={[styles.exerciseCard, { backgroundColor: colors.surface }]}>
      <TouchableOpacity style={styles.exerciseHeader} onPress={() => setExpanded((e) => !e)} activeOpacity={0.75}>
        <Image source={{ uri: exercise.imageUrl }} style={styles.exerciseThumb} resizeMode="cover" />
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={[styles.exerciseName, { color: colors.text }]} numberOfLines={1}>
            {EXERCISE_LABELS[exercise.name as ExerciseId] || exercise.name}
          </Text>
          <MuscleBadge group={exercise.muscleGroup} />
        </View>
        <TouchableOpacity style={styles.deleteExBtn} onPress={(e) => { e.stopPropagation?.(); onDelete(); }}>
          <Ionicons name="trash-outline" size={14} color="#FF4444" />
        </TouchableOpacity>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.border} style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {expanded && exercise.sets.length > 0 && (
        <View style={[styles.setsSection, { borderTopColor: colors.background }]}>
          <View style={[styles.setsHeaderRow, { borderBottomColor: colors.background }]}>
            <Text style={[styles.setsColLabel, styles.setsColSet]}>SET</Text>
            <Text style={[styles.setsColLabel, styles.setsColKg]}>{isMetric ? "KG" : "LBS"}</Text>
            <Text style={[styles.setsColLabel, styles.setsColReps]}>REPS</Text>
            <Text style={[styles.setsColLabel, styles.setsColRpe]}>RPE</Text>
            <Text style={[styles.setsColLabel, styles.setsColOneRm]}>1RM</Text>
            <View style={styles.setsColDeleteSpacer} />
          </View>

          {exercise.sets.map((set, idx) => (
            <SetRow
              key={set.id}
              set={set}
              index={idx}
              exerciseName={exercise.name}
              onUpdate={(field, value) => onUpdateSet(set.id, field, value)}
              onUpdateRpe={(rpe) => onUpdateSetRpe(set.id, rpe)}
              onDelete={() => onDeleteSet(set.id)}
              onNewPRDiscovered={onStagePR}
              sessionPRs={sessionPRs}
              colors={colors}
            />
          ))}
        </View>
      )}

      {expanded && (
        <>
          <TouchableOpacity
            style={[styles.addSetBtn, { borderTopColor: colors.background }, !canAddSet && styles.addSetBtnDisabled]}
            onPress={canAddSet ? onAddSet : undefined}
            disabled={!canAddSet}
          >
            <Ionicons name="add" size={14} color={canAddSet ? colors.secondaryText : colors.border} />
            <Text style={[styles.addSetText, { color: colors.secondaryText }, !canAddSet && { color: colors.border }]}>
              Add Set
            </Text>
          </TouchableOpacity>
          {!canAddSet && (
            <Text style={[styles.maxSetsNote, { color: colors.border }]}>Max {MAX_SETS_PER_EXERCISE} sets per exercise</Text>
          )}
        </>
      )}
    </View>
  );
}

// ─── Exercise Library Picker ──────────────────────────────────────────────────
function ExercisePicker({
  onAdd,
  onClose,
  alreadyAdded,
  colors,
}: {
  onAdd: (ex: Omit<WorkoutExercise, "sets">) => void;
  onClose: () => void;
  alreadyAdded: string[];
  colors: any;
}) {
  const [activeGroup, setActiveGroup] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = EXERCISE_LIBRARY.filter((ex) => {
    const matchGroup = activeGroup === "All" || ex.muscleGroup === activeGroup;
    const displayName = EXERCISE_LABELS[ex.idKey].toLowerCase();
    const matchSearch = displayName.includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  return (
    <View style={[styles.pickerFullScreen, { backgroundColor: colors.background }]}>
      <View style={styles.pickerTopBar}>
        <TouchableOpacity style={[styles.pickerBackBtn, { backgroundColor: colors.surface }]} onPress={onClose}>
          <Ionicons name="chevron-back" size={20} color={colors.icon} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.pickerScreenLabel}>BROWSE</Text>
          <Text style={[styles.pickerTitle, { color: colors.text }]}>Exercise Library</Text>
        </View>
        <View style={[styles.pickerCountBadge, { backgroundColor: colors.text }]}>
          <Text style={[styles.pickerCountText, { color: colors.background }]}>{filtered.length}</Text>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={18} color={colors.secondaryText} style={{ marginRight: 10 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search exercises..."
          placeholderTextColor={colors.secondaryText}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterGrid}>
        {MUSCLE_GROUPS.map((g) => {
          const isActive = activeGroup === g;
          const muscleColor = g !== "All" ? MUSCLE_COLORS[g] : null;
          return (
            <TouchableOpacity
              key={g}
              style={[
                styles.filterTile,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isActive && muscleColor
                  ? { backgroundColor: muscleColor.bg, borderColor: muscleColor.text, borderWidth: 2 }
                  : isActive
                    ? { backgroundColor: colors.icon, borderColor: colors.icon, borderWidth: 2 }
                    : {},
              ]}
              onPress={() => setActiveGroup(g)}
            >
              <Ionicons
                name={MUSCLE_GROUP_ICONS[g] as any}
                size={14}
                color={isActive ? (muscleColor ? muscleColor.text : colors.surface) : colors.secondaryText}
              />
              <Text
                style={[
                  styles.filterTileText,
                  isActive && muscleColor
                    ? { color: muscleColor.text, fontWeight: "800" }
                    : isActive
                      ? { color: colors.surface, fontWeight: "800" }
                      : { color: colors.secondaryText },
                ]}
                numberOfLines={1}
              >
                {g}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.pickerDivider, { backgroundColor: colors.border }]} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.idKey}
        renderItem={({ item }) => {
          const isAdded = alreadyAdded.includes(item.idKey);
          const rowColors = MUSCLE_COLORS[item.muscleGroup];
          const imgUrl = EXERCISE_IMAGES[item.idKey] ?? "";
          return (
            <TouchableOpacity
              style={[
                styles.libraryRow,
                { backgroundColor: colors.surface, borderBottomColor: colors.border },
                isAdded && styles.libraryRowAdded,
              ]}
              onPress={() => {
                if (!isAdded) {
                  onAdd({ id: `ex-${Date.now()}-${Math.random()}`, name: item.idKey, muscleGroup: item.muscleGroup, imageUrl: imgUrl });
                }
              }}
              disabled={isAdded}
            >
              {imgUrl ? (
                <Image source={{ uri: imgUrl }} style={styles.libraryThumb} />
              ) : (
                <View style={[styles.libraryGroupDot, { backgroundColor: rowColors?.bg ?? colors.background }]}>
                  <Ionicons name={MUSCLE_GROUP_ICONS[item.muscleGroup] as any} size={16} color={rowColors?.text ?? colors.secondaryText} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.libraryName, { color: colors.text }, isAdded && { color: colors.secondaryText }]}>
                  {EXERCISE_LABELS[item.idKey]}
                </Text>
                <Text style={[styles.libraryGroup, { color: colors.secondaryText }, rowColors && { color: rowColors.text }]}>
                  {item.muscleGroup}
                </Text>
              </View>
              <View style={[styles.addIconWrap, { backgroundColor: colors.background }, isAdded && { backgroundColor: "#E8FFF4" }]}>
                <Ionicons name={isAdded ? "checkmark" : "add"} size={18} color={isAdded ? "#00B894" : colors.icon} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="search-outline" size={40} color={colors.border} />
            <Text style={[styles.emptyLibrary, { color: colors.secondaryText }]}>No exercises found</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExerciseDetail({
  workoutTitle,
  exercises,
  exerciseDraftDirty = false,
  onBack,
  onSave,
  onAddExercise,
  onAddSet,
  onUpdateSet,
  onUpdateSetRpe,
  onDeleteSet,
  onDeleteExercise,
}: Props) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const commitPRsToCache = usePRStore((state) => state.saveNewPRs);

  /**
   * sessionPRs now stores PREntry objects { oneRM, rpe } instead of raw numbers.
   * This enables both the 1RM > ceiling check AND the equal-1RM / lower-RPE check.
   */
  const [sessionPRs, setSessionPRs] = useState<Record<string, PREntry>>({});

  const alreadyAdded = exercises.map((e) => e.name);

  const handleWorkoutCommit = async () => {
    if (Object.keys(sessionPRs).length > 0) {
      commitPRsToCache(sessionPRs);
    }
    await onSave();
  };

  if (showPicker) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ExercisePicker
          onAdd={(ex) => { onAddExercise(ex); }}
          onClose={() => setShowPicker(false)}
          alreadyAdded={alreadyAdded}
          colors={colors}
        />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Pressable style={[{ flex: 1, backgroundColor: colors.background }]} onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.topBar}>
            <TouchableOpacity style={[styles.circleBtn, { backgroundColor: colors.surface }]} onPress={onBack}>
              <Ionicons name="chevron-back" size={20} color={colors.icon} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={[styles.screenLabel, { color: colors.secondaryText }]}>WORKOUT</Text>
              <Text style={[styles.workoutTitle, { color: colors.text }]} numberOfLines={1}>
                {workoutTitle.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addExBtn, { backgroundColor: colors.text }]}
              onPress={() => { Keyboard.dismiss(); setShowPicker(true); }}
            >
              <Ionicons name="add" size={22} color={colors.background} />
            </TouchableOpacity>
          </View>

          <View style={styles.listWrap}>
            <FlatList
              data={exercises}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContentScroll}
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
                  onStagePR={(entry: PREntry) => {
                    setSessionPRs((prev) => {
                      const current = prev[item.name];
                      const shouldUpdate =
                        !current ||
                        entry.oneRM > current.oneRM ||
                        (entry.oneRM === current.oneRM && entry.rpe < current.rpe);
                      if (shouldUpdate) return { ...prev, [item.name]: entry };
                      return prev;
                    });
                  }}
                  sessionPRs={sessionPRs}
                  colors={colors}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="barbell-outline" size={48} color={colors.border} />
                  <Text style={[styles.emptyTitle, { color: colors.border }]}>No exercises yet</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.border }]}>Tap + to browse the exercise library</Text>
                </View>
              }
              ListFooterComponent={
                exerciseDraftDirty ? (
                  <View style={styles.listSaveFooter}>
                    <TouchableOpacity
                      style={[styles.listSaveBtn, { backgroundColor: colors.text }]}
                      onPress={handleWorkoutCommit}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.listSaveBtnText, { color: colors.background }]}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      </Pressable>
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleContainer: { alignItems: "center", flex: 1, marginHorizontal: 12 },
  screenLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: "#AAA" },
  workoutTitle: { fontSize: 15, fontWeight: "900", color: "#000", letterSpacing: 1, maxWidth: 180 },
  circleBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  addExBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  listWrap: { flex: 1 },
  listContentScroll: { paddingHorizontal: 16, paddingBottom: Platform.OS === "ios" ? 36 : 24, flexGrow: 1 },
  listSaveFooter: { marginTop: 8, paddingBottom: 8 },
  listSaveBtn: { height: 48, borderRadius: 12, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  listSaveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  badge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  exerciseCard: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 10, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  exerciseHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 },
  exerciseThumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: "#F0F0F0" },
  exerciseName: { fontSize: 14, fontWeight: "800", color: "#111", marginBottom: 3 },
  addSetBtnSmall: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: "#F0F0F0",
    justifyContent: "center", alignItems: "center", marginRight: 6,
  },
  deleteExBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFF0F0", justifyContent: "center", alignItems: "center" },
  setsSection: { borderTopWidth: 1, borderTopColor: "#F4F4F4", paddingHorizontal: 12, paddingBottom: 4 },
  setsHeaderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F4F4F4" },
  setsColLabel: { fontSize: 9, fontWeight: "900", color: "#CCC", letterSpacing: 1 },
  setsColSet: { width: 30, textAlign: "center" },
  setsColKg: { width: 65, textAlign: "center" },
  setsColReps: { width: 55, textAlign: "center" },
  setsColRpe: { width: 75, textAlign: "center" },
  setsColOneRm: { width: 55, textAlign: "center" },
  setsColDeleteSpacer: { flex: 1 },
  setRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F9F9F9" },
  setNum: { width: 30, textAlign: "center", fontSize: 13, fontWeight: "800", color: "#888" },
  setInput: {
    fontSize: 14, fontWeight: "700", color: "#111", textAlign: "center",
    backgroundColor: "#F8F8F8", borderRadius: 8, paddingHorizontal: 4,
    height: 36, textAlignVertical: "center", paddingVertical: 0,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
  setInputKg: { width: 60, marginRight: 5 },
  setInputReps: { width: 50, marginRight: 5 },
  setDeleteBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  oneRmWrap: { width: 55, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  oneRmPrWrap: { backgroundColor: "#E8FFF6", borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 },
  oneRmValue: { fontSize: 12, fontWeight: "800", color: "#111" },
  oneRmPrText: { color: "#00B894" },
  rpeStepper: { width: 70, marginRight: 5, flexDirection: "row", alignItems: "center", backgroundColor: "#F8F8F8", borderRadius: 8, overflow: "hidden" },
  rpeStepBtn: { width: 20, height: 32, justifyContent: "center", alignItems: "center" },
  rpeStepValue: { width: 24, textAlign: "center", fontSize: 14, fontWeight: "800" },
  rpeStepInput: { width: 28, textAlign: "center", fontSize: 12, fontWeight: "800", color: "#111", paddingVertical: 0 },
  addSetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 9, gap: 4, borderTopWidth: 1, borderTopColor: "#F4F4F4" },
  addSetBtnDisabled: { opacity: 0.45 },
  addSetText: { fontSize: 12, fontWeight: "700", color: "#888" },
  disabledActionButton: { opacity: 0.5 },
  maxSetsNote: { fontSize: 11, color: "#999", textAlign: "center", paddingVertical: 8 },
  emptyState: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#CCC" },
  emptySubtitle: { fontSize: 14, color: "#CCC", fontWeight: "500" },
  pickerFullScreen: { flex: 1, backgroundColor: "#F2F2F7", paddingTop: Platform.OS === "ios" ? 60 : 40 },
  pickerTopBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 18 },
  pickerBackBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  pickerScreenLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 2, color: "#AAA" },
  pickerTitle: { fontSize: 22, fontWeight: "900", color: "#000" },
  pickerCountBadge: { backgroundColor: "#111", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  pickerCountText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  searchBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    marginHorizontal: 20, marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#000", fontWeight: "500" },
  filterGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8, marginBottom: 14 },
  filterTile: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#EFEFEF" },
  filterTileText: { fontSize: 12, fontWeight: "700", color: "#999" },
  pickerDivider: { height: 1, backgroundColor: "#E8E8E8", marginHorizontal: 20, marginBottom: 8 },
  libraryRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F0F0F0", backgroundColor: "#F2F2F7" },
  libraryRowAdded: { opacity: 0.45 },
  libraryThumb: { width: 52, height: 52, borderRadius: 12, marginRight: 14, backgroundColor: "#EEE" },
  libraryGroupDot: { width: 52, height: 52, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 14 },
  libraryName: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 2 },
  libraryGroup: { fontSize: 12, fontWeight: "600", color: "#AAA" },
  addIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F0F0F0", justifyContent: "center", alignItems: "center" },
  emptyLibrary: { marginTop: 12, color: "#CCC", fontWeight: "700", fontSize: 16 },
});

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  AppState,
  Alert,
} from 'react-native';
import DailySchedule from '../workout-tab/workoutSchedule';
import ProgramScreen, { DEFAULT_PROGRAMS, type Program } from '../workout-tab/programs';
import ExerciseDetail, { WorkoutExercise, ExerciseSet } from '../workout-tab/ExerciseDetail';
import {
  loadWorkoutsFromStorage,
  saveWorkoutsToStorage,
  type WorkoutPersistencePayload,
} from '../workout-tab/workoutPersistence';
import { syncToCloud, fetchFromCloud } from '../workout-tab/workoutSync';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface Workout {
  id: string;
  title: string;
  dayOfWeek: number;
  note: string;
  programId: string;
}

function cloneExercises(list: WorkoutExercise[]): WorkoutExercise[] {
  return JSON.parse(JSON.stringify(list)) as WorkoutExercise[];
}

export default function WorkoutScreen() {
  const [hydrated, setHydrated] = useState(false);
  const [programs, setPrograms] = useState<Program[]>(DEFAULT_PROGRAMS);
  const [currentProgramId, setCurrentProgramId] = useState('p1');
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);

  const [exerciseMap, setExerciseMap] = useState<Record<string, WorkoutExercise[]>>({});
  const [draftExercises, setDraftExercises] = useState<WorkoutExercise[]>([]);

  const stateRef = useRef({
    allWorkouts: [] as Workout[],
    exerciseMap: {} as Record<string, WorkoutExercise[]>,
    activeWorkout: null as Workout | null,
    draftExercises: [] as WorkoutExercise[],
    programs: [] as Program[],
    currentProgramId: 'p1',
  });

  useEffect(() => {
    stateRef.current = {
      allWorkouts,
      exerciseMap,
      activeWorkout,
      draftExercises,
      programs,
      currentProgramId,
    };
  }, [allWorkouts, exerciseMap, activeWorkout, draftExercises, programs, currentProgramId]);

  const exerciseDraftDirty = useMemo(() => {
    if (!activeWorkout) return false;
    const saved = exerciseMap[activeWorkout.id] ?? [];
    return JSON.stringify(draftExercises) !== JSON.stringify(saved);
  }, [activeWorkout, draftExercises, exerciseMap]);

  // Mount — load from storage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadWorkoutsFromStorage();
        if (cancelled) return;
        if (data) {
          setAllWorkouts(data.workouts);
          setExerciseMap(data.exerciseMap);
          if (data.programs?.length) {
            setPrograms(data.programs);
          }
          if (data.currentProgramId) {
            setCurrentProgramId(data.currentProgramId);
          }
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: WorkoutPersistencePayload = {
      workouts: allWorkouts,
      exerciseMap,
      programs,
      currentProgramId,
    };
    saveWorkoutsToStorage(payload).catch(() => {});
  }, [hydrated, allWorkouts, exerciseMap, programs, currentProgramId]);

  // AppState: background safety flush; foreground cloud pull
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background') {
        const {
          allWorkouts: w,
          exerciseMap: em,
          activeWorkout: aw,
          draftExercises: d,
          programs: pr,
          currentProgramId: cpid,
        } = stateRef.current;
        if (!aw) return;
        const saved = em[aw.id] ?? [];
        if (JSON.stringify(d) === JSON.stringify(saved)) return;
        const merged: Record<string, WorkoutExercise[]> = { ...em, [aw.id]: d };
        const payload: WorkoutPersistencePayload = {
          workouts: w,
          exerciseMap: merged,
          programs: pr,
          currentProgramId: cpid,
        };
        saveWorkoutsToStorage(payload).catch(() => {});
        syncToCloud(payload).catch(() => {});
        setExerciseMap(merged);
        return;
      }
      if (next !== 'active') return;
      void (async () => {
        try {
          const remote = await fetchFromCloud();
          if (!remote) return;
          setAllWorkouts(remote.workouts);
          setExerciseMap(remote.exerciseMap);
          if (remote.programs?.length) setPrograms(remote.programs);
          if (remote.currentProgramId) setCurrentProgramId(remote.currentProgramId);
          await saveWorkoutsToStorage(remote);
          const { activeWorkout: aw } = stateRef.current;
          if (aw) {
            setDraftExercises(cloneExercises(remote.exerciseMap[aw.id] ?? []));
          }
        } catch {
          /* ignore */
        }
      })();
    });
    return () => sub.remove();
  }, []);

  const handleBackToPrograms = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProgram(null);
  };

  const handleSelectProgram = (program: Program) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProgram(program);
  };

  const addWorkoutToGlobal = (newWorkout: any) => {
    if (!activeProgram) return;
    const dup = allWorkouts.some(
      (w) => w.programId === activeProgram.id && w.dayOfWeek === newWorkout.dayOfWeek
    );
    if (dup) {
      Alert.alert('Day taken', 'This program already has a workout on that day.');
      return;
    }
    const workoutWithId = { ...newWorkout, programId: activeProgram.id };
    setAllWorkouts((prev) => [...prev, workoutWithId]);
  };

  const deleteWorkoutFromGlobal = (id: string) => {
    setAllWorkouts((prev) => prev.filter((w) => w.id !== id));
    setExerciseMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSelectWorkout = (workout: Workout) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveWorkout(workout);
    setDraftExercises(cloneExercises(exerciseMap[workout.id] ?? []));
  };

  const handleSaveExercises = useCallback(async () => {
    const aw = stateRef.current.activeWorkout;
    if (!aw) return;
    const { allWorkouts: w, exerciseMap: em, draftExercises: d } = stateRef.current;
    const nextMap = { ...em, [aw.id]: cloneExercises(d) };
    setExerciseMap(nextMap);
    const { programs: pr, currentProgramId: cpid } = stateRef.current;
    const payload: WorkoutPersistencePayload = {
      workouts: w,
      exerciseMap: nextMap,
      programs: pr,
      currentProgramId: cpid,
    };
    await saveWorkoutsToStorage(payload);
    await syncToCloud(payload);
  }, []);

  const handleDiscardExercises = useCallback(() => {
    const aw = stateRef.current.activeWorkout;
    if (!aw) return;
    const saved = stateRef.current.exerciseMap[aw.id] ?? [];
    setDraftExercises(cloneExercises(saved));
  }, []);

  const handleBackToSchedule = () => {
    if (!activeWorkout) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveWorkout(null);
      return;
    }
    const saved = exerciseMap[activeWorkout.id] ?? [];
    if (JSON.stringify(draftExercises) === JSON.stringify(saved)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveWorkout(null);
      return;
    }
    Alert.alert('Unsaved changes', 'Save your edits, or discard them and go back.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          handleDiscardExercises();
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setActiveWorkout(null);
        },
      },
      {
        text: 'Save',
        onPress: () => {
          void (async () => {
            await handleSaveExercises();
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setActiveWorkout(null);
          })();
        },
      },
    ]);
  };

  const handleDraftAddExercise = (ex: Omit<WorkoutExercise, 'sets'>) => {
    setDraftExercises((prev) => [...prev, { ...ex, sets: [] }]);
  };

  const handleDraftAddSet = (exerciseId: string) => {
    setDraftExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const newSet: ExerciseSet = {
          id: `set-${Date.now()}-${Math.random()}`,
          reps: '',
          weight: '',
          rpe: 0,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      })
    );
  };

  const handleDraftUpdateSet = (
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: string
  ) => {
    setDraftExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
        };
      })
    );
  };

  const handleDraftUpdateSetRpe = (exerciseId: string, setId: string, rpe: number) => {
    setDraftExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, rpe } : s)),
        };
      })
    );
  };

  const handleDraftDeleteSet = (exerciseId: string, setId: string) => {
    setDraftExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return { ...ex, sets: ex.sets.filter((s) => s.id !== setId) };
      })
    );
  };

  const handleDraftDeleteExercise = (exerciseId: string) => {
    setDraftExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" />

      {activeWorkout ? (
        <ExerciseDetail
          workoutTitle={activeWorkout.title}
          exercises={draftExercises}
          exerciseDraftDirty={exerciseDraftDirty}
          onBack={handleBackToSchedule}
          onSave={handleSaveExercises}
          onAddExercise={handleDraftAddExercise}
          onAddSet={handleDraftAddSet}
          onUpdateSet={(exId, setId, field, value) =>
            handleDraftUpdateSet(exId, setId, field, value)
          }
          onUpdateSetRpe={(exId, setId, rpe) => handleDraftUpdateSetRpe(exId, setId, rpe)}
          onDeleteSet={(exId, setId) => handleDraftDeleteSet(exId, setId)}
          onDeleteExercise={handleDraftDeleteExercise}
        />
      ) : activeProgram ? (
        <DailySchedule
          activeProgram={activeProgram}
          workouts={allWorkouts.filter((w) => w.programId === activeProgram.id)}
          onAddWorkout={addWorkoutToGlobal}
          onDeleteWorkout={deleteWorkoutFromGlobal}
          handleBackToPrograms={handleBackToPrograms}
          onSelectWorkout={handleSelectWorkout}
        />
      ) : (
        <ProgramScreen
          handleSelectProgram={handleSelectProgram}
          programs={programs}
          setPrograms={setPrograms}
          currentProgramId={currentProgramId}
          setCurrentProgramId={setCurrentProgramId}
        />
      )}
    </View>
  );
}

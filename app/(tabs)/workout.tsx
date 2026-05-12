import React, { useState } from 'react';
import {
  View,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import DailySchedule from '../workout-tab/workoutSchedule';
import ProgramScreen from '../workout-tab/programs';
import ExerciseDetail, { WorkoutExercise, ExerciseSet } from '../workout-tab/ExerciseDetail';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Program {
  id: string;
  title: string;
  image: string;
}

export interface Workout {
  id: string;
  title: string;
  dayOfWeek: number;
  note: string;
  programId: string;
}

export default function WorkoutScreen() {
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);

  // exerciseMap: { workoutId: WorkoutExercise[] }
  const [exerciseMap, setExerciseMap] = useState<Record<string, WorkoutExercise[]>>({});

  // ─── Program navigation ───────────────────────────────────────────────────
  const handleBackToPrograms = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProgram(null);
  };

  const handleSelectProgram = (program: Program) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProgram(program);
  };

  // ─── Workout CRUD ──────────────────────────────────────────────────────────
  const addWorkoutToGlobal = (newWorkout: any) => {
    if (!activeProgram) return;
    const workoutWithId = { ...newWorkout, programId: activeProgram.id };
    setAllWorkouts(prev => [...prev, workoutWithId]);
  };

  const deleteWorkoutFromGlobal = (id: string) => {
    setAllWorkouts(prev => prev.filter(w => w.id !== id));
    setExerciseMap(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSelectWorkout = (workout: Workout) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveWorkout(workout);
  };

  const handleBackToSchedule = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveWorkout(null);
  };

  // ─── Exercise CRUD ─────────────────────────────────────────────────────────
  const getExercises = (workoutId: string): WorkoutExercise[] =>
    exerciseMap[workoutId] ?? [];

  const handleAddExercise = (workoutId: string, ex: Omit<WorkoutExercise, 'sets'>) => {
    setExerciseMap(prev => ({
      ...prev,
      [workoutId]: [...(prev[workoutId] ?? []), { ...ex, sets: [] }],
    }));
  };

  const handleAddSet = (workoutId: string, exerciseId: string) => {
    setExerciseMap(prev => {
      const exercises = prev[workoutId] ?? [];
      return {
        ...prev,
        [workoutId]: exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          const newSet: ExerciseSet = {
            id: `set-${Date.now()}-${Math.random()}`,
            reps: '',
            weight: '',
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }),
      };
    });
  };

  const handleUpdateSet = (
    workoutId: string,
    exerciseId: string,
    setId: string,
    field: 'reps' | 'weight',
    value: string
  ) => {
    setExerciseMap(prev => {
      const exercises = prev[workoutId] ?? [];
      return {
        ...prev,
        [workoutId]: exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(s =>
              s.id === setId ? { ...s, [field]: value } : s
            ),
          };
        }),
      };
    });
  };

  const handleDeleteSet = (workoutId: string, exerciseId: string, setId: string) => {
    setExerciseMap(prev => {
      const exercises = prev[workoutId] ?? [];
      return {
        ...prev,
        [workoutId]: exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
        }),
      };
    });
  };

  const handleDeleteExercise = (workoutId: string, exerciseId: string) => {
    setExerciseMap(prev => {
      const exercises = prev[workoutId] ?? [];
      return {
        ...prev,
        [workoutId]: exercises.filter(ex => ex.id !== exerciseId),
      };
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <StatusBar barStyle="dark-content" />

      {activeWorkout ? (
        <ExerciseDetail
          workoutTitle={activeWorkout.title}
          exercises={getExercises(activeWorkout.id)}
          onBack={handleBackToSchedule}
          onAddExercise={(ex) => handleAddExercise(activeWorkout.id, ex)}
          onAddSet={(exId) => handleAddSet(activeWorkout.id, exId)}
          onUpdateSet={(exId, setId, field, value) =>
            handleUpdateSet(activeWorkout.id, exId, setId, field, value)
          }
          onDeleteSet={(exId, setId) => handleDeleteSet(activeWorkout.id, exId, setId)}
          onDeleteExercise={(exId) => handleDeleteExercise(activeWorkout.id, exId)}
        />
      ) : activeProgram ? (
        <DailySchedule
          activeProgram={activeProgram}
          workouts={allWorkouts.filter(w => w.programId === activeProgram.id)}
          onAddWorkout={addWorkoutToGlobal}
          onDeleteWorkout={deleteWorkoutFromGlobal}
          handleBackToPrograms={handleBackToPrograms}
          onSelectWorkout={handleSelectWorkout}
        />
      ) : (
        <ProgramScreen handleSelectProgram={handleSelectProgram} />
      )}
    </View>
  );
}

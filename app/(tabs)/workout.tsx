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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Program {
  id: string;
  title: string;
  image: string;
}

// Global Workout interface (Matching what we built)
export interface Workout {
  id: string;
  title: string;
  dayOfWeek: number;
  note: string;
  programId: string; // The "Link" to the Program
}

export default function WorkoutScreen() {
  const [activeProgram, setActiveProgram] = useState<Program | null>(null); 

  // GLOBAL STATE: This holds all workouts for ALL your routines
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);

  const handleBackToPrograms = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProgram(null);
  };

  const handleSelectProgram = (program: Program) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveProgram(program);
  };

  // --- Shared Logic ---
  const addWorkoutToGlobal = (newWorkout: any) => {
    if (!activeProgram) return;
    const workoutWithId = { ...newWorkout, programId: activeProgram.id };
    setAllWorkouts(prev => [...prev, workoutWithId]);
  };

  const deleteWorkoutFromGlobal = (id: string) => {
    setAllWorkouts(prev => prev.filter(w => w.id !== id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      
      {activeProgram ? (
        <DailySchedule 
          activeProgram={activeProgram} 
          // FILTER: Only pass workouts belonging to this specific program
          workouts={allWorkouts.filter(w => w.programId === activeProgram.id)}
          onAddWorkout={addWorkoutToGlobal}
          onDeleteWorkout={deleteWorkoutFromGlobal}
          handleBackToPrograms={handleBackToPrograms} 
        />
      ) : (
        <ProgramScreen handleSelectProgram={handleSelectProgram}/>
      )}
    </View>
  );
}
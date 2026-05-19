import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutExercise } from './ExerciseDetail';

export const WORKOUTS_KEY = 'WORKOUTS_KEY';

export interface Workout {
  id: string;
  title: string;
  dayOfWeek: number;
  note: string;
  programId: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
}

export interface WorkoutPersistencePayload {
  workouts: Workout[];
  exerciseMap: Record<string, WorkoutExercise[]>;
  programs: Program[];
  currentProgramId: string;
}

/**
 * Load workouts from AsyncStorage
 * Maps to: getItem(WORKOUTS_KEY) -> workouts[] with exercises[]
 */
export async function loadWorkoutsFromStorage(): Promise<WorkoutPersistencePayload | null> {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    if (!data) return null;
    return JSON.parse(data) as WorkoutPersistencePayload;
  } catch (error) {
    console.error('Error loading workouts from storage:', error);
    return null;
  }
}

/**
 * Save workouts to AsyncStorage
 * Maps to: setItem(WORKOUTS_KEY, draft)
 */
export async function saveWorkoutsToStorage(payload: WorkoutPersistencePayload): Promise<void> {
  try {
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error('Error saving workouts to storage:', error);
    throw error;
  }
}

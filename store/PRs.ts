import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseId } from '../constants/exercises';
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
/**
 * A PR entry now tracks both the projected 1RM AND the RPE it was achieved at.
 * This lets us detect "same weight, easier effort" as a genuine improvement.
 */
export interface PREntry {
  oneRM: number; // Epley projected 1RM (kg or lbs, matches user unit pref)
  rpe: number;   // RPE at which it was achieved (1–10)
}
 
interface PRStore {
  personalRecords: Partial<Record<ExerciseId, PREntry>>;
 
  calculateEpley1RM: (weight: number, reps: number) => number;
 
  /**
   * Returns whether a new lift beats the stored record.
   *
   * Priority:
   *   1. Higher projected 1RM always wins.
   *   2. Equal 1RM but lower RPE wins — same output, less effort = better fitness.
   */
  checkIfNewPR: (
    exerciseId: ExerciseId,
    weight: number,
    reps: number,
    rpe: number
  ) => { isNewPR: boolean; calculated1RM: number };
 
  /**
   * Batch-commit session PRs to AsyncStorage on workout save.
   * Incoming map holds { [exerciseName]: PREntry }.
   * Only overwrites an existing record if the incoming value actually wins.
   */
  saveNewPRs: (newPRs: Partial<Record<string, PREntry>>) => void;
 
  clearAllPRs: () => void;
}
 
// ─── Store ────────────────────────────────────────────────────────────────────
 
export const usePRStore = create<PRStore>()(
  persist(
    (set, get) => ({
      personalRecords: {},
 
      // Epley Formula: 1RM = w × (1 + r / 30)
      calculateEpley1RM: (weight, reps) => {
        if (reps === 1) return weight;
        const raw = weight * (1 + reps / 30);
        return Math.round(raw * 10) / 10;
      },
 
      checkIfNewPR: (exerciseId, weight, reps, rpe) => {
        const calculated1RM = get().calculateEpley1RM(weight, reps);
        const stored = get().personalRecords[exerciseId];
 
        let isNewPR = false;
 
        if (!stored) {
          // No record at all — anything counts.
          isNewPR = true;
        } else if (calculated1RM > stored.oneRM) {
          // Strictly heavier projected max.
          isNewPR = true;
        } else if (calculated1RM === stored.oneRM && rpe < stored.rpe) {
          // Same projected max, achieved with less effort.
          isNewPR = true;
        }
 
        return { isNewPR, calculated1RM };
      },
 
      saveNewPRs: (newPRs) => {
        set((state) => {
          const merged = { ...state.personalRecords };
 
          for (const [key, incoming] of Object.entries(newPRs)) {
            if (!incoming) continue;
            const existing = merged[key as ExerciseId];
 
            const shouldWrite =
              !existing ||
              incoming.oneRM > existing.oneRM ||
              (incoming.oneRM === existing.oneRM && incoming.rpe < existing.rpe);
 
            if (shouldWrite) {
              merged[key as ExerciseId] = incoming;
            }
          }
 
          return { personalRecords: merged };
        });
      },
 
      clearAllPRs: () => set({ personalRecords: {} }),
    }),
    {
      name: 'fitbuddy-pr-cache',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
 
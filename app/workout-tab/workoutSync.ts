import { WorkoutPersistencePayload } from './workoutPersistence';

/**
 * Sync workouts to cloud
 * Maps to: syncToCloud(draft) -> ack
 */
export async function syncToCloud(payload: WorkoutPersistencePayload): Promise<void> {
  try {
    // TODO: Replace with actual cloud API endpoint
    const response = await fetch('https://api.example.com/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Sync failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error syncing to cloud:', error);
    throw error;
  }
}

/**
 * Fetch workouts from cloud
 * Maps to: fetchFromCloud() -> latest workouts[]
 */
export async function fetchFromCloud(): Promise<WorkoutPersistencePayload | null> {
  try {
    // TODO: Replace with actual cloud API endpoint
    const response = await fetch('https://api.example.com/workouts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    return (await response.json()) as WorkoutPersistencePayload;
  } catch (error) {
    console.error('Error fetching from cloud:', error);
    return null;
  }
}

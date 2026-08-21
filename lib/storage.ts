/**
 * Persists the shared Predictor/Simulator form state across app restarts.
 * Versioned storage key so a future shape change degrades to defaults
 * instead of crashing on `JSON.parse` of stale data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { PlannerState } from '@/lib/plannerState';

const STORAGE_KEY = '@hsrtoolbox/planner-state/v1';

function isPlannerState(value: unknown): value is PlannerState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.predictor === 'object' &&
    v.predictor !== null &&
    typeof v.simulator === 'object' &&
    v.simulator !== null &&
    ('lastPredictedPulls' in v)
  );
}

export async function loadPlannerState(): Promise<PlannerState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPlannerState(parsed) ? parsed : null;
  } catch {
    // Corrupted storage or a JSON parse failure - fall back to defaults rather than crash.
    return null;
  }
}

export async function savePlannerState(state: PlannerState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort persistence; a failed save shouldn't break the app.
  }
}

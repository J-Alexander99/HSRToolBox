/**
 * Small shared helpers for parsing and clamping the numeric text-field inputs
 * used across the Predictor and Simulator screens.
 */

import { MAX_COPIES_WANTED } from '@/lib/gacha';

/** Parses a text field to a non-negative integer, falling back to `fallback` (default 0) for anything invalid. */
export function parseNonNegativeInt(text: string, fallback = 0): number {
  const parsed = parseInt(text, 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
}

/** Clamps a pity value to a valid range for a banner with the given hard pity: [0, hardPity - 1]. */
export function clampPity(value: number, hardPity: number): number {
  return Math.min(Math.max(value, 0), hardPity - 1);
}

/** Clamps a "copies wanted" value to [0, MAX_COPIES_WANTED]. */
export function clampCopies(value: number): number {
  return Math.min(Math.max(value, 0), MAX_COPIES_WANTED);
}

/**
 * Pure gacha probability engine for Honkai Star Rail's warp (pull) system.
 *
 * Contains no React/React Native imports so it can be unit tested in isolation
 * and reused by any screen. Pity counts are "pulls since the last 5-star on
 * this banner" (0 means a 5-star was just obtained); the pull about to happen
 * is therefore pull number `pity + 1` of the current cycle.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CHARACTER_5STAR_BASE_RATE = 0.006;
export const CONE_5STAR_BASE_RATE = 0.008;

export const CHARACTER_SOFT_PITY_START = 74;
export const CONE_SOFT_PITY_START = 64;

export const CHARACTER_HARD_PITY = 90;
export const CONE_HARD_PITY = 80;

export const CHARACTER_RATEUP_CHANCE = 0.5; // the "50/50"
export const CONE_RATEUP_CHANCE = 0.75; // the "75/25"

export const SOFT_PITY_INCREMENT = 0.06;

export const SHARDS_PER_PULL = 160;

/** Long-run average pulls per 4-star drop (5.1% base rate, guaranteed by pull 10). Rough estimate, not pity-accurate. */
export const AVERAGE_PULLS_PER_FOUR_STAR = 8.7;

export const MAX_COPIES_WANTED = 10;
export const DEFAULT_SIMULATIONS = 4000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single banner's current pity state and goal. */
export interface BannerGoal {
  /** Pulls since the last 5-star drop on this banner. */
  pity: number;
  /** Whether the next 5-star on this banner is guaranteed to be the rate-up item (lost the previous coin flip). */
  guaranteed: boolean;
  /** How many copies of the rate-up item are wanted. */
  copiesWanted: number;
}

export interface SimulationInput {
  character: BannerGoal;
  lightcone: BannerGoal;
}

export interface SimulationRun {
  /** Total pulls consumed until both goals were met (or the safety cap was hit). */
  totalPulls: number;
  characterPulls: number;
  lightconePulls: number;
}

export interface ProbabilityCurvePoint {
  pulls: number;
  percent: number;
}

// ---------------------------------------------------------------------------
// Rate curve
// ---------------------------------------------------------------------------

/**
 * The chance of a 5-star on the pull about to happen, accounting for soft
 * pity. The bonus first applies exactly on `softPityStart` (e.g. pull 74 for
 * characters), not one or two pulls after it.
 */
export function fiveStarChance(
  currentPity: number,
  softPityStart: number,
  baseRate: number,
  increment: number = SOFT_PITY_INCREMENT
): number {
  const pullNumber = currentPity + 1;
  const pullsIntoSoftPity = Math.max(pullNumber - softPityStart + 1, 0);
  return baseRate + increment * pullsIntoSoftPity;
}

// ---------------------------------------------------------------------------
// Deterministic worst case (the "100%" / guaranteed stat - no simulation needed)
// ---------------------------------------------------------------------------

/**
 * The exact worst-case number of additional pulls to guarantee `copiesWanted`
 * copies of a banner's rate-up item, independent of luck. Losing the rate-up
 * coin flip guarantees the next 5-star on that banner is the rate-up item, so
 * the worst case for each copy after the first is a full two hard-pity cycles
 * (lose once, then win the guaranteed one).
 */
export function worstCasePullsForGoal(goal: BannerGoal, hardPity: number): number {
  if (goal.copiesWanted <= 0) return 0;

  const firstCopy = goal.guaranteed ? hardPity - goal.pity : hardPity - goal.pity + hardPity;
  const extraCopies = (goal.copiesWanted - 1) * 2 * hardPity;
  return firstCopy + extraCopies;
}

/** Exact worst-case total pulls to complete both goals (pulls are drawn from one shared pool). */
export function worstCaseTotalPulls(input: SimulationInput): number {
  return (
    worstCasePullsForGoal(input.character, CHARACTER_HARD_PITY) +
    worstCasePullsForGoal(input.lightcone, CONE_HARD_PITY)
  );
}

// ---------------------------------------------------------------------------
// Monte Carlo simulation
// ---------------------------------------------------------------------------

/**
 * Simulates one warp session: pulls are spent one at a time, allocated
 * greedily toward whichever goal (character or light cone copies) is
 * proportionally further from completion, until both goals are met or
 * `pullCap` pulls have been spent. `pullCap` is a safety bound only - when
 * called with `worstCaseTotalPulls(input)` (the default via `simulateBatch`)
 * every run is mathematically guaranteed to finish before the cap binds.
 */
export function simulateRun(input: SimulationInput, pullCap: number): SimulationRun {
  const { character, lightcone } = input;

  let charSuccesses = 0;
  let coneSuccesses = 0;
  let currCharPity = character.pity;
  let currConePity = lightcone.pity;
  let currCharacterGuaranteed = character.guaranteed;
  let currConeGuaranteed = lightcone.guaranteed;

  let pullsSpent = 0;
  let characterPulls = 0;
  let lightconePulls = 0;

  while (
    pullsSpent < pullCap &&
    (charSuccesses < character.copiesWanted || coneSuccesses < lightcone.copiesWanted)
  ) {
    let pullingCharacter: boolean;

    if (charSuccesses < character.copiesWanted && coneSuccesses < lightcone.copiesWanted) {
      pullingCharacter = character.copiesWanted - charSuccesses >= lightcone.copiesWanted - coneSuccesses;
    } else {
      pullingCharacter = charSuccesses < character.copiesWanted;
    }

    const randomValue = Math.random();

    if (pullingCharacter) {
      const chance = fiveStarChance(currCharPity, CHARACTER_SOFT_PITY_START, CHARACTER_5STAR_BASE_RATE);

      if (randomValue < chance || currCharPity + 1 === CHARACTER_HARD_PITY) {
        if (currCharacterGuaranteed || Math.random() < CHARACTER_RATEUP_CHANCE) {
          charSuccesses++;
          currCharacterGuaranteed = false;
        } else {
          currCharacterGuaranteed = true;
        }
        currCharPity = 0;
      } else {
        currCharPity++;
      }
      characterPulls++;
    } else {
      const chance = fiveStarChance(currConePity, CONE_SOFT_PITY_START, CONE_5STAR_BASE_RATE);

      if (randomValue < chance || currConePity + 1 === CONE_HARD_PITY) {
        if (currConeGuaranteed || Math.random() < CONE_RATEUP_CHANCE) {
          coneSuccesses++;
          currConeGuaranteed = false;
        } else {
          currConeGuaranteed = true;
        }
        currConePity = 0;
      } else {
        currConePity++;
      }
      lightconePulls++;
    }

    pullsSpent++;
  }

  return { totalPulls: pullsSpent, characterPulls, lightconePulls };
}

export function simulateBatch(
  input: SimulationInput,
  numSimulations: number = DEFAULT_SIMULATIONS,
  pullCap: number = worstCaseTotalPulls(input)
): SimulationRun[] {
  const runs: SimulationRun[] = [];
  for (let i = 0; i < numSimulations; i++) {
    runs.push(simulateRun(input, pullCap));
  }
  return runs;
}

/** Sorted-ascending `totalPulls` across a batch, used as a CDF lookup table by the stats below. */
export function toSortedCdf(runs: SimulationRun[]): number[] {
  return runs.map((r) => r.totalPulls).sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// CDF-derived statistics
// ---------------------------------------------------------------------------

/** Percentage (0-100) of simulated runs that completed within `pulls` pulls. */
export function probabilityAtPulls(sortedCdf: number[], pulls: number): number {
  if (sortedCdf.length === 0) return 0;

  // Binary search for the first index where totalPulls > pulls; that index
  // is also the count of runs that finished at or before `pulls`.
  let lo = 0;
  let hi = sortedCdf.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sortedCdf[mid] <= pulls) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return (lo / sortedCdf.length) * 100;
}

/** The smallest pull count at which at least `targetPercent`% of runs had succeeded. */
export function pullsForConfidence(sortedCdf: number[], targetPercent: number): number {
  if (sortedCdf.length === 0) return 0;

  const targetIndex = Math.ceil((targetPercent / 100) * sortedCdf.length) - 1;
  const clampedIndex = Math.min(Math.max(targetIndex, 0), sortedCdf.length - 1);
  return sortedCdf[clampedIndex];
}

/** Samples the probability-vs-pulls curve from 0 to `maxPulls`, inclusive of both endpoints. */
export function buildProbabilityCurve(
  sortedCdf: number[],
  maxPulls: number,
  step: number = Math.max(1, Math.round(maxPulls / 40))
): ProbabilityCurvePoint[] {
  const points: ProbabilityCurvePoint[] = [];
  for (let pulls = 0; pulls < maxPulls; pulls += step) {
    points.push({ pulls, percent: probabilityAtPulls(sortedCdf, pulls) });
  }
  points.push({ pulls: maxPulls, percent: probabilityAtPulls(sortedCdf, maxPulls) });
  return points;
}

export function meanPulls(sortedCdf: number[]): number {
  if (sortedCdf.length === 0) return 0;
  const sum = sortedCdf.reduce((acc, v) => acc + v, 0);
  return sum / sortedCdf.length;
}

export function medianPulls(sortedCdf: number[]): number {
  if (sortedCdf.length === 0) return 0;
  const mid = Math.floor(sortedCdf.length / 2);
  return sortedCdf.length % 2 === 0 ? (sortedCdf[mid - 1] + sortedCdf[mid]) / 2 : sortedCdf[mid];
}

/** Rough long-run estimate of 4-star drops obtained over a number of pulls. Not pity-accurate. */
export function estimatedFourStarCount(additionalPulls: number): number {
  return additionalPulls / AVERAGE_PULLS_PER_FOUR_STAR;
}

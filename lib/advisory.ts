/**
 * Turns a simulation's probability curve into plain-English pulling advice -
 * e.g. "pulling to N gives you ~92%; beyond that, returns diminish; if you
 * haven't won by then, save for the next banner". Pure module, no
 * React/React Native imports; the UI renders the structured `AdvisoryResult`
 * directly and/or the single formatted string.
 */

import {
  CHARACTER_HARD_PITY,
  CHARACTER_SOFT_PITY_START,
  CONE_HARD_PITY,
  CONE_SOFT_PITY_START,
  probabilityAtPulls,
  pullsForConfidence,
  SimulationInput,
  worstCaseTotalPulls,
} from '@/lib/gacha';

export interface AdvisoryResult {
  softPityStartsAtPull: { character: number; lightcone: number };
  hardPityAtPull: { character: number; lightcone: number };
  /** The exact "100%" pull count - see `worstCaseTotalPulls`. */
  guaranteedPulls: number;
  /** The point past which extra pulls stop meaningfully improving the odds, or null if no such point exists in range. */
  diminishingReturns: { pulls: number; percent: number } | null;
  confidenceTiers: { percent: number; pulls: number }[];
}

const STEP = 10;

export function buildAdvisory(
  sortedCdf: number[],
  input: SimulationInput,
  confidenceLevels: number[] = [90, 95, 99],
  marginalThresholdPercentPer10Pulls = 2.5
): AdvisoryResult {
  const guaranteedPulls = worstCaseTotalPulls(input);

  const confidenceTiers = confidenceLevels.map((percent) => ({
    percent,
    pulls: pullsForConfidence(sortedCdf, percent),
  }));

  const diminishingReturns = findDiminishingReturns(sortedCdf, guaranteedPulls, marginalThresholdPercentPer10Pulls);

  return {
    softPityStartsAtPull: { character: CHARACTER_SOFT_PITY_START, lightcone: CONE_SOFT_PITY_START },
    hardPityAtPull: { character: CHARACTER_HARD_PITY, lightcone: CONE_HARD_PITY },
    guaranteedPulls,
    diminishingReturns,
    confidenceTiers,
  };
}

/**
 * Walks the curve in 10-pull steps, starting after cumulative probability
 * first exceeds 50% (to skip the near-flat pre-soft-pity region, where
 * "gain below threshold" is trivially true but not a meaningful signal), and
 * returns the first point where the next 10 pulls add less than the
 * threshold. Returns null for a trivial goal (nothing wanted, or the curve
 * never exceeds 50% within the guaranteed pull count).
 */
function findDiminishingReturns(
  sortedCdf: number[],
  maxPulls: number,
  marginalThresholdPercentPer10Pulls: number
): { pulls: number; percent: number } | null {
  if (sortedCdf.length === 0 || maxPulls <= 0) return null;

  let pulls = STEP;
  while (pulls < maxPulls && probabilityAtPulls(sortedCdf, pulls) < 50) {
    pulls += STEP;
  }

  while (pulls < maxPulls) {
    const current = probabilityAtPulls(sortedCdf, pulls);
    const next = probabilityAtPulls(sortedCdf, pulls + STEP);
    if (next - current < marginalThresholdPercentPer10Pulls) {
      return { pulls, percent: current };
    }
    pulls += STEP;
  }

  return null;
}

/** Renders an `AdvisoryResult` as a short paragraph of plain-English guidance. */
export function formatRecommendation(advisory: AdvisoryResult): string {
  const { softPityStartsAtPull, guaranteedPulls, diminishingReturns, confidenceTiers } = advisory;

  const parts: string[] = [
    `Soft pity begins at pull ${softPityStartsAtPull.character} for characters (${softPityStartsAtPull.lightcone} for light cones).`,
  ];

  if (diminishingReturns) {
    parts.push(
      `Pulling to ${diminishingReturns.pulls} gives you roughly a ${Math.round(diminishingReturns.percent)}% chance - beyond that, extra pulls add little.`
    );
    parts.push(
      `Guaranteed success is reached at ${guaranteedPulls} pulls. If you haven't won by pull ${diminishingReturns.pulls}, consider banking your jade for the next banner instead.`
    );
  } else {
    const highConfidence = confidenceTiers[confidenceTiers.length - 1];
    if (highConfidence) {
      parts.push(
        `A ${highConfidence.percent}% chance is reached at ${highConfidence.pulls} pulls; guaranteed success is reached at ${guaranteedPulls} pulls.`
      );
    } else {
      parts.push(`Guaranteed success is reached at ${guaranteedPulls} pulls.`);
    }
  }

  return parts.join(' ');
}

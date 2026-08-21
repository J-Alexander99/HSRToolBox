/**
 * GBP cost estimates for closing an Oneiric Shard shortfall via one-off
 * top-up purchases. Pure module, no React/React Native imports.
 *
 * Deliberately excludes the Express Supply Pass / Nameless Glory (battle
 * pass) subscriptions - those are already reflected in the Predictor
 * screen's "paid user" multiplier, and mixing them in here would double
 * count their value.
 */

import { SHARDS_PER_PULL } from '@/lib/gacha';

export interface ShardPackage {
  id: string;
  baseShards: number;
  bonusShards: number;
  shards: number;
  priceGBP: number;
}

// Approximate UK pricing for Honkai Star Rail's one-off Oneiric Shard top-ups.
// PLACEHOLDER VALUES - verify against the live in-game shop before shipping;
// exact prices differ slightly by platform (iOS/Android/web) and drift over time.
export const SHARD_PACKAGES: ShardPackage[] = [
  { id: 'p60', baseShards: 60, bonusShards: 0, shards: 60, priceGBP: 0.79 },
  { id: 'p330', baseShards: 300, bonusShards: 30, shards: 330, priceGBP: 3.99 },
  { id: 'p1090', baseShards: 980, bonusShards: 110, shards: 1090, priceGBP: 7.99 },
  { id: 'p2240', baseShards: 1980, bonusShards: 260, shards: 2240, priceGBP: 15.99 },
  { id: 'p3880', baseShards: 3280, bonusShards: 600, shards: 3880, priceGBP: 39.99 },
  { id: 'p8080', baseShards: 6480, bonusShards: 1600, shards: 8080, priceGBP: 79.99 },
];

export interface TopUpBreakdownItem {
  packageId: string;
  count: number;
}

export interface TopUpResult {
  totalCostGBP: number;
  breakdown: TopUpBreakdownItem[];
}

// Guard against pathological input blowing up the DP array; falls back to a
// simple greedy estimate above this size (not expected in practice given the
// app clamps copies-wanted to a sane range).
const MAX_DP_SHORTFALL = 200_000;

/**
 * The cheapest combination of packages that covers at least `shortfall`
 * shards. Uses a small "at least i" coin-change DP rather than greedy,
 * since the real package tiers aren't regular enough for greedy to be
 * guaranteed optimal.
 */
export function cheapestTopUp(shortfall: number, packages: ShardPackage[] = SHARD_PACKAGES): TopUpResult | null {
  if (shortfall <= 0) return { totalCostGBP: 0, breakdown: [] };
  if (packages.length === 0) return null;

  if (shortfall > MAX_DP_SHORTFALL) {
    return greedyTopUp(shortfall, packages);
  }

  // dp[i] = cheapest cost (GBP) to cover at least i shards.
  const dp = new Array<number>(shortfall + 1).fill(Infinity);
  const choice = new Array<number>(shortfall + 1).fill(-1); // index into `packages` used to reach dp[i]
  dp[0] = 0;

  for (let i = 1; i <= shortfall; i++) {
    for (let p = 0; p < packages.length; p++) {
      const pkg = packages[p];
      const remaining = Math.max(0, i - pkg.shards);
      const cost = dp[remaining] + pkg.priceGBP;
      if (cost < dp[i]) {
        dp[i] = cost;
        choice[i] = p;
      }
    }
  }

  const counts = new Map<string, number>();
  let remaining = shortfall;
  while (remaining > 0) {
    const p = choice[remaining];
    if (p === -1) break; // unreachable as long as at least one package is passed in
    const pkg = packages[p];
    counts.set(pkg.id, (counts.get(pkg.id) ?? 0) + 1);
    remaining = Math.max(0, remaining - pkg.shards);
  }

  return {
    totalCostGBP: Math.round(dp[shortfall] * 100) / 100,
    breakdown: Array.from(counts.entries()).map(([packageId, count]) => ({ packageId, count })),
  };
}

/** Simple greedy fallback for pathologically large shortfalls, avoiding an oversized DP array. */
function greedyTopUp(shortfall: number, packages: ShardPackage[]): TopUpResult {
  const best = [...packages].sort((a, b) => a.priceGBP / a.shards - b.priceGBP / b.shards)[0];
  const count = Math.ceil(shortfall / best.shards);
  return {
    totalCostGBP: Math.round(count * best.priceGBP * 100) / 100,
    breakdown: [{ packageId: best.id, count }],
  };
}

/**
 * How many Oneiric Shards are still needed to afford `desiredPulls`, after
 * accounting for pulls and Stellar Jade already owned. Starlight is
 * intentionally excluded - it's an exchange-shop currency, not a direct
 * pull currency, so folding it into a real-money figure would compound one
 * approximation on top of another.
 */
export function shardShortfall(desiredPulls: number, ownedPulls: number, ownedStellarJade: number): number {
  const shardsNeeded = desiredPulls * SHARDS_PER_PULL;
  const shardsAvailable = ownedPulls * SHARDS_PER_PULL + ownedStellarJade;
  return Math.max(0, shardsNeeded - shardsAvailable);
}

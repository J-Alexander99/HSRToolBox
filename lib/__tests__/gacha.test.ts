import {
  BannerGoal,
  CHARACTER_5STAR_BASE_RATE,
  CHARACTER_HARD_PITY,
  CHARACTER_SOFT_PITY_START,
  CONE_5STAR_BASE_RATE,
  CONE_HARD_PITY,
  CONE_SOFT_PITY_START,
  SOFT_PITY_INCREMENT,
  SimulationInput,
  buildProbabilityCurve,
  fiveStarChance,
  probabilityAtPulls,
  pullsForConfidence,
  simulateBatch,
  toSortedCdf,
  worstCasePullsForGoal,
  worstCaseTotalPulls,
} from '@/lib/gacha';

function goal(overrides: Partial<BannerGoal> = {}): BannerGoal {
  return { pity: 0, guaranteed: false, copiesWanted: 0, ...overrides };
}

describe('fiveStarChance (soft pity boundary)', () => {
  it('stays at the base rate before soft pity starts', () => {
    // pity=72 -> about to attempt pull 73, still below the 74th-pull threshold.
    expect(fiveStarChance(72, CHARACTER_SOFT_PITY_START, CHARACTER_5STAR_BASE_RATE)).toBeCloseTo(
      CHARACTER_5STAR_BASE_RATE
    );
  });

  it('applies exactly one increment on the named threshold pull (character: pull 74)', () => {
    // pity=73 -> about to attempt pull 74, the named soft-pity start.
    expect(fiveStarChance(73, CHARACTER_SOFT_PITY_START, CHARACTER_5STAR_BASE_RATE)).toBeCloseTo(
      CHARACTER_5STAR_BASE_RATE + SOFT_PITY_INCREMENT
    );
  });

  it('applies exactly one increment on the named threshold pull (cone: pull 64)', () => {
    expect(fiveStarChance(63, CONE_SOFT_PITY_START, CONE_5STAR_BASE_RATE)).toBeCloseTo(
      CONE_5STAR_BASE_RATE + SOFT_PITY_INCREMENT
    );
  });

  it('increments linearly for each pull past soft pity', () => {
    // pity=88 -> about to attempt pull 89, which is 16 pulls into soft pity (74..89).
    expect(fiveStarChance(88, CHARACTER_SOFT_PITY_START, CHARACTER_5STAR_BASE_RATE)).toBeCloseTo(
      CHARACTER_5STAR_BASE_RATE + SOFT_PITY_INCREMENT * 16
    );
  });
});

describe('worstCasePullsForGoal', () => {
  it('is 0 when no copies are wanted', () => {
    expect(worstCasePullsForGoal(goal({ copiesWanted: 0 }), CHARACTER_HARD_PITY)).toBe(0);
  });

  it('is hardPity - pity for a single already-guaranteed copy', () => {
    expect(worstCasePullsForGoal(goal({ copiesWanted: 1, guaranteed: true, pity: 10 }), CHARACTER_HARD_PITY)).toBe(
      CHARACTER_HARD_PITY - 10
    );
  });

  it('is two hard-pity cycles for a single non-guaranteed copy from 0 pity', () => {
    expect(worstCasePullsForGoal(goal({ copiesWanted: 1, guaranteed: false, pity: 0 }), CHARACTER_HARD_PITY)).toBe(
      2 * CHARACTER_HARD_PITY
    );
  });

  it('adds two full hard-pity cycles per additional copy beyond the first', () => {
    expect(worstCasePullsForGoal(goal({ copiesWanted: 3, guaranteed: false, pity: 0 }), CHARACTER_HARD_PITY)).toBe(
      2 * CHARACTER_HARD_PITY + 2 * 2 * CHARACTER_HARD_PITY
    );
  });

  it('handles pity already at the door', () => {
    expect(
      worstCasePullsForGoal(goal({ copiesWanted: 1, guaranteed: true, pity: CHARACTER_HARD_PITY - 1 }), CHARACTER_HARD_PITY)
    ).toBe(1);
  });
});

describe('worstCaseTotalPulls', () => {
  it('is 0 when neither banner wants any copies', () => {
    const input: SimulationInput = { character: goal(), lightcone: goal() };
    expect(worstCaseTotalPulls(input)).toBe(0);
  });

  it('sums the two banners independently', () => {
    const input: SimulationInput = {
      character: goal({ copiesWanted: 1, guaranteed: true, pity: 0 }),
      lightcone: goal({ copiesWanted: 1, guaranteed: true, pity: 0 }),
    };
    expect(worstCaseTotalPulls(input)).toBe(CHARACTER_HARD_PITY + CONE_HARD_PITY);
  });
});

describe('simulateBatch / toSortedCdf (statistical invariants)', () => {
  it('never exceeds the deterministic worst case', () => {
    const input: SimulationInput = {
      character: goal({ copiesWanted: 2, guaranteed: false, pity: 40 }),
      lightcone: goal({ copiesWanted: 1, guaranteed: false, pity: 20 }),
    };
    const cap = worstCaseTotalPulls(input);
    const runs = simulateBatch(input, 500, cap);

    for (const run of runs) {
      expect(run.totalPulls).toBeLessThanOrEqual(cap);
    }
  });

  it('reaches 100% probability by the guaranteed pull count', () => {
    const input: SimulationInput = {
      character: goal({ copiesWanted: 1, guaranteed: false, pity: 0 }),
      lightcone: goal(),
    };
    const cap = worstCaseTotalPulls(input);
    const cdf = toSortedCdf(simulateBatch(input, 2000, cap));

    expect(probabilityAtPulls(cdf, cap)).toBe(100);
  });

  it('is near 100% well within a single hard-pity cycle for a single guaranteed copy', () => {
    const input: SimulationInput = {
      character: goal({ copiesWanted: 1, guaranteed: true, pity: 0 }),
      lightcone: goal(),
    };
    const cdf = toSortedCdf(simulateBatch(input, 2000, worstCaseTotalPulls(input)));

    expect(probabilityAtPulls(cdf, CHARACTER_HARD_PITY)).toBe(100);
  });
});

describe('probabilityAtPulls / buildProbabilityCurve monotonicity', () => {
  const input: SimulationInput = {
    character: goal({ copiesWanted: 2, guaranteed: false, pity: 30 }),
    lightcone: goal({ copiesWanted: 1, guaranteed: false, pity: 10 }),
  };
  const cap = worstCaseTotalPulls(input);
  const cdf = toSortedCdf(simulateBatch(input, 2000, cap));

  it('is 0 at 0 pulls when copies are wanted', () => {
    expect(probabilityAtPulls(cdf, 0)).toBe(0);
  });

  it('is non-decreasing as pulls increase', () => {
    const curve = buildProbabilityCurve(cdf, cap, Math.max(1, Math.round(cap / 20)));
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].percent).toBeGreaterThanOrEqual(curve[i - 1].percent);
    }
  });

  it('reaches the requested max pulls as its final point', () => {
    const curve = buildProbabilityCurve(cdf, cap, 25);
    expect(curve[curve.length - 1].pulls).toBe(cap);
  });
});

describe('pullsForConfidence', () => {
  it('round-trips with probabilityAtPulls at or above the target', () => {
    const input: SimulationInput = {
      character: goal({ copiesWanted: 1, guaranteed: false, pity: 0 }),
      lightcone: goal(),
    };
    const cdf = toSortedCdf(simulateBatch(input, 3000, worstCaseTotalPulls(input)));

    for (const target of [50, 90, 95, 99]) {
      const pulls = pullsForConfidence(cdf, target);
      expect(probabilityAtPulls(cdf, pulls)).toBeGreaterThanOrEqual(target);
    }
  });

  it('produces non-decreasing pull counts for increasing confidence levels', () => {
    const input: SimulationInput = {
      character: goal({ copiesWanted: 2, guaranteed: false, pity: 20 }),
      lightcone: goal(),
    };
    const cdf = toSortedCdf(simulateBatch(input, 3000, worstCaseTotalPulls(input)));

    const p90 = pullsForConfidence(cdf, 90);
    const p95 = pullsForConfidence(cdf, 95);
    const p99 = pullsForConfidence(cdf, 99);

    expect(p95).toBeGreaterThanOrEqual(p90);
    expect(p99).toBeGreaterThanOrEqual(p95);
  });
});

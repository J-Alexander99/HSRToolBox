import { buildAdvisory, formatRecommendation } from '@/lib/advisory';
import { BannerGoal, SimulationInput, simulateBatch, toSortedCdf, worstCaseTotalPulls } from '@/lib/gacha';

function goal(overrides: Partial<BannerGoal> = {}): BannerGoal {
  return { pity: 0, guaranteed: false, copiesWanted: 0, ...overrides };
}

describe('buildAdvisory', () => {
  it('reports guaranteedPulls matching worstCaseTotalPulls', () => {
    const input: SimulationInput = {
      character: goal({ copiesWanted: 1, guaranteed: false, pity: 20 }),
      lightcone: goal(),
    };
    const cdf = toSortedCdf(simulateBatch(input, 1500, worstCaseTotalPulls(input)));
    const advisory = buildAdvisory(cdf, input);

    expect(advisory.guaranteedPulls).toBe(worstCaseTotalPulls(input));
  });

  it('produces non-decreasing pull counts across increasing confidence levels', () => {
    const input: SimulationInput = {
      character: goal({ copiesWanted: 2, guaranteed: false, pity: 10 }),
      lightcone: goal({ copiesWanted: 1, guaranteed: false, pity: 5 }),
    };
    const cdf = toSortedCdf(simulateBatch(input, 1500, worstCaseTotalPulls(input)));
    const advisory = buildAdvisory(cdf, input, [90, 95, 99]);

    const pulls = advisory.confidenceTiers.map((t) => t.pulls);
    expect(pulls[0]).toBeLessThanOrEqual(pulls[1]);
    expect(pulls[1]).toBeLessThanOrEqual(pulls[2]);
  });

  it('has no diminishing-returns point and no guaranteed pulls for a trivial goal', () => {
    const input: SimulationInput = { character: goal(), lightcone: goal() };
    const cdf = toSortedCdf(simulateBatch(input, 100, worstCaseTotalPulls(input)));
    const advisory = buildAdvisory(cdf, input);

    expect(advisory.guaranteedPulls).toBe(0);
    expect(advisory.diminishingReturns).toBeNull();
  });
});

describe('formatRecommendation', () => {
  it('mentions the guaranteed pull count', () => {
    const input: SimulationInput = {
      character: goal({ copiesWanted: 1, guaranteed: true, pity: 0 }),
      lightcone: goal(),
    };
    const cdf = toSortedCdf(simulateBatch(input, 1500, worstCaseTotalPulls(input)));
    const advisory = buildAdvisory(cdf, input);
    const text = formatRecommendation(advisory);

    expect(text).toContain(String(advisory.guaranteedPulls));
    expect(text.length).toBeGreaterThan(0);
  });
});

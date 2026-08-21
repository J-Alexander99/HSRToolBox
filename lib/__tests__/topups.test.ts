import { ShardPackage, cheapestTopUp, shardShortfall } from '@/lib/topups';
import { SHARDS_PER_PULL } from '@/lib/gacha';

// Small hand-checkable fixture, deliberately not the real package list, so
// the expected cheapest combination can be verified by hand.
const FIXTURE_PACKAGES: ShardPackage[] = [
  { id: 'small', baseShards: 10, bonusShards: 0, shards: 10, priceGBP: 1.5 },
  { id: 'big', baseShards: 60, bonusShards: 0, shards: 60, priceGBP: 5 },
];

describe('cheapestTopUp', () => {
  it('costs nothing for a zero or negative shortfall', () => {
    expect(cheapestTopUp(0, FIXTURE_PACKAGES)).toEqual({ totalCostGBP: 0, breakdown: [] });
    expect(cheapestTopUp(-5, FIXTURE_PACKAGES)).toEqual({ totalCostGBP: 0, breakdown: [] });
  });

  it('picks a single package when it exactly covers the shortfall', () => {
    const result = cheapestTopUp(60, FIXTURE_PACKAGES);
    expect(result).toEqual({ totalCostGBP: 5, breakdown: [{ packageId: 'big', count: 1 }] });
  });

  it('picks the genuinely cheapest combination, not just the fewest packages', () => {
    // Covering >=65 shards: 1 big + 1 small = 70 shards for £6.50, cheaper than
    // either 2 big (£10) or 7 small (£10.50).
    const result = cheapestTopUp(65, FIXTURE_PACKAGES);
    expect(result?.totalCostGBP).toBeCloseTo(6.5);
    expect(result?.breakdown).toEqual(
      expect.arrayContaining([
        { packageId: 'big', count: 1 },
        { packageId: 'small', count: 1 },
      ])
    );
  });

  it('returns null when no packages are available', () => {
    expect(cheapestTopUp(100, [])).toBeNull();
  });
});

describe('shardShortfall', () => {
  it('is 0 when owned currency fully covers the desired pulls', () => {
    expect(shardShortfall(10, 10, 0)).toBe(0);
    expect(shardShortfall(10, 0, 10 * SHARDS_PER_PULL)).toBe(0);
  });

  it('returns the correct remainder for partial coverage', () => {
    // 10 pulls needed = 1600 shards; own 5 pulls (800 shards) + 200 loose shards = 1000 owned.
    expect(shardShortfall(10, 5, 200)).toBe(10 * SHARDS_PER_PULL - (5 * SHARDS_PER_PULL + 200));
  });

  it('never goes negative when overfunded', () => {
    expect(shardShortfall(1, 100, 0)).toBe(0);
  });
});

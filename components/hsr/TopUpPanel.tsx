import { StyleSheet, Text, View } from 'react-native';

import { AngledPanel } from '@/components/hsr/AngledPanel';
import { HSRColors, HSRFonts } from '@/constants/theme';
import { SHARD_PACKAGES, ShardPackage, TopUpResult } from '@/lib/topups';

type Props = {
  shortfall: number;
  result: TopUpResult | null;
  packages?: ShardPackage[];
};

/** Renders the cheapest-combination top-up breakdown for a shard shortfall, in GBP. */
export function TopUpPanel({ shortfall, result, packages = SHARD_PACKAGES }: Props) {
  const packageById = new Map(packages.map((p) => [p.id, p]));

  return (
    <AngledPanel cut={12} fill={HSRColors.bg2} borderColor={HSRColors.borderSubtle} style={styles.panel}>
      <Text style={styles.label}>Top-Up Cost</Text>

      {shortfall <= 0 || !result || result.breakdown.length === 0 ? (
        <Text style={styles.freeText}>You already have enough saved - no top-up needed.</Text>
      ) : (
        <>
          {result.breakdown.map((item) => {
            const pkg = packageById.get(item.packageId);
            if (!pkg) return null;
            return (
              <View key={item.packageId} style={styles.row}>
                <Text style={styles.rowLabel}>
                  {item.count} × {pkg.shards.toLocaleString()} Shards
                </Text>
                <Text style={styles.rowValue}>£{(pkg.priceGBP * item.count).toFixed(2)}</Text>
              </View>
            );
          })}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>£{result.totalCostGBP.toFixed(2)}</Text>
          </View>
        </>
      )}

      <Text style={styles.caption}>
        Shortfall: {shortfall.toLocaleString()} shards. Prices are approximate UK estimates - check the in-game shop
        for current pricing.
      </Text>
    </AngledPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 16,
    gap: 8,
  },
  label: {
    fontFamily: HSRFonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HSRColors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontFamily: HSRFonts.body,
    fontSize: 13,
    color: HSRColors.textSecondary,
  },
  rowValue: {
    fontFamily: HSRFonts.bodySemibold,
    fontSize: 13,
    color: HSRColors.textPrimary,
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: HSRColors.borderSubtle,
  },
  totalLabel: {
    fontFamily: HSRFonts.bodyBold,
    fontSize: 14,
    color: HSRColors.textPrimary,
  },
  totalValue: {
    fontFamily: HSRFonts.displayBold,
    fontSize: 18,
    color: HSRColors.goldBright,
  },
  freeText: {
    fontFamily: HSRFonts.bodyMedium,
    fontSize: 13,
    color: HSRColors.jadeBright,
  },
  caption: {
    fontFamily: HSRFonts.body,
    fontSize: 11,
    color: HSRColors.textTertiary,
    marginTop: 4,
  },
});

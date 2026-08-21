import { StyleSheet, Text, View } from 'react-native';

import { AngledPanel } from '@/components/hsr/AngledPanel';
import { HSRColors, HSRFonts } from '@/constants/theme';
import { AdvisoryResult, formatRecommendation } from '@/lib/advisory';

type Props = {
  advisory: AdvisoryResult;
};

/** Renders an `AdvisoryResult` as a headline recommendation plus the supporting facts it was built from. */
export function AdvisoryPanel({ advisory }: Props) {
  const bullets = [
    `Soft pity starts at pull ${advisory.softPityStartsAtPull.character} for characters, ${advisory.softPityStartsAtPull.lightcone} for light cones.`,
    `Hard pity guarantees a 5★ by pull ${advisory.hardPityAtPull.character} (character) / ${advisory.hardPityAtPull.lightcone} (light cone).`,
    ...advisory.confidenceTiers.map((t) => `${t.percent}% chance reached by ${t.pulls} pulls.`),
    `100% guaranteed by ${advisory.guaranteedPulls} pulls (worst case).`,
  ];

  return (
    <AngledPanel cut={14} fill={HSRColors.bg2} borderColor={HSRColors.borderGold} style={styles.panel}>
      <Text style={styles.label}>Advice</Text>
      <Text style={styles.headline}>{formatRecommendation(advisory)}</Text>
      <View style={styles.bullets}>
        {bullets.map((b) => (
          <View key={b} style={styles.bulletRow}>
            <View style={styles.dot} />
            <Text style={styles.bulletText}>{b}</Text>
          </View>
        ))}
      </View>
    </AngledPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 18,
    gap: 12,
  },
  label: {
    fontFamily: HSRFonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HSRColors.gold,
  },
  headline: {
    fontFamily: HSRFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: HSRColors.textPrimary,
  },
  bullets: {
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: HSRColors.textTertiary,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontFamily: HSRFonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: HSRColors.textSecondary,
  },
});

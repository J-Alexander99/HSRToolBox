import { StyleSheet, Text } from 'react-native';

import { AngledPanel } from '@/components/hsr/AngledPanel';
import { HSRColors, HSRFonts } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  caption?: string;
  accentColor?: string;
};

/** A small angular stat card - used for the confidence-tier / guaranteed-pulls readouts. */
export function StatTile({ label, value, caption, accentColor = HSRColors.primaryBright }: Props) {
  return (
    <AngledPanel cut={8} fill={HSRColors.bg2} borderColor={HSRColors.borderSubtle} style={styles.panel}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {!!caption && <Text style={styles.caption}>{caption}</Text>}
    </AngledPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    minWidth: 100,
    padding: 14,
    gap: 4,
  },
  label: {
    fontFamily: HSRFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: HSRColors.textSecondary,
  },
  value: {
    fontFamily: HSRFonts.displayBold,
    fontSize: 24,
    lineHeight: 28,
  },
  caption: {
    fontFamily: HSRFonts.body,
    fontSize: 11,
    color: HSRColors.textTertiary,
  },
});

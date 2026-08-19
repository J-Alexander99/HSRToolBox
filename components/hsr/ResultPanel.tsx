import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AngledPanel } from '@/components/hsr/AngledPanel';
import { CornerBrackets } from '@/components/hsr/CornerBrackets';
import { HSRColors, HSRFonts } from '@/constants/theme';

type Props = PropsWithChildren<{
  label: string;
  visible: boolean;
}>;

/** The angular result card shown after a Predict / Simulate action, with corner accents. */
export function ResultPanel({ label, visible, children }: Props) {
  if (!visible) return null;

  return (
    <Animated.View entering={FadeInDown.duration(420).springify().damping(16)}>
      <AngledPanel cut={14} fill={HSRColors.bg2} borderColor={HSRColors.borderSubtle} style={styles.panel}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <CornerBrackets size={16} />
        </View>
        <Text style={styles.label}>{label}</Text>
        {children}
      </AngledPanel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 22,
    alignItems: 'center',
  },
  label: {
    fontFamily: HSRFonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HSRColors.textSecondary,
    marginBottom: 8,
  },
});

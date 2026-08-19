import { StyleSheet, View } from 'react-native';

import { HSRColors } from '@/constants/theme';

/** Small gold L-shaped accents in the top-left and bottom-right corners of a container. */
export function CornerBrackets({ size = 16, color = HSRColors.gold }: { size?: number; color?: string }) {
  return (
    <>
      <View
        pointerEvents="none"
        style={[styles.bracket, { width: size, height: size, borderTopWidth: 2, borderLeftWidth: 2, borderColor: color, top: -1, left: -1 }]}
      />
      <View
        pointerEvents="none"
        style={[styles.bracket, { width: size, height: size, borderBottomWidth: 2, borderRightWidth: 2, borderColor: color, bottom: -1, right: -1 }]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bracket: {
    position: 'absolute',
  },
});

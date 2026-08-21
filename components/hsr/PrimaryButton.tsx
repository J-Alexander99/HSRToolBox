import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AngledPanel } from '@/components/hsr/AngledPanel';
import { HSRColors, HSRFonts } from '@/constants/theme';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.6 : 1,
  }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        if (disabled) return;
        scale.value = withSpring(0.96, { damping: 14, stiffness: 300 });
      }}
      onPressOut={() => {
        if (disabled) return;
        scale.value = withSpring(1, { damping: 10, stiffness: 220 });
      }}
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <Animated.View style={style}>
        <AngledPanel
          cut={12}
          gradient={[HSRColors.primary, HSRColors.primaryDim]}
          borderColor={HSRColors.borderGold}
          borderWidth={1}
          style={styles.button}
        >
          <Text style={styles.label}>{label}</Text>
        </AngledPanel>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: HSRColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.45,
    elevation: 6,
  },
  label: {
    fontFamily: HSRFonts.displayBold,
    fontSize: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: HSRColors.textPrimary,
  },
});

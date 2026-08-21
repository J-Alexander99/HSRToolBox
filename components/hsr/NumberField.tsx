import { forwardRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { AngledPanel } from '@/components/hsr/AngledPanel';
import { HSRColors, HSRFonts } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  /** When set, the value is clamped into [min, max] on blur (only if both are provided). */
  min?: number;
  max?: number;
};

export const NumberField = forwardRef<RNTextInput, Props>(function NumberField(
  { label, value, onChangeText, placeholder, returnKeyType = 'next', onSubmitEditing, blurOnSubmit, min, max },
  ref
) {
  const [focused, setFocused] = useState(false);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: withTiming(focused ? 0.55 : 0, { duration: 200 }),
  }));

  const handleBlur = () => {
    setFocused(false);
    if (min === undefined || max === undefined || value === '') return;
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.min(Math.max(parsed, min), max);
    if (clamped !== parsed) onChangeText(String(clamped));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.glow, glowStyle]}>
        <AngledPanel
          cut={8}
          fill={HSRColors.bg3}
          borderColor={focused ? HSRColors.primaryBright : HSRColors.borderSubtle}
          borderWidth={focused ? 1.5 : 1}
        >
          <TextInput
            ref={ref}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            placeholder={placeholder}
            placeholderTextColor={HSRColors.placeholder}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={blurOnSubmit}
            onFocus={() => setFocused(true)}
            onBlur={handleBlur}
          />
        </AngledPanel>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontFamily: HSRFonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: HSRColors.textSecondary,
    marginBottom: 7,
  },
  glow: {
    shadowColor: HSRColors.primaryBright,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: HSRFonts.body,
    fontSize: 15,
    color: HSRColors.textPrimary,
  },
});

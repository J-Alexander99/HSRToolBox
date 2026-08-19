import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { HSRColors, HSRFonts } from '@/constants/theme';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
const SPRING = { damping: 18, stiffness: 220, mass: 0.6 };

type Rect = { x: number; y: number; width: number; height: number };

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const rects = useRef<Partial<Record<string, Rect>>>({}).current;
  const measuredValue = useRef(false);

  const hx = useSharedValue(0);
  const hy = useSharedValue(0);
  const hw = useSharedValue(0);
  const hh = useSharedValue(0);
  const opacity = useSharedValue(0);

  const applyRect = (r: Rect, animate: boolean) => {
    hx.value = animate ? withSpring(r.x, SPRING) : r.x;
    hy.value = animate ? withSpring(r.y, SPRING) : r.y;
    hw.value = animate ? withSpring(r.width, SPRING) : r.width;
    hh.value = animate ? withSpring(r.height, SPRING) : r.height;
    opacity.value = withSpring(1, SPRING);
  };

  const onItemLayout = (opt: string, e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    rects[opt] = { x, y, width, height };
    if (opt === value && !measuredValue.current) {
      measuredValue.current = true;
      applyRect({ x, y, width, height }, false);
    }
  };

  useEffect(() => {
    const r = rects[value];
    if (r) applyRect(r, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    width: hw.value,
    height: hh.value,
    transform: [{ translateX: hx.value }, { translateY: hy.value }],
  }));

  return (
    <View style={styles.wrap}>
      <AnimatedGradient
        colors={[HSRColors.primary, HSRColors.primaryDim]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.highlight, highlightStyle]}
      />
      {options.map((opt) => (
        <Pressable
          key={opt}
          onLayout={(e) => onItemLayout(opt, e)}
          onPress={() => {
            Haptics.selectionAsync();
            onChange(opt);
          }}
          style={[styles.item, value === opt && styles.itemOn]}
        >
          <Text style={[styles.text, value === opt && styles.textOn]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: HSRColors.borderGold,
  },
  item: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: HSRColors.borderSubtle,
    backgroundColor: 'rgba(34,28,66,0.55)',
  },
  itemOn: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  text: {
    fontFamily: HSRFonts.bodySemibold,
    fontSize: 13,
    color: HSRColors.textSecondary,
  },
  textOn: {
    color: HSRColors.textPrimary,
  },
});

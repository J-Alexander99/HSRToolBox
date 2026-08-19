import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { HSRColors, HSRFonts } from '@/constants/theme';
import { useCountUp } from '@/hooks/useCountUp';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 140;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** An animated circular progress ring showing a 0-100 percentage, with a count-up label. */
export function ProbabilityRing({ percent, trigger }: { percent: number; trigger: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const progress = useSharedValue(0);
  // Animate in tenths so the label can show one decimal place (e.g. "78.4%").
  const displayTenths = useCountUp(Math.round(clamped * 10), trigger, 1100);
  const displayValue = displayTenths / 10;

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(clamped / 100, { duration: 1100, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamped, trigger]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={HSRColors.goldBright} />
            <Stop offset="1" stopColor={HSRColors.primaryBright} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#2A2350"
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="url(#ringGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          fill="none"
          rotation={-90}
          originX={SIZE / 2}
          originY={SIZE / 2}
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{displayValue.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: HSRFonts.displayBold,
    fontSize: 30,
    color: HSRColors.textPrimary,
  },
});

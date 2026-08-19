import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Fixed pseudo-random star positions (percent of container) + size + delay, so
// the twinkle pattern is stable across re-renders instead of reshuffling.
const STARS = [
  { x: '8%', y: '18%', size: 2, delay: 0 },
  { x: '22%', y: '62%', size: 1.5, delay: 300 },
  { x: '40%', y: '14%', size: 1.5, delay: 900 },
  { x: '55%', y: '70%', size: 2, delay: 200 },
  { x: '70%', y: '22%', size: 1.5, delay: 700 },
  { x: '85%', y: '55%', size: 2, delay: 1100 },
  { x: '92%', y: '15%', size: 1.5, delay: 500 },
  { x: '15%', y: '85%', size: 1.5, delay: 1400 },
  { x: '65%', y: '88%', size: 1.5, delay: 1000 },
  { x: '35%', y: '40%', size: 1, delay: 1600 },
];

function Star({ x, y, size, delay }: (typeof STARS)[number]) {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.95, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.25, { duration: 1600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const position: ViewStyle = {
    position: 'absolute',
    left: x as ViewStyle['left'],
    top: y as ViewStyle['top'],
    width: size,
    height: size,
    borderRadius: size,
  };

  return <Animated.View pointerEvents="none" style={[styles.star, position, style]} />;
}

/** A soft field of twinkling stars, absolutely filling its parent. Purely decorative. */
export function Starfield() {
  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {STARS.map((s, i) => (
        <Star key={i} {...s} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});

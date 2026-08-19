import { useEffect, useState } from 'react';
import { Easing, useAnimatedReaction, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';

/**
 * Animates a displayed number counting up from 0 to `target` whenever
 * `trigger` changes (e.g. bump a counter each time the user presses
 * "Predict"). Returns the current, rounded, animated value.
 */
export function useCountUp(target: number, trigger: number, duration = 900) {
  const [display, setDisplay] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, target]);

  useAnimatedReaction(
    () => progress.value,
    (p) => {
      runOnJS(setDisplay)(Math.round(p * target));
    },
    [target]
  );

  return display;
}

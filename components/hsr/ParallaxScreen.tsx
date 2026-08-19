import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { HSRColors } from '@/constants/theme';

const HEADER_HEIGHT = 220;

type Props = PropsWithChildren<{ header: ReactElement }>;

/** A scroll view with a fixed-height header that parallax-scales on overscroll. Always dark. */
export function ParallaxScreen({ header, children }: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
        ),
      },
      { scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]) },
    ],
  }));

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={styles.flex}
      scrollEventThrottle={16}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View style={[styles.header, headerStyle]}>{header}</Animated.View>
      {children}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: HSRColors.bg0,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flexGrow: 1,
  },
});

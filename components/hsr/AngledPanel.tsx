import { useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { HSRColors } from '@/constants/theme';

let uid = 0;

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Corner chamfer size, in px. */
  cut?: number;
  /** Solid fill color. Ignored if `gradient` is set. */
  fill?: string;
  /** Diagonal two-stop gradient fill, top-left to bottom-right. */
  gradient?: [string, string];
  borderColor?: string;
  borderWidth?: number;
};

/**
 * A panel with its top-left and bottom-right corners chamfered off — the
 * angular "HSR UI" silhouette used for cards, buttons and fields throughout
 * the app. Renders its background as an SVG path sized to the view's own
 * layout, so children lay out with normal flexbox.
 */
export function AngledPanel({
  children,
  style,
  cut = 12,
  fill = HSRColors.bg2,
  gradient,
  borderColor = HSRColors.borderSubtle,
  borderWidth = 1,
}: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const gradId = useRef(`ap-grad-${uid++}`).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const { width, height } = size;
  const c = Math.min(cut, width / 2 || cut, height / 2 || cut);
  const path =
    width > 0 && height > 0
      ? `M ${c} 0 L ${width} 0 L ${width} ${height - c} L ${width - c} ${height} L 0 ${height} L 0 ${c} Z`
      : '';

  return (
    <View style={style} onLayout={onLayout}>
      {!!path && (
        // react-native-svg's own `pointerEvents` prop is a no-op on web (it isn't
        // translated to CSS there), so the non-interactive wrapper has to be a
        // plain RN View — that maps to `pointer-events: none` on every platform.
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
            {gradient && (
              <Defs>
                <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={gradient[0]} />
                  <Stop offset="1" stopColor={gradient[1]} />
                </LinearGradient>
              </Defs>
            )}
            <Path
              d={path}
              fill={gradient ? `url(#${gradId})` : fill}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
          </Svg>
        </View>
      )}
      {/* On web, a `position: absolute` sibling paints above plain in-flow
          content regardless of DOM order — the background svg above was
          rendering over field text/labels despite coming first in JSX. Giving
          the content its own positioned stacking context keeps it on top. */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

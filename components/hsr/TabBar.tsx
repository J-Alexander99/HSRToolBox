import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { HSRColors, HSRFonts } from '@/constants/theme';

const ICONS: Record<string, ImageSourcePropType> = {
  index: require('@/assets/icons/future.webp'),
  explore: require('@/assets/icons/ticket.webp'),
};

const AnimatedImage = Animated.createAnimatedComponent(Image);

function TabItem({
  routeName,
  label,
  isFocused,
  onPress,
}: {
  routeName: string;
  label: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const focus = useSharedValue(isFocused ? 1 : 0);
  useEffect(() => {
    focus.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
  }, [isFocused, focus]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + focus.value * 0.5,
    transform: [{ scale: 1 + focus.value * 0.12 }],
    shadowOpacity: focus.value * 0.75,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: focus.value,
    transform: [{ scale: focus.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + focus.value * 0.4,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.item}
    >
      <AnimatedImage source={ICONS[routeName]} style={[styles.icon, iconStyle]} resizeMode="contain" />
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <Animated.View style={[styles.dot, dotStyle]} />
    </Pressable>
  );
}

/** Fully custom bottom tab bar: gradient hairline, glowing active icon, sliding indicator dot. */
export function HSRTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <LinearGradient
        colors={[HSRColors.primary, HSRColors.gold, HSRColors.jade]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.hairline}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TabItem key={route.key} routeName={route.name} label={label} isFocused={isFocused} onPress={onPress} />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: HSRColors.bg1,
    paddingTop: 12,
    position: 'relative',
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  icon: {
    width: 22,
    height: 22,
    shadowColor: HSRColors.goldBright,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  label: {
    fontFamily: HSRFonts.displaySemibold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HSRColors.textPrimary,
  },
  dot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: HSRColors.gold,
  },
});

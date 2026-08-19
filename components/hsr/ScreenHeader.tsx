import { Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { Starfield } from '@/components/hsr/Starfield';
import { HSRColors, HSRFonts } from '@/constants/theme';

type Props = {
  title: string;
  image: ImageSourcePropType;
  glowColor: string;
};

const MEDALLION = 132;

/** The Pull Predictor / Pull Simulator header zone: portrait medallion, starfield, corner accents, title. */
export function ScreenHeader({ title, image, glowColor }: Props) {
  return (
    <View style={styles.header}>
      <LinearGradient
        colors={[HSRColors.bg2, HSRColors.bg1]}
        style={StyleSheet.absoluteFillObject}
      />
      <Starfield />

      <View style={[styles.bracket, styles.bracketTL]} pointerEvents="none" />
      <View style={[styles.bracket, styles.bracketTR]} pointerEvents="none" />

      <Animated.View entering={FadeIn.duration(500)} style={styles.medallionWrap}>
        <View style={[styles.aura, { backgroundColor: glowColor }]} />
        <View style={styles.medallionRing}>
          <Image source={image} style={styles.medallionImage} resizeMode="cover" />
        </View>
      </Animated.View>

      <LinearGradient
        colors={['transparent', HSRColors.bg1]}
        style={styles.scrim}
        pointerEvents="none"
      />

      <Animated.View entering={FadeInDown.duration(450).delay(80)} style={styles.titleWrap}>
        <Text style={styles.kicker}>HSR Toolbox</Text>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: '100%',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  bracket: {
    position: 'absolute',
    width: 18,
    height: 18,
  },
  bracketTL: {
    top: -1,
    left: -1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: HSRColors.gold,
  },
  bracketTR: {
    top: -1,
    right: -1,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: HSRColors.gold,
  },
  medallionWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 18,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aura: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    opacity: 0.28,
  },
  medallionRing: {
    width: MEDALLION,
    height: MEDALLION,
    borderRadius: MEDALLION / 2,
    borderWidth: 1.5,
    borderColor: HSRColors.borderGold,
    overflow: 'hidden',
    backgroundColor: HSRColors.bg3,
  },
  medallionImage: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  titleWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
  },
  kicker: {
    fontFamily: HSRFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: HSRColors.gold,
    marginBottom: 4,
  },
  title: {
    fontFamily: HSRFonts.displayBold,
    fontSize: 28,
    color: HSRColors.textPrimary,
  },
});

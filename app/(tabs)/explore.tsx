import { useRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { NumberField } from '@/components/hsr/NumberField';
import { ParallaxScreen } from '@/components/hsr/ParallaxScreen';
import { PrimaryButton } from '@/components/hsr/PrimaryButton';
import { ProbabilityRing } from '@/components/hsr/ProbabilityRing';
import { ResultPanel } from '@/components/hsr/ResultPanel';
import { ScreenHeader } from '@/components/hsr/ScreenHeader';
import { SegmentedControl } from '@/components/hsr/SegmentedControl';
import { HSRColors, HSRFonts } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const FIVE_STAR_CHARACTER_CHANCE = 0.006;
const FIVE_STAR_CONE_CHANCE = 0.008;
const CHARACTER_SOFT_PITY = 74;
const CONE_SOFT_PITY = 64;
const CHARACTER_PITY = 90;
const CONE_PITY = 80;
const LIMITED_CONE_CHANCE = 0.75;
const LIMITED_CHARACTER_CHANCE = 0.5;
const SOFT_PITY_INCREMENT = 0.06;

const YES_NO = ['No', 'Yes'] as const;

export default function PullSimulatorScreen() {
  const [numPulls, setNumPulls] = useState('');
  const [characterPity, setCharacterPity] = useState('');
  const [lightconePity, setLightconePity] = useState('');
  const [numCharWanted, setNumCharWanted] = useState('');
  const [numLightWanted, setNumLightWanted] = useState('');
  const [guaranteedChar, setGuaranteedChar] = useState<(typeof YES_NO)[number]>('No');
  const [guaranteedLight, setGuaranteedLight] = useState<(typeof YES_NO)[number]>('No');

  const [simulationResult, setSimulationResult] = useState<number | null>(null);
  const [simulateTrigger, setSimulateTrigger] = useState(0);

  const { screenPadding, fieldGap } = useResponsiveLayout();

  const characterPityRef = useRef<RNTextInput>(null);
  const lightconePityRef = useRef<RNTextInput>(null);
  const numCharWantedRef = useRef<RNTextInput>(null);
  const numLightWantedRef = useRef<RNTextInput>(null);

  const calculateWarpProbability = (
    warps: number,
    characterPity: number,
    conePity: number,
    coneGuaranteed: boolean,
    characterGuaranteed: boolean,
    characterCopies: number,
    coneCopies: number,
    numSimulations: number
  ): number => {
    let successfulSimulations = 0;

    for (let i = 0; i < numSimulations; i++) {
      let warpsLeft = warps;
      let charSuccesses = 0;
      let coneSuccesses = 0;
      let currConePity = conePity;
      let currCharPity = characterPity;
      let currConeGuaranteed = coneGuaranteed;
      let currCharacterGuaranteed = characterGuaranteed;

      while (warpsLeft > 0 && (charSuccesses < characterCopies || coneSuccesses < coneCopies)) {
        let pullingCharacter = false;

        if (charSuccesses < characterCopies && coneSuccesses < coneCopies) {
          pullingCharacter = characterCopies - charSuccesses >= coneCopies - coneSuccesses;
        } else if (charSuccesses < characterCopies) {
          pullingCharacter = true;
        } else {
          pullingCharacter = false;
        }

        const randomValue = Math.random();

        if (pullingCharacter) {
          let currFiveStarChance = FIVE_STAR_CHARACTER_CHANCE;
          currFiveStarChance += SOFT_PITY_INCREMENT * Math.max(currCharPity - CHARACTER_SOFT_PITY, 0);

          if (randomValue < currFiveStarChance || currCharPity + 1 === CHARACTER_PITY) {
            if (currCharacterGuaranteed || Math.random() < LIMITED_CHARACTER_CHANCE) {
              charSuccesses++;
              currCharacterGuaranteed = false;
            } else {
              currCharacterGuaranteed = true;
            }
            currCharPity = 0;
          } else {
            currCharPity++;
          }
        } else {
          let currFiveStarChance = FIVE_STAR_CONE_CHANCE;
          currFiveStarChance += SOFT_PITY_INCREMENT * Math.max(currConePity - CONE_SOFT_PITY, 0);

          if (randomValue < currFiveStarChance || currConePity + 1 === CONE_PITY) {
            if (currConeGuaranteed || Math.random() < LIMITED_CONE_CHANCE) {
              coneSuccesses++;
              currConeGuaranteed = false;
            } else {
              currConeGuaranteed = true;
            }
            currConePity = 0;
          } else {
            currConePity++;
          }
        }

        warpsLeft--;
      }

      if (charSuccesses >= characterCopies && coneSuccesses >= coneCopies) {
        successfulSimulations++;
      }
    }

    return (successfulSimulations / numSimulations) * 100;
  };

  const handleSimulate = () => {
    const result = calculateWarpProbability(
      parseInt(numPulls) || 0,
      parseInt(characterPity) || 0,
      parseInt(lightconePity) || 0,
      guaranteedLight === 'Yes',
      guaranteedChar === 'Yes',
      parseInt(numCharWanted) || 0,
      parseInt(numLightWanted) || 0,
      10000
    );
    setSimulationResult(result);
    setSimulateTrigger((t) => t + 1);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ParallaxScreen
        header={
          <ScreenHeader
            title="Pull Simulator"
            image={require('@/assets/images/herta1.webp')}
            glowColor={HSRColors.jade}
          />
        }
      >
        <View style={[styles.content, { padding: screenPadding, gap: fieldGap + 8 }]}>
          <Animated.View entering={FadeInDown.duration(400).delay(60)}>
            <NumberField
              label="Number of Pulls"
              value={numPulls}
              onChangeText={setNumPulls}
              placeholder="Enter number of pulls"
              onSubmitEditing={() => characterPityRef.current?.focus()}
              blurOnSubmit={false}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(110)} style={[styles.row, { gap: fieldGap }]}>
            <NumberField
              label="Character Pity"
              value={characterPity}
              onChangeText={setCharacterPity}
              placeholder="Enter pity"
              ref={characterPityRef}
              onSubmitEditing={() => lightconePityRef.current?.focus()}
              blurOnSubmit={false}
            />
            <NumberField
              label="Lightcone Pity"
              value={lightconePity}
              onChangeText={setLightconePity}
              placeholder="Enter pity"
              ref={lightconePityRef}
              onSubmitEditing={() => numCharWantedRef.current?.focus()}
              blurOnSubmit={false}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(160)} style={[styles.row, { gap: fieldGap }]}>
            <NumberField
              label="Characters Wanted"
              value={numCharWanted}
              onChangeText={setNumCharWanted}
              placeholder="Enter number"
              ref={numCharWantedRef}
              onSubmitEditing={() => numLightWantedRef.current?.focus()}
              blurOnSubmit={false}
            />
            <NumberField
              label="Lightcones Wanted"
              value={numLightWanted}
              onChangeText={setNumLightWanted}
              placeholder="Enter number"
              ref={numLightWantedRef}
              returnKeyType="done"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(210)} style={[styles.row, { gap: fieldGap }]}>
            <View style={styles.flexOne}>
              <Text style={styles.groupLabel}>Guaranteed Character</Text>
              <SegmentedControl options={YES_NO} value={guaranteedChar} onChange={setGuaranteedChar} />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.groupLabel}>Guaranteed Lightcone</Text>
              <SegmentedControl options={YES_NO} value={guaranteedLight} onChange={setGuaranteedLight} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(260)}>
            <PrimaryButton label="Simulate" onPress={handleSimulate} />
          </Animated.View>

          <ResultPanel label="Success Probability" visible={simulationResult !== null}>
            <ProbabilityRing percent={simulationResult ?? 0} trigger={simulateTrigger} />
            <Text style={styles.caption}>Based on 10,000 simulated warps</Text>
          </ResultPanel>
        </View>
      </ParallaxScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    backgroundColor: HSRColors.bg0,
  },
  row: {
    flexDirection: 'row',
  },
  flexOne: {
    flex: 1,
    minWidth: 0,
  },
  groupLabel: {
    fontFamily: HSRFonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HSRColors.textSecondary,
    marginBottom: 8,
  },
  caption: {
    fontFamily: HSRFonts.body,
    fontSize: 12,
    color: HSRColors.textTertiary,
    marginTop: 14,
  },
});

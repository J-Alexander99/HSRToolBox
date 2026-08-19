import { useRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { NumberField } from '@/components/hsr/NumberField';
import { ParallaxScreen } from '@/components/hsr/ParallaxScreen';
import { PrimaryButton } from '@/components/hsr/PrimaryButton';
import { ResultPanel } from '@/components/hsr/ResultPanel';
import { ScreenHeader } from '@/components/hsr/ScreenHeader';
import { SegmentedControl } from '@/components/hsr/SegmentedControl';
import { HSRColors, HSRFonts } from '@/constants/theme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useCountUp } from '@/hooks/useCountUp';

const UPDATE_HALVES = ['First', 'Second'] as const;
const PAID_OPTIONS = ['F2P', 'BP', 'ESP', 'ESP+BP'] as const;

export default function PullPredictorScreen() {
  const [currentPulls, setCurrentPulls] = useState('');
  const [stellarJade, setStellarJade] = useState('');
  const [starlight, setStarlight] = useState('');
  const [daysUntilEnd, setDaysUntilEnd] = useState('');
  const [updatesUntilChar, setUpdatesUntilChar] = useState('');
  const [updateHalf, setUpdateHalf] = useState<(typeof UPDATE_HALVES)[number]>('First');
  const [paidStatus, setPaidStatus] = useState<(typeof PAID_OPTIONS)[number]>('F2P');
  const [predictionResult, setPredictionResult] = useState(0);
  const [predictTrigger, setPredictTrigger] = useState(0);

  const { screenPadding, fieldGap } = useResponsiveLayout();

  const stellarJadeRef = useRef<RNTextInput>(null);
  const starlightRef = useRef<RNTextInput>(null);
  const daysUntilEndRef = useRef<RNTextInput>(null);
  const updatesUntilCharRef = useRef<RNTextInput>(null);

  const animatedResult = useCountUp(predictionResult, predictTrigger);

  const calculatePrediction = () => {
    const pulls = parseInt(currentPulls) || 0;
    const jade = parseInt(stellarJade) || 0;
    const lights = parseInt(starlight) || 0;
    const days = parseInt(daysUntilEnd) || 0;
    const updates = parseInt(updatesUntilChar) || 0;

    const halfValue = updateHalf === 'First' ? 0.5 : 0;

    let paidValue = 0;
    switch (paidStatus) {
      case 'F2P':
        paidValue = 105;
        break;
      case 'BP':
        paidValue = 113.3;
        break;
      case 'ESP':
        paidValue = 131.25;
        break;
      case 'ESP+BP':
        paidValue = 139.55;
        break;
    }

    const total =
      pulls + jade / 160 + lights / 20 + (paidValue * days) / 42 + paidValue * updates - paidValue * halfValue;

    setPredictionResult(Math.floor(total));
    setPredictTrigger((t) => t + 1);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
    >
      <ParallaxScreen
        header={
          <ScreenHeader
            title="Pull Predictor"
            image={require('@/assets/images/fu1.webp')}
            glowColor={HSRColors.primary}
          />
        }
      >
        <View style={[styles.content, { padding: screenPadding, gap: fieldGap + 8 }]}>
          <Animated.View entering={FadeInDown.duration(400).delay(60)}>
            <NumberField
              label="Currently Saved Pulls"
              value={currentPulls}
              onChangeText={setCurrentPulls}
              placeholder="Enter number"
              onSubmitEditing={() => stellarJadeRef.current?.focus()}
              blurOnSubmit={false}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(110)} style={[styles.row, { gap: fieldGap }]}>
            <NumberField
              label="Stellar Jade"
              value={stellarJade}
              onChangeText={setStellarJade}
              placeholder="Enter amount"
              ref={stellarJadeRef}
              onSubmitEditing={() => starlightRef.current?.focus()}
              blurOnSubmit={false}
            />
            <NumberField
              label="Starlight"
              value={starlight}
              onChangeText={setStarlight}
              placeholder="Enter amount"
              ref={starlightRef}
              onSubmitEditing={() => daysUntilEndRef.current?.focus()}
              blurOnSubmit={false}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(160)} style={[styles.row, { gap: fieldGap }]}>
            <NumberField
              label="Days Left in Update"
              value={daysUntilEnd}
              onChangeText={setDaysUntilEnd}
              placeholder="Enter days"
              ref={daysUntilEndRef}
              onSubmitEditing={() => updatesUntilCharRef.current?.focus()}
              blurOnSubmit={false}
            />
            <NumberField
              label="Updates Until Char."
              value={updatesUntilChar}
              onChangeText={setUpdatesUntilChar}
              placeholder="Enter number"
              ref={updatesUntilCharRef}
              returnKeyType="done"
              onSubmitEditing={() => updatesUntilCharRef.current?.blur()}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(210)}>
            <Text style={styles.groupLabel}>Update Half</Text>
            <SegmentedControl options={UPDATE_HALVES} value={updateHalf} onChange={setUpdateHalf} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(250)}>
            <Text style={styles.groupLabel}>Paid User</Text>
            <SegmentedControl options={PAID_OPTIONS} value={paidStatus} onChange={setPaidStatus} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <PrimaryButton label="Predict" onPress={calculatePrediction} />
          </Animated.View>

          <ResultPanel label="Estimated Pulls" visible={predictionResult > 0}>
            <Text style={styles.resultValue}>{animatedResult}</Text>
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
  groupLabel: {
    fontFamily: HSRFonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: HSRColors.textSecondary,
    marginBottom: 8,
  },
  resultValue: {
    fontFamily: HSRFonts.displayBold,
    fontSize: 52,
    lineHeight: 56,
    color: HSRColors.goldBright,
  },
});

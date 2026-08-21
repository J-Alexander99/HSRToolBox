import { useRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AdvisoryPanel } from '@/components/hsr/AdvisoryPanel';
import { AngledPanel } from '@/components/hsr/AngledPanel';
import { NumberField } from '@/components/hsr/NumberField';
import { ParallaxScreen } from '@/components/hsr/ParallaxScreen';
import { PrimaryButton } from '@/components/hsr/PrimaryButton';
import { ProbabilityCurveChart } from '@/components/hsr/ProbabilityCurveChart';
import { ProbabilityRing } from '@/components/hsr/ProbabilityRing';
import { ResultPanel } from '@/components/hsr/ResultPanel';
import { ScreenHeader } from '@/components/hsr/ScreenHeader';
import { SegmentedControl } from '@/components/hsr/SegmentedControl';
import { StatTile } from '@/components/hsr/StatTile';
import { TopUpPanel } from '@/components/hsr/TopUpPanel';
import { HSRColors, HSRFonts } from '@/constants/theme';
import { usePlannerState } from '@/contexts/PlannerContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { AdvisoryResult, buildAdvisory } from '@/lib/advisory';
import {
  CHARACTER_HARD_PITY,
  CONE_HARD_PITY,
  DEFAULT_SIMULATIONS,
  ProbabilityCurvePoint,
  SimulationInput,
  buildProbabilityCurve,
  probabilityAtPulls,
  simulateBatch,
  toSortedCdf,
  worstCaseTotalPulls,
} from '@/lib/gacha';
import { cheapestTopUp, shardShortfall, TopUpResult } from '@/lib/topups';
import { clampCopies, clampPity, parseNonNegativeInt } from '@/lib/validation';

const YES_NO = ['No', 'Yes'] as const;
const CONFIDENCE_LEVELS = [90, 95, 99];

export default function PullSimulatorScreen() {
  const [state, setState] = usePlannerState();
  const sim = state.simulator;

  const updateSim = (patch: Partial<typeof sim>) =>
    setState((s) => ({ ...s, simulator: { ...s.simulator, ...patch } }));

  const [ownedJadeOverride, setOwnedJadeOverride] = useState('');

  const [simulationResult, setSimulationResult] = useState<number | null>(null);
  const [curve, setCurve] = useState<ProbabilityCurvePoint[] | null>(null);
  const [advisory, setAdvisory] = useState<AdvisoryResult | null>(null);
  const [guaranteedPulls, setGuaranteedPulls] = useState(0);
  const [topUp, setTopUp] = useState<TopUpResult | null>(null);
  const [shortfall, setShortfall] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulateTrigger, setSimulateTrigger] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);

  const { screenPadding, fieldGap } = useResponsiveLayout();

  const characterPityRef = useRef<RNTextInput>(null);
  const lightconePityRef = useRef<RNTextInput>(null);
  const numCharWantedRef = useRef<RNTextInput>(null);
  const numLightWantedRef = useRef<RNTextInput>(null);

  const handleUsePredictedPulls = () => {
    if (state.lastPredictedPulls === null) return;
    updateSim({ numPulls: String(state.lastPredictedPulls) });
  };

  const handleSimulate = () => {
    setIsSimulating(true);

    // Deferred a tick so the loading state can paint before the synchronous
    // Monte Carlo batch runs (see NumberField/UI perf note in the plan).
    setTimeout(() => {
      const input: SimulationInput = {
        character: {
          pity: clampPity(parseNonNegativeInt(sim.characterPity), CHARACTER_HARD_PITY),
          guaranteed: sim.guaranteedChar === 'Yes',
          copiesWanted: clampCopies(parseNonNegativeInt(sim.numCharWanted)),
        },
        lightcone: {
          pity: clampPity(parseNonNegativeInt(sim.lightconePity), CONE_HARD_PITY),
          guaranteed: sim.guaranteedLight === 'Yes',
          copiesWanted: clampCopies(parseNonNegativeInt(sim.numLightWanted)),
        },
      };

      const cap = worstCaseTotalPulls(input);
      const runs = simulateBatch(input, DEFAULT_SIMULATIONS, cap);
      const sortedCdf = toSortedCdf(runs);
      const numPulls = parseNonNegativeInt(sim.numPulls);

      const ownedStellarJade =
        ownedJadeOverride !== '' ? parseNonNegativeInt(ownedJadeOverride) : parseNonNegativeInt(state.predictor.stellarJade);
      const ownedPulls = parseNonNegativeInt(state.predictor.currentPulls);
      const needed = shardShortfall(cap, ownedPulls, ownedStellarJade);

      setSimulationResult(probabilityAtPulls(sortedCdf, numPulls));
      setGuaranteedPulls(cap);
      setCurve(buildProbabilityCurve(sortedCdf, cap));
      setAdvisory(buildAdvisory(sortedCdf, input, CONFIDENCE_LEVELS));
      setShortfall(needed);
      setTopUp(cheapestTopUp(needed));
      setSimulateTrigger((t) => t + 1);
      setIsSimulating(false);
    }, 0);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <ParallaxScreen
        header={
          <ScreenHeader title="Pull Simulator" image={require('@/assets/images/herta1.webp')} glowColor={HSRColors.jade} />
        }
      >
        <View style={[styles.content, { padding: screenPadding, gap: fieldGap + 8 }]}>
          <Animated.View entering={FadeInDown.duration(400).delay(60)}>
            <NumberField
              label="Number of Pulls"
              value={sim.numPulls}
              onChangeText={(v) => updateSim({ numPulls: v })}
              placeholder="Enter number of pulls"
              onSubmitEditing={() => characterPityRef.current?.focus()}
              blurOnSubmit={false}
            />
            {state.lastPredictedPulls !== null && (
              <Pressable onPress={handleUsePredictedPulls} style={styles.chip}>
                <Text style={styles.chipText}>Use predicted pulls ({state.lastPredictedPulls.toLocaleString()})</Text>
              </Pressable>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(110)} style={[styles.row, { gap: fieldGap }]}>
            <NumberField
              label="Character Pity"
              value={sim.characterPity}
              onChangeText={(v) => updateSim({ characterPity: v })}
              placeholder="Enter pity"
              ref={characterPityRef}
              onSubmitEditing={() => lightconePityRef.current?.focus()}
              blurOnSubmit={false}
              min={0}
              max={CHARACTER_HARD_PITY - 1}
            />
            <NumberField
              label="Lightcone Pity"
              value={sim.lightconePity}
              onChangeText={(v) => updateSim({ lightconePity: v })}
              placeholder="Enter pity"
              ref={lightconePityRef}
              onSubmitEditing={() => numCharWantedRef.current?.focus()}
              blurOnSubmit={false}
              min={0}
              max={CONE_HARD_PITY - 1}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(160)} style={[styles.row, { gap: fieldGap }]}>
            <NumberField
              label="Characters Wanted"
              value={sim.numCharWanted}
              onChangeText={(v) => updateSim({ numCharWanted: v })}
              placeholder="Enter number"
              ref={numCharWantedRef}
              onSubmitEditing={() => numLightWantedRef.current?.focus()}
              blurOnSubmit={false}
              min={0}
              max={10}
            />
            <NumberField
              label="Lightcones Wanted"
              value={sim.numLightWanted}
              onChangeText={(v) => updateSim({ numLightWanted: v })}
              placeholder="Enter number"
              ref={numLightWantedRef}
              returnKeyType="done"
              min={0}
              max={10}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(210)} style={[styles.row, { gap: fieldGap }]}>
            <View style={styles.flexOne}>
              <Text style={styles.groupLabel}>Guaranteed Character</Text>
              <SegmentedControl options={YES_NO} value={sim.guaranteedChar} onChange={(v) => updateSim({ guaranteedChar: v })} />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.groupLabel}>Guaranteed Lightcone</Text>
              <SegmentedControl options={YES_NO} value={sim.guaranteedLight} onChange={(v) => updateSim({ guaranteedLight: v })} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(250)}>
            <NumberField
              label="Stellar Jade Owned (optional override)"
              value={ownedJadeOverride}
              onChangeText={setOwnedJadeOverride}
              placeholder={`Defaults to Predictor's Stellar Jade (${state.predictor.stellarJade || '0'})`}
              returnKeyType="done"
              min={0}
              max={999999}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(300)}>
            <PrimaryButton label={isSimulating ? 'Simulating…' : 'Simulate'} onPress={handleSimulate} disabled={isSimulating} />
          </Animated.View>

          <ResultPanel label="Success Probability" visible={simulationResult !== null}>
            <ProbabilityRing percent={simulationResult ?? 0} trigger={simulateTrigger} />
            <Text style={styles.caption}>Based on {DEFAULT_SIMULATIONS.toLocaleString()} simulated warps</Text>
          </ResultPanel>

          {advisory && (
            <Animated.View entering={FadeInDown.duration(400)} style={[styles.row, { gap: fieldGap, flexWrap: 'wrap' }]}>
              {advisory.confidenceTiers.map((t) => (
                <StatTile
                  key={t.percent}
                  label={`${t.percent}% Confidence`}
                  value={`${t.pulls}`}
                  caption="pulls needed"
                  accentColor={HSRColors.primaryBright}
                />
              ))}
              <StatTile label="Guaranteed" value={`${guaranteedPulls}`} caption="pulls (100%, worst case)" accentColor={HSRColors.goldBright} />
            </Animated.View>
          )}

          {curve && (
            <Animated.View
              entering={FadeInDown.duration(400)}
              onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - 32)}
            >
              <AngledPanel cut={12} fill={HSRColors.bg2} borderColor={HSRColors.borderSubtle} style={styles.chartPanel}>
                <Text style={styles.groupLabel}>Probability vs. Pulls</Text>
                {chartWidth > 0 && (
                  <ProbabilityCurveChart
                    data={curve}
                    width={chartWidth}
                    markers={[
                      ...(advisory?.confidenceTiers.map((t) => ({ pulls: t.pulls, label: `${t.percent}%` })) ?? []),
                      { pulls: guaranteedPulls, label: '100%', color: HSRColors.goldBright },
                    ]}
                  />
                )}
              </AngledPanel>
            </Animated.View>
          )}

          {topUp && <Animated.View entering={FadeInDown.duration(400)}><TopUpPanel shortfall={shortfall} result={topUp} /></Animated.View>}

          {advisory && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <AdvisoryPanel advisory={advisory} />
            </Animated.View>
          )}
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
  chip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: HSRColors.bg3,
    borderWidth: 1,
    borderColor: HSRColors.borderGold,
  },
  chipText: {
    fontFamily: HSRFonts.bodySemibold,
    fontSize: 12,
    color: HSRColors.goldBright,
  },
  chartPanel: {
    padding: 16,
  },
});

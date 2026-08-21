import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Stop, Circle as SvgCircle } from 'react-native-svg';

import { HSRColors, HSRFonts } from '@/constants/theme';
import type { ProbabilityCurvePoint } from '@/lib/gacha';

type Marker = { pulls: number; label: string; color?: string };

type Props = {
  data: ProbabilityCurvePoint[];
  width: number;
  height?: number;
  markers?: Marker[];
};

const PAD_LEFT = 30;
const PAD_BOTTOM = 20;
const PAD_TOP = 10;
const PAD_RIGHT = 8;

/**
 * Hand-rolled SVG line/area chart of the probability-vs-pulls curve, in the
 * same `react-native-svg` style as `ProbabilityRing` - no charting library.
 */
export function ProbabilityCurveChart({ data, width, height = 160, markers = [] }: Props) {
  if (data.length < 2 || width <= 0) return null;

  const maxPulls = data[data.length - 1].pulls;
  const plotWidth = width - PAD_LEFT - PAD_RIGHT;
  const plotHeight = height - PAD_TOP - PAD_BOTTOM;

  const x = (pulls: number) => PAD_LEFT + (maxPulls > 0 ? (pulls / maxPulls) * plotWidth : 0);
  const y = (percent: number) => PAD_TOP + plotHeight * (1 - percent / 100);

  const linePath = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.pulls).toFixed(1)} ${y(p.percent).toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${x(maxPulls).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;

  return (
    <View style={{ width, height: height + 16 }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="curveAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={HSRColors.jadeBright} stopOpacity={0.35} />
            <Stop offset="1" stopColor={HSRColors.jadeBright} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {[0, 50, 100].map((tick) => (
          <Line
            key={tick}
            x1={PAD_LEFT}
            x2={width - PAD_RIGHT}
            y1={y(tick)}
            y2={y(tick)}
            stroke={HSRColors.borderSubtle}
            strokeWidth={1}
          />
        ))}

        <Path d={areaPath} fill="url(#curveAreaGrad)" />
        <Path d={linePath} stroke={HSRColors.jade} strokeWidth={2} fill="none" strokeLinejoin="round" />

        {markers.map((m) => (
          <Line
            key={m.pulls}
            x1={x(m.pulls)}
            x2={x(m.pulls)}
            y1={PAD_TOP}
            y2={height - PAD_BOTTOM}
            stroke={m.color ?? HSRColors.gold}
            strokeWidth={1}
            strokeDasharray="3,3"
          />
        ))}
        {markers.map((m) => (
          <SvgCircle key={`${m.pulls}-dot`} cx={x(m.pulls)} cy={y(pointAt(data, m.pulls))} r={3} fill={m.color ?? HSRColors.gold} />
        ))}
      </Svg>

      <View style={styles.yAxis} pointerEvents="none">
        <Text style={styles.axisLabel}>100%</Text>
        <Text style={styles.axisLabel}>0%</Text>
      </View>

      <View style={styles.xAxis} pointerEvents="none">
        <Text style={styles.axisLabel}>0</Text>
        <Text style={styles.axisLabel}>{maxPulls} pulls</Text>
      </View>
    </View>
  );
}

/** Looks up the curve's percent value at (or nearest before) a given pull count, for marker-dot placement. */
function pointAt(data: ProbabilityCurvePoint[], pulls: number): number {
  let best = data[0];
  for (const p of data) {
    if (p.pulls <= pulls) best = p;
    else break;
  }
  return best.percent;
}

const styles = StyleSheet.create({
  yAxis: {
    position: 'absolute',
    left: 0,
    top: PAD_TOP - 6,
    bottom: PAD_BOTTOM - 6,
    width: PAD_LEFT - 4,
    justifyContent: 'space-between',
  },
  xAxis: {
    position: 'absolute',
    left: PAD_LEFT,
    right: PAD_RIGHT,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabel: {
    fontFamily: HSRFonts.body,
    fontSize: 10,
    color: HSRColors.textTertiary,
  },
});

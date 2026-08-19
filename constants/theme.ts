/**
 * HSR Toolbox design tokens.
 *
 * The app is a dark, cosmic, Honkai Star Rail-inspired UI and is designed
 * dark-first (there is no light variant) — every screen renders against
 * this palette regardless of system color scheme.
 */

export const HSRColors = {
  // Background layers, darkest to lightest.
  bg0: '#0A0918', // app void
  bg1: '#130F26', // screen base
  bg2: '#1A1533', // panel / card fill
  bg3: '#221C42', // input field fill

  borderSubtle: 'rgba(154,140,214,0.18)',
  borderGold: 'rgba(228,193,113,0.55)',

  primary: '#9B6BFF',
  primaryBright: '#B794FF',
  primaryDim: '#6B4FB0',

  gold: '#E4C171',
  goldBright: '#F0D89A',

  jade: '#6FE0B8',
  jadeBright: '#96EDCE',

  textPrimary: '#F5F2FF',
  textSecondary: '#A79FC4',
  textTertiary: '#6E6790',
  placeholder: '#565073',
} as const;

export const HSRFonts = {
  displayRegular: 'Rajdhani_500Medium',
  displaySemibold: 'Rajdhani_600SemiBold',
  displayBold: 'Rajdhani_700Bold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemibold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyExtraBold: 'Manrope_800ExtraBold',
} as const;

export const HSRSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Corner chamfer size used by AngledPanel across the app, by "role". */
export const HSRCut = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

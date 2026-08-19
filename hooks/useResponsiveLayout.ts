import { useWindowDimensions } from 'react-native';

/**
 * Layout metrics that shrink gracefully on very narrow screens — namely a
 * Galaxy Z Fold 5 in folded mode, whose cover display is ~344dp wide
 * (narrower than a standard small phone at ~360dp).
 */
export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const narrow = width < 360;

  return {
    width,
    narrow,
    screenPadding: narrow ? 14 : 20,
    fieldGap: narrow ? 8 : 12,
  };
}

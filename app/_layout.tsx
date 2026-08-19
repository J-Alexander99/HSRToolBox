import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Rajdhani_500Medium, Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { HSRColors } from '@/constants/theme';

// HSR Toolbox is a dark, cosmic themed app with no light variant — it always
// renders against the dark palette, regardless of the device's system theme.
const HSRNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: HSRColors.bg0,
    card: HSRColors.bg1,
    primary: HSRColors.primary,
    text: HSRColors.textPrimary,
    border: HSRColors.borderSubtle,
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={HSRNavigationTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

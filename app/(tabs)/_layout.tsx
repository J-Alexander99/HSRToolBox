import { Tabs } from 'expo-router';

import { HSRTabBar } from '@/components/hsr/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <HSRTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Predictor' }} />
      <Tabs.Screen name="explore" options={{ title: 'Simulator' }} />
    </Tabs>
  );
}

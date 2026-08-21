import { Tabs } from 'expo-router';

import { HSRTabBar } from '@/components/hsr/TabBar';
import { PlannerProvider } from '@/contexts/PlannerContext';

export default function TabLayout() {
  return (
    <PlannerProvider>
      <Tabs
        tabBar={(props) => <HSRTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Predictor' }} />
        <Tabs.Screen name="explore" options={{ title: 'Simulator' }} />
      </Tabs>
    </PlannerProvider>
  );
}

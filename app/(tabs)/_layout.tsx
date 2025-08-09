import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: colorScheme === "dark" ? "#666666" : "#999999",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: 65,
          paddingBottom: 12,
          elevation: 8,
          borderTopWidth: 0,
          backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
          marginBottom: 50,
        },
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Pull Predicter",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/icons/future.webp")}
              style={[
                styles.tabIcon,
                focused ? styles.tabIconActive : styles.tabIconInactive,
              ]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Pull Simulator",
          tabBarIcon: ({ focused }) => (
            <Image
              source={require("@/assets/icons/ticket.webp")}
              style={[
                styles.tabIcon,
                focused ? styles.tabIconActive : styles.tabIconInactive,
              ]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
    marginTop: 4,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabIconInactive: {
    opacity: 0.6,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
});

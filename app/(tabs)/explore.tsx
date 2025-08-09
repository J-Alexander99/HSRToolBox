import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput, Pressable } from "react-native";
import { useState } from "react";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function TabTwoScreen() {
  const [numPulls, setNumPulls] = useState("");
  const [characterPity, setCharacterPity] = useState("");
  const [lightconePity, setLightconePity] = useState("");
  const [numCharWanted, setNumCharWanted] = useState("");
  const [numLightWanted, setNumLightWanted] = useState("");
  const [guaranteedChar, setGuaranteedChar] = useState(false);
  const [guaranteedLight, setGuaranteedLight] = useState(false);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Star Rail Pull Simulator</ThemedText>
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedView style={styles.inputGroup}>
          <ThemedText>Number of Pulls:</ThemedText>
          <TextInput
            style={styles.input}
            value={numPulls}
            onChangeText={setNumPulls}
            keyboardType="numeric"
            placeholder="Enter number of pulls"
            placeholderTextColor="#999"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText>Character Banner Pity:</ThemedText>
          <TextInput
            style={styles.input}
            value={characterPity}
            onChangeText={setCharacterPity}
            keyboardType="numeric"
            placeholder="Enter character pity"
            placeholderTextColor="#999"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText>LightCone Banner Pity:</ThemedText>
          <TextInput
            style={styles.input}
            value={lightconePity}
            onChangeText={setLightconePity}
            keyboardType="numeric"
            placeholder="Enter lightcone pity"
            placeholderTextColor="#999"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText>Number of Characters Wanted:</ThemedText>
          <TextInput
            style={styles.input}
            value={numCharWanted}
            onChangeText={setNumCharWanted}
            keyboardType="numeric"
            placeholder="Enter number wanted"
            placeholderTextColor="#999"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText>Number of LightCones Wanted:</ThemedText>
          <TextInput
            style={styles.input}
            value={numLightWanted}
            onChangeText={setNumLightWanted}
            keyboardType="numeric"
            placeholder="Enter number wanted"
            placeholderTextColor="#999"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText>Guaranteed Character:</ThemedText>
          <ThemedView style={styles.buttonGroup}>
            <Pressable
              style={[styles.button, guaranteedChar && styles.selectedButton]}
              onPress={() => setGuaranteedChar(!guaranteedChar)}
            >
              <ThemedText>{guaranteedChar ? "Yes" : "No"}</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText>Guaranteed LightCone:</ThemedText>
          <ThemedView style={styles.buttonGroup}>
            <Pressable
              style={[styles.button, guaranteedLight && styles.selectedButton]}
              onPress={() => setGuaranteedLight(!guaranteedLight)}
            >
              <ThemedText>{guaranteedLight ? "Yes" : "No"}</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        <Pressable style={styles.simulateButton}>
          <ThemedText style={styles.simulateButtonText}>Simulate</ThemedText>
        </Pressable>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#2a2542", // Dark purple background
  },
  headerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(169,156,166,0.1)", // Transparent mauve
  },
  titleText: {
    color: "#e0dee0", // Light grey for text
  },
  inputContainer: {
    padding: 16,
    gap: 16,
    backgroundColor: "rgba(177,157,204,0.05)", // Very subtle purple tint
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#7a56ae", // Purple border
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "rgba(224,222,224,0.1)", // Semi-transparent light grey
    color: "#e0dee0", // Light grey text
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7a56ae", // Purple border
    backgroundColor: "rgba(224,222,224,0.1)", // Semi-transparent light grey
  },
  selectedButton: {
    backgroundColor: "#7a56ae", // Purple background when selected
    borderColor: "#b19dcc", // Lighter purple border when selected
  },
  simulateButton: {
    backgroundColor: "#7a56ae", // Purple background
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#b19dcc", // Lighter purple border
  },
  simulateButtonText: {
    color: "#e0dee0", // Light grey text
    fontSize: 18,
    fontWeight: "bold",
  },
});

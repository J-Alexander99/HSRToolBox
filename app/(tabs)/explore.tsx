import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

const FIVE_STAR_CHARACTER_CHANCE = 0.006;
const FIVE_STAR_CONE_CHANCE = 0.008;
const CHARACTER_SOFT_PITY = 74;
const CONE_SOFT_PITY = 64;
const CHARACTER_PITY = 90;
const CONE_PITY = 80;
const LIMITED_CONE_CHANCE = 0.75;
const LIMITED_CHARACTER_CHANCE = 0.5;
const SOFT_PITY_INCREMENT = 0.06;

export default function TabTwoScreen() {
  const [numPulls, setNumPulls] = useState("");
  const [characterPity, setCharacterPity] = useState("");
  const [lightconePity, setLightconePity] = useState("");
  const [numCharWanted, setNumCharWanted] = useState("");
  const [numLightWanted, setNumLightWanted] = useState("");
  const [guaranteedChar, setGuaranteedChar] = useState(false);
  const [guaranteedLight, setGuaranteedLight] = useState(false);

  const [simulationResult, setSimulationResult] = useState<number | null>(null);

  const characterPityRef = useRef<TextInput>(null);
  const lightconePityRef = useRef<TextInput>(null);
  const numCharWantedRef = useRef<TextInput>(null);
  const numLightWantedRef = useRef<TextInput>(null);

  const calculateWarpProbability = (
    warps: number,
    characterPity: number,
    conePity: number,
    coneGuaranteed: boolean,
    characterGuaranteed: boolean,
    characterCopies: number,
    coneCopies: number,
    numSimulations: number
  ): number => {
    let successfulSimulations = 0;

    for (let i = 0; i < numSimulations; i++) {
      let warpsLeft = warps;
      let charSuccesses = 0;
      let coneSuccesses = 0;
      let currConePity = conePity;
      let currCharPity = characterPity;
      let currConeGuaranteed = coneGuaranteed;
      let currCharacterGuaranteed = characterGuaranteed;

      while (
        warpsLeft > 0 &&
        (charSuccesses < characterCopies || coneSuccesses < coneCopies)
      ) {
        let pullingCharacter = false;

        // Decide banner to pull
        if (charSuccesses < characterCopies && coneSuccesses < coneCopies) {
          // Random choice or strategy: here, prioritize whichever is further from completion
          pullingCharacter =
            characterCopies - charSuccesses >= coneCopies - coneSuccesses;
        } else if (charSuccesses < characterCopies) {
          pullingCharacter = true;
        } else {
          pullingCharacter = false;
        }

        const randomValue = Math.random();

        if (pullingCharacter) {
          // Character banner pull
          let currFiveStarChance = FIVE_STAR_CHARACTER_CHANCE;
          currFiveStarChance +=
            SOFT_PITY_INCREMENT *
            Math.max(currCharPity - CHARACTER_SOFT_PITY, 0);

          if (
            randomValue < currFiveStarChance ||
            currCharPity + 1 === CHARACTER_PITY
          ) {
            if (
              currCharacterGuaranteed ||
              Math.random() < LIMITED_CHARACTER_CHANCE
            ) {
              charSuccesses++;
              currCharacterGuaranteed = false;
            } else {
              currCharacterGuaranteed = true;
            }
            currCharPity = 0;
          } else {
            currCharPity++;
          }
        } else {
          // Light cone banner pull
          let currFiveStarChance = FIVE_STAR_CONE_CHANCE;
          currFiveStarChance +=
            SOFT_PITY_INCREMENT * Math.max(currConePity - CONE_SOFT_PITY, 0);

          if (
            randomValue < currFiveStarChance ||
            currConePity + 1 === CONE_PITY
          ) {
            if (currConeGuaranteed || Math.random() < LIMITED_CONE_CHANCE) {
              coneSuccesses++;
              currConeGuaranteed = false;
            } else {
              currConeGuaranteed = true;
            }
            currConePity = 0;
          } else {
            currConePity++;
          }
        }

        warpsLeft--;
      }

      if (charSuccesses >= characterCopies && coneSuccesses >= coneCopies) {
        successfulSimulations++;
      }
    }

    return (successfulSimulations / numSimulations) * 100;
  };

  const handleSimulate = () => {
    const result = calculateWarpProbability(
      parseInt(numPulls) || 0,
      parseInt(characterPity) || 0,
      parseInt(lightconePity) || 0,
      guaranteedLight,
      guaranteedChar,
      parseInt(numCharWanted) || 0,
      parseInt(numLightWanted) || 0,
      10000
    );
    setSimulationResult(result);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
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
              returnKeyType="next"
              onSubmitEditing={() => characterPityRef.current?.focus()}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>Character Banner Pity:</ThemedText>
            <TextInput
              ref={characterPityRef}
              style={styles.input}
              value={characterPity}
              onChangeText={setCharacterPity}
              keyboardType="numeric"
              placeholder="Enter character pity"
              placeholderTextColor="#999"
              returnKeyType="next"
              onSubmitEditing={() => lightconePityRef.current?.focus()}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>LightCone Banner Pity:</ThemedText>
            <TextInput
              ref={lightconePityRef}
              style={styles.input}
              value={lightconePity}
              onChangeText={setLightconePity}
              keyboardType="numeric"
              placeholder="Enter lightcone pity"
              placeholderTextColor="#999"
              returnKeyType="next"
              onSubmitEditing={() => numCharWantedRef.current?.focus()}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>Number of Characters Wanted:</ThemedText>
            <TextInput
              ref={numCharWantedRef}
              style={styles.input}
              value={numCharWanted}
              onChangeText={setNumCharWanted}
              keyboardType="numeric"
              placeholder="Enter number wanted"
              placeholderTextColor="#999"
              returnKeyType="next"
              onSubmitEditing={() => numLightWantedRef.current?.focus()}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>Number of LightCones Wanted:</ThemedText>
            <TextInput
              ref={numLightWantedRef}
              style={styles.input}
              value={numLightWanted}
              onChangeText={setNumLightWanted}
              keyboardType="numeric"
              placeholder="Enter number wanted"
              placeholderTextColor="#999"
              returnKeyType="done"
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
                style={[
                  styles.button,
                  guaranteedLight && styles.selectedButton,
                ]}
                onPress={() => setGuaranteedLight(!guaranteedLight)}
              >
                <ThemedText>{guaranteedLight ? "Yes" : "No"}</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>

          <Pressable style={styles.simulateButton} onPress={handleSimulate}>
            <ThemedText style={styles.simulateButtonText}>Simulate</ThemedText>
          </Pressable>

          {simulationResult !== null && (
            <ThemedView style={styles.resultContainer}>
              <ThemedText style={styles.resultText}>
                Probability: {simulationResult.toFixed(2)}%
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ParallaxScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#2a2542",
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
    backgroundColor: "rgba(169,156,166,0.1)",
  },
  titleText: {
    color: "#e0dee0",
  },
  inputContainer: {
    padding: 16,
    gap: 16,
    backgroundColor: "rgba(177,157,204,0.05)",
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#7a56ae",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "rgba(224,222,224,0.1)",
    color: "#e0dee0",
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
    borderColor: "#7a56ae",
    backgroundColor: "rgba(224,222,224,0.1)",
  },
  selectedButton: {
    backgroundColor: "#7a56ae",
    borderColor: "#b19dcc",
  },
  simulateButton: {
    backgroundColor: "#7a56ae",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#b19dcc",
  },
  simulateButtonText: {
    color: "#e0dee0",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(224,222,224,0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7a56ae",
    alignItems: "center",
  },
  resultText: {
    color: "#e0dee0",
    fontSize: 20,
    fontWeight: "bold",
  },
});

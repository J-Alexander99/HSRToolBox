import { Image } from 'expo-image';
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TextInput as TextInputType,
  View,
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  const [currentPulls, setCurrentPulls] = useState("");
  const [stellarJade, setStellarJade] = useState("");
  const [starlight, setStarlight] = useState("");
  const [daysUntilEnd, setDaysUntilEnd] = useState("");
  const [updatesUntilChar, setUpdatesUntilChar] = useState("");
  const [updateHalf, setUpdateHalf] = useState("First");
  const [paidStatus, setPaidStatus] = useState("F2P");
  const [predictionResult, setPredictionResult] = useState<number>(0);

  const daysUntilEndRef = useRef<TextInputType>(null);
  const stellarJadeRef = useRef<TextInputType>(null);
  const starlightRef = useRef<TextInputType>(null);
  const updatesUntilCharRef = useRef<TextInputType>(null);

  const calculatePrediction = () => {
    // Convert string inputs to numbers
    const pulls = parseInt(currentPulls) || 0;
    const jade = parseInt(stellarJade) || 0;
    const lights = parseInt(starlight) || 0;
    const days = parseInt(daysUntilEnd) || 0;
    const updates = parseInt(updatesUntilChar) || 0;

    // Convert special values
    const halfValue = updateHalf === "First" ? 0.5 : 0;

    let paidValue = 0;
    switch (paidStatus) {
      case "F2P":
        paidValue = 105;
        break;
      case "BP":
        paidValue = 113.3;
        break;
      case "ESP":
        paidValue = 131.25;
        break;
      case "ESP+BP":
        paidValue = 139.55;
        break;
    }

    // Calculate total
    const total =
      pulls +
      jade / 160 +
      lights / 20 +
      (paidValue * days) / 42 +
      paidValue * updates -
      paidValue * halfValue;

    setPredictionResult(Math.floor(total));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      <ParallaxScrollView
        headerBackgroundColor={{
          light: "#E0B0FF",
          dark: "#ffffffff",
        }}
        headerImage={
          <ThemedView style={styles.headerContainer}>
            <View style={styles.headerBackground} />
            {/* Left background image */}
            <Image
              source={require("@/assets/images/fu2.webp")}
              style={[styles.sideImage, styles.leftImage]}
              contentFit="contain"
            />

            {/* Right background image */}
            <Image
              source={require("@/assets/images/fu1.webp")}
              style={[styles.sideImage, styles.rightImage]}
              contentFit="contain"
            />

            {/* Title images (stay on top) */}
            <Image
              source={require("@/assets/images/title1.webp")}
              style={styles.headerImage}
              contentFit="contain"
            />
            <Image
              source={require("@/assets/images/title2.webp")}
              style={styles.headerImage}
              contentFit="contain"
            />
          </ThemedView>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ThemedView style={styles.mainContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Pull Predictor</ThemedText>
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedView style={styles.inputGroup}>
              <ThemedText>Currently Saved Pulls:</ThemedText>
              <TextInput
                style={styles.input}
                value={currentPulls}
                onChangeText={setCurrentPulls}
                keyboardType="numeric"
                placeholder="Enter number"
                returnKeyType="next"
                onSubmitEditing={() => stellarJadeRef.current?.focus()}
                blurOnSubmit={false}
                placeholderTextColor="#999"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText>Stellar Jade Collected:</ThemedText>
              <TextInput
                ref={stellarJadeRef}
                style={styles.input}
                value={stellarJade}
                onChangeText={setStellarJade}
                keyboardType="numeric"
                placeholder="Enter amount"
                returnKeyType="next"
                onSubmitEditing={() => starlightRef.current?.focus()}
                blurOnSubmit={false}
                placeholderTextColor="#999"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText>Starlight Collected:</ThemedText>
              <TextInput
                ref={starlightRef}
                style={styles.input}
                value={starlight}
                onChangeText={setStarlight}
                keyboardType="numeric"
                placeholder="Enter amount"
                returnKeyType="next"
                onSubmitEditing={() => daysUntilEndRef.current?.focus()}
                blurOnSubmit={false}
                placeholderTextColor="#999"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText>Days Until End of Update:</ThemedText>
              <TextInput
                ref={daysUntilEndRef}
                style={styles.input}
                value={daysUntilEnd}
                onChangeText={setDaysUntilEnd}
                keyboardType="numeric"
                placeholder="Enter days"
                returnKeyType="next"
                onSubmitEditing={() => updatesUntilCharRef.current?.focus()}
                blurOnSubmit={false}
                placeholderTextColor="#999"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText>Updates Until Character:</ThemedText>
              <TextInput
                ref={updatesUntilCharRef}
                style={styles.input}
                value={updatesUntilChar}
                onChangeText={setUpdatesUntilChar}
                keyboardType="numeric"
                placeholder="Enter updates"
                returnKeyType="done"
                onSubmitEditing={() => updatesUntilCharRef.current?.blur()}
                placeholderTextColor="#999"
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText>Update Half:</ThemedText>
              <ThemedView style={styles.buttonGroup}>
                <Pressable
                  style={[
                    styles.button,
                    updateHalf === "First" && styles.selectedButton,
                  ]}
                  onPress={() => setUpdateHalf("First")}
                >
                  <ThemedText>First</ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.button,
                    updateHalf === "Second" && styles.selectedButton,
                  ]}
                  onPress={() => setUpdateHalf("Second")}
                >
                  <ThemedText>Second</ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText>Paid User:</ThemedText>
              <ThemedView style={styles.buttonGroup}>
                {["F2P", "BP", "ESP", "ESP+BP"].map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.button,
                      paidStatus === option && styles.selectedButton,
                    ]}
                    onPress={() => setPaidStatus(option)}
                  >
                    <ThemedText>{option}</ThemedText>
                  </Pressable>
                ))}
              </ThemedView>
            </ThemedView>

            <Pressable
              style={styles.predictButton}
              onPress={calculatePrediction}
            >
              <ThemedText style={styles.predictButtonText}>Predict</ThemedText>
            </Pressable>

            {predictionResult > 0 && (
              <ThemedView style={styles.resultContainer}>
                <ThemedText style={styles.resultText}>
                  Pulls: {predictionResult}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </ParallaxScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingBottom: 50,
    backgroundColor: "rgba(20, 20, 20, 0)",
  },
  titleContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "rgba(20, 20, 20, 0)",
  },
  inputContainer: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D7AC28",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: "rgba(245, 245, 245, 0.1)",
    color: "#F5F5F5",
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7AC28",
    backgroundColor: "rgba(245, 245, 245, 0.1)",
  },
  selectedButton: {
    backgroundColor: "#BF00FF",
    borderColor: "#FF00FF",
  },
  predictButton: {
    backgroundColor: "#BF00FF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FF00FF",
  },
  predictButtonText: {
    color: "#F5F5F5",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#730f95ff",
  },
  headerImage: {
    width: 200,
    height: 150,
    zIndex: 2, // Make sure titles are on top
  },
  sideImage: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 200,
    height: "100%",
    zIndex: 1, // Behind title images
  },
  leftImage: {
    left: 0,
  },
  rightImage: {
    right: 0,
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    alignItems: "center",
    backgroundColor: "rgba(191, 0, 255, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7AC28",
  },
  resultText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F5F5F5",
  },
});

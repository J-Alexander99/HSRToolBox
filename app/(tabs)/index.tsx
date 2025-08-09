import { Image } from 'expo-image';
import { 
  Platform, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView,
  TextInput as TextInputType,
  View 
} from "react-native";
import { useState, useRef } from "react";

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [currentPulls, setCurrentPulls] = useState("");
  const [daysUntilEnd, setDaysUntilEnd] = useState("");
  const [updatesUntilChar, setUpdatesUntilChar] = useState("");
  const [updateHalf, setUpdateHalf] = useState("First");
  const [paidStatus, setPaidStatus] = useState("F2P");

  const daysUntilEndRef = useRef<TextInputType>(null);
  const updatesUntilCharRef = useRef<TextInputType>(null);

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
            <ThemedText type="title"></ThemedText>
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

            <Pressable style={styles.predictButton}>
              <ThemedText style={styles.predictButtonText}>Predict</ThemedText>
            </Pressable>
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
    width: "100%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // Add padding on sides
  },
  headerBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(245, 245, 245, 0.1)",
  },
  headerImage: {
    width: "80%", // Reduce width to create side gaps
    height: "50%",
    position: "relative",
  },
});

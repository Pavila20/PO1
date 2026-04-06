// app/qa-rating.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

import { saveBrewRating, savePourProfile } from "../src/backend/api/database";
import { getSessionUser } from "../src/backend/auth/session";
import { calculateNewProfile } from "../src/backend/core/algorithm";
import { PourProfile } from "../src/models/types";

export default function QARatingScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const [step, setStep] = useState<1 | 2>(1);
  const [score, setScore] = useState(12);
  const [strength, setStrength] = useState("Perfect");
  const [savedUserId, setSavedUserId] = useState<string>("unknown-user");

  const bgColor = isDark ? colors.background : "#FFF1E5";
  const textColor = isDark ? colors.text : "#9C4400";
  const subtextColor = isDark ? colors.subtext : "#896D59";
  const btnBgColor = isDark ? colors.primaryButton : "#FFDEBA";
  const btnTextColor = isDark ? "#F0CEAB" : "#000000";
  const trackBgColor = isDark ? "#333333" : "#E5E5E5";

  const handleContinue = async () => {
    await AsyncStorage.setItem("user_coffee_pref", score.toString());

    try {
      const user = await getSessionUser();
      const realUserId = user?.sub || "unknown-user";
      setSavedUserId(realUserId);

      const currentProfileUsed: PourProfile = {
        profileId: `ai-optimized-${realUserId}`,
        userId: realUserId,
        name: "My Perfect Cup",
        targetTemp: 200,
        grindSize: 15,
        waterVolume: 250,
        coffeeWeight: 20,
        bloomTime: 30,
        dispenseRate: 3.5,
        isDefault: false,
        createdAt: new Date().toISOString(),
      };

      const strengthMapped =
        strength === "Too Weak"
          ? "Too weak"
          : strength === "Too Strong"
            ? "Too strong"
            : "Just right";

      await saveBrewRating({
        userId: currentProfileUsed.userId,
        profileId: currentProfileUsed.profileId,
        rating: score,
        perceivedStrength: strengthMapped,
        targetTemp: currentProfileUsed.targetTemp,
        grindSize: currentProfileUsed.grindSize,
        coffeeWeight: currentProfileUsed.coffeeWeight || 20,
        waterVolume: currentProfileUsed.waterVolume,
      });

      const optimizedRecipe = calculateNewProfile(
        currentProfileUsed,
        score,
        strengthMapped,
      );

      optimizedRecipe.profileId = `ai-optimized-${realUserId}`;
      optimizedRecipe.name = "My Perfect Cup";

      await savePourProfile(optimizedRecipe);
      console.log("Smart Cup updated in AWS!");
    } catch (error) {
      console.error("Failed to sync feedback with AWS:", error);
    }

    setStep(2);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: btnBgColor }]}
          onPress={() => (step === 2 ? setStep(1) : router.back())}
          activeOpacity={0.8}
        >
          <ArrowLeft color={btnTextColor} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Feedback</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <>
            <View style={styles.questionBlock}>
              <Text style={[styles.questionText, { color: textColor }]}>
                From 1 to 15, how much did you enjoy the drink?
              </Text>
              <Text style={[styles.scoreText, { color: textColor }]}>
                {score}
              </Text>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={1}
                maximumValue={15}
                step={1}
                value={score}
                onValueChange={setScore}
                minimumTrackTintColor={btnBgColor}
                maximumTrackTintColor={trackBgColor}
                thumbTintColor={btnBgColor}
              />
            </View>

            <View style={styles.questionBlock}>
              <Text style={[styles.questionText, { color: textColor }]}>
                How was the strength of your coffee?
              </Text>
              <View style={styles.pillContainer}>
                {["Too Weak", "Perfect", "Too Strong"].map((option) => {
                  const isActive = strength === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: isActive
                            ? btnBgColor
                            : "transparent",
                          borderColor: btnBgColor,
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => setStrength(option)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          { color: isActive ? btnTextColor : textColor },
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: btnBgColor, marginTop: "auto" },
              ]}
              onPress={handleContinue}
            >
              <Text style={[styles.primaryBtnText, { color: btnTextColor }]}>
                Continue
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.recommendationBlock}>
              <Text style={[styles.recommendTitle, { color: textColor }]}>
                Thanks for your feedback!
              </Text>
              <Text style={[styles.recommendSub, { color: subtextColor }]}>
                Your machine has learned from this and automatically adjusted
                "My Perfect Cup" for next time.
              </Text>
            </View>

            <View style={styles.actionBlock}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: btnBgColor }]}
                onPress={() =>
                  router.replace({
                    pathname: "/active-brew",
                    params: {
                      name: "My Perfect Cup",
                      strength: "Custom",
                      isCustom: "true",
                      recipeId: `ai-optimized-${savedUserId}`,
                    },
                  })
                }
              >
                <Text style={[styles.secondaryBtnText, { color: textColor }]}>
                  Brew Updated Cup
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: btnBgColor }]}
                onPress={() => router.replace("/(tabs)/home")}
              >
                <Text style={[styles.primaryBtnText, { color: btnTextColor }]}>
                  Go Back Home
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "800", fontFamily: "serif" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  questionBlock: { marginBottom: 40 },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  pillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  pill: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 },
  pillText: { fontSize: 16, fontWeight: "700" },
  recommendationBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recommendTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 15,
  },
  recommendSub: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  actionBlock: { gap: 15 },
  primaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryBtnText: { fontSize: 18, fontWeight: "800" },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
  },
  secondaryBtnText: { fontSize: 18, fontWeight: "800" },
});

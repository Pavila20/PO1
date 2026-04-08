import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Beaker } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

import { savePourProfile } from "../src/backend/api/database";
import { getSessionUser } from "../src/backend/auth/session";

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const [sliderValue, setSliderValue] = useState(8);
  const [isSaving, setIsSaving] = useState(false);

  const bgColor = isDark ? colors.background : "#FFF1E5";
  const textColor = isDark ? colors.text : "#9C4400";
  const subtextColor = isDark ? colors.subtext : "#896D59";
  const btnBgColor = isDark ? colors.primaryButton : "#FFDEBA";
  const btnTextColor = isDark ? "#F0CEAB" : "#000000";
  const trackBgColor = isDark ? "#333333" : "#E5E5E5";

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const user = await getSessionUser();
      const realUserId = user?.sub || "unknown-user";

      // 1. Temperature Mapping: 191°F to 205°F
      const calculatedTemp = Math.round(190 + sliderValue);

      // 2. Grind Size Mapping: 29 (Coarse) to 15 (Fine)
      const calculatedGrind = Math.round(30 - sliderValue);

      // 3. NEW Bean Weight Mapping: 12g to 28g (Linear mapping for 1-15 scale)
      // Formula: 12 + (sliderValue - 1) * (total_range / steps)
      const calculatedWeight = Math.round(12 + (sliderValue - 1) * (16 / 14));

      // Save the profile and capture the returned object (with the safe, unique ID!)
      const savedProfile = await savePourProfile({
        userId: realUserId,
        name: "My Perfect Cup",
        targetTemp: calculatedTemp,
        grindSize: calculatedGrind,
        coffeeWeight: calculatedWeight,
        waterVolume: 250,
        bloomTime: 30,
        dispenseRate: 3.5,
        isDefault: false,
        profileId: `ai-optimized`, // Our backend logic will automatically prepend the userId to this
      });

      await AsyncStorage.setItem("user_coffee_pref", sliderValue.toString());

      // Navigate to the details screen first, NOT straight to brewing!
      router.replace({
        pathname: "/coffee-details",
        params: {
          name: "My Perfect Cup",
          strength: "Custom",
          isCustom: "true",
          recipeId: savedProfile.profileId, // We use the safe, guaranteed ID from DynamoDB
        },
      });
    } catch (error) {
      console.error("Failed to save baseline to cloud:", error);
      Alert.alert("Error", "Could not save your profile to the cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: btnBgColor }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          <ArrowLeft color={btnTextColor} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Taste Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Beaker color={textColor} size={64} />
        </View>

        <Text style={[styles.label, { color: textColor }]}>
          Set your baseline strength preference:
        </Text>

        <Text style={[styles.sliderValueText, { color: btnBgColor }]}>
          {sliderValue}
        </Text>

        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={sliderValue}
          onValueChange={setSliderValue}
          minimumTrackTintColor={btnBgColor}
          maximumTrackTintColor={trackBgColor}
          thumbTintColor={btnBgColor}
        />

        <View style={styles.sliderLabelsRow}>
          <Text style={[styles.sliderSubLabel, { color: subtextColor }]}>
            Weak
          </Text>
          <Text style={[styles.sliderSubLabel, { color: subtextColor }]}>
            Strong
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <Text style={[styles.infoText, { color: subtextColor }]}>
          We will use this to brew your first cup. After you rate it, the
          machine will learn and automatically adjust for next time!
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: btnBgColor }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={[styles.primaryBtnText, { color: btnTextColor }]}>
            {isSaving ? "Saving..." : "Create My Profile"}
          </Text>
        </TouchableOpacity>
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
  iconContainer: { alignItems: "center", marginBottom: 30 },
  label: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  sliderValueText: {
    fontSize: 48,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 5,
  },
  sliderLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  sliderSubLabel: { fontSize: 14, fontWeight: "600" },
  infoText: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryBtnText: { fontSize: 18, fontWeight: "800" },
});

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

      // Convert the 1-15 baseline into temp and grind
      const calculatedTemp = Math.round(190 + sliderValue);
      const calculatedGrind = Math.round(30 - sliderValue);

      // Save the baseline to AWS using the AI ID!
      await savePourProfile({
        userId: realUserId,
        name: "My Perfect Cup",
        targetTemp: calculatedTemp,
        grindSize: calculatedGrind,
        waterVolume: 250,

        // --- ADD THESE 3 NEW PARAMETERS HERE ---
        coffeeWeight: 20,
        bloomTime: 30,
        dispenseRate: 3.5,
        // ---------------------------------------

        isDefault: false,
        profileId: `ai-optimized-${realUserId}`,
      });

      await AsyncStorage.setItem("user_coffee_pref", sliderValue.toString());

      // --- THE FIX: GO STRAIGHT TO BREWING ---
      router.replace({
        pathname: "/active-brew",
        params: {
          name: "My Perfect Cup",
          strength: "Custom",
          isCustom: "true",
          recipeId: `ai-optimized-${realUserId}`,
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
          How would you like your coffee
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

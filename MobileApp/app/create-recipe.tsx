import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

import { savePourProfile } from "../src/backend/api/database";
import { getSessionUser } from "../src/backend/auth/session";
import { GradientButton } from "../src/components/auth/AuthControls";
import HeartCupIcon from "../src/components/HeartCupIcon";
import ScreenShell from "../src/components/ScreenShell";
import {
  Glass,
  Motion,
  Pop,
  Radii,
  SoftShadow,
} from "../src/constants/DesignSystem";

// Friendly word for where the slider sits (1-20)
const describe = (v: number) => (v <= 7 ? "Mild" : v <= 14 ? "Balanced" : "Bold");

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const glass = isDark ? Glass.dark : Glass.light;
  const pop = isDark ? Pop.dark : Pop.light;

  const [sliderValue, setSliderValue] = useState(8);
  const [isSaving, setIsSaving] = useState(false);

  const trackBgColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(148,102,86,0.2)";

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
    <ScreenShell
      title="Taste Profile"
      onBack={() => router.back()}
      backDisabled={isSaving}
      contentStyle={styles.content}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.6, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={Motion.spring}
        style={styles.iconContainer}
      >
        <MotiView
          from={{ translateY: 0, rotate: "-3deg" }}
          animate={{ translateY: -6, rotate: "3deg" }}
          transition={{
            type: "timing",
            duration: 2600,
            loop: true,
            repeatReverse: true,
          }}
        >
          <HeartCupIcon width={130} />
        </MotiView>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ ...Motion.spring, delay: 150 }}
        style={[
          styles.card,
          {
            backgroundColor: glass.surface,
            borderColor: glass.border,
            ...SoftShadow,
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.text }]}>
          Set your baseline strength preference
        </Text>

        <Text style={[styles.sliderValueText, { color: pop }]}>
          {sliderValue}
        </Text>
        <Text style={[styles.descriptor, { color: colors.subtext }]}>
          {describe(sliderValue)}
        </Text>

        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={sliderValue}
          onValueChange={setSliderValue}
          minimumTrackTintColor={pop}
          maximumTrackTintColor={trackBgColor}
          thumbTintColor={pop}
        />

        <View style={styles.sliderLabelsRow}>
          <Text style={[styles.sliderSubLabel, { color: colors.subtext }]}>
            Weak
          </Text>
          <Text style={[styles.sliderSubLabel, { color: colors.subtext }]}>
            Strong
          </Text>
        </View>
      </MotiView>

      <View style={{ flex: 1 }} />

      <Text style={[styles.infoText, { color: colors.subtext }]}>
        We will use this to brew your first cup. After you rate it, the machine
        will learn and automatically adjust for next time!
      </Text>

      <GradientButton
        label={isSaving ? "Saving..." : "Create My Profile"}
        onPress={handleSave}
        loading={isSaving}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 6 },
  iconContainer: { alignItems: "center", marginBottom: 18 },
  card: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: 22,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  sliderValueText: {
    fontSize: 56,
    fontWeight: "800",
    textAlign: "center",
  },
  descriptor: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
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
    marginBottom: 18,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
});

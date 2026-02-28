// app/create-recipe.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Beaker } from "lucide-react-native";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const [recipeName, setRecipeName] = useState("");
  const [sliderValue, setSliderValue] = useState(8); // Default to middle value (8)

  // Theme Colors
  const bgColor = isDark ? colors.background : "#FFF1E5";
  const textColor = isDark ? colors.text : "#9C4400";
  const subtextColor = isDark ? colors.subtext : "#896D59";
  const btnBgColor = isDark ? colors.primaryButton : "#FFDEBA";
  const btnTextColor = isDark ? "#F0CEAB" : "#000000";
  const inputBgColor = isDark ? "#1C1917" : "#FFFFFF";
  const trackBgColor = isDark ? "#333333" : "#E5E5E5";

  const handleSave = async () => {
    // 1. Save new recipe
    const newRecipe = {
      id: Date.now().toString(),
      name: recipeName,
      strength: `Strength: ${sliderValue}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const existingStr = await AsyncStorage.getItem("user_recipes");
    const recipes = existingStr ? JSON.parse(existingStr) : [];
    recipes.push(newRecipe);

    await AsyncStorage.setItem("user_recipes", JSON.stringify(recipes));

    // 2. Save this as their new overall preference (storing the number)
    await AsyncStorage.setItem("user_coffee_pref", sliderValue.toString());

    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: btnBgColor }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft color={btnTextColor} size={24} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>New Recipe</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Beaker color={textColor} size={64} />
          </View>

          <Text style={[styles.label, { color: textColor }]}>
            How bitter do you like your coffee?
          </Text>

          <Text style={[styles.sliderValueText, { color: btnBgColor }]}>
            {sliderValue}
          </Text>

          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={1}
            maximumValue={15}
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

          <Text style={[styles.label, { color: textColor, marginTop: 40 }]}>
            Give your recipe a name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: inputBgColor,
                color: textColor,
                borderColor: btnBgColor,
              },
            ]}
            placeholder="e.g. Morning Kicker"
            placeholderTextColor={subtextColor}
            value={recipeName}
            onChangeText={setRecipeName}
          />

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: btnBgColor }]}
            onPress={handleSave}
            disabled={!recipeName.trim()}
          >
            <Text
              style={[
                styles.primaryBtnText,
                { color: btnTextColor, opacity: recipeName.trim() ? 1 : 0.5 },
              ]}
            >
              Save Recipe
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  input: {
    height: 60,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: "600",
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryBtnText: { fontSize: 18, fontWeight: "800" },
});

// app/coffee-details.tsx

import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

// Map the coffee names to your local assets
const coffeeImages: Record<string, any> = {
  "Medium Coffee": require("../assets/images/CreamLatteCoffeeIcon.png"),
  "Dark Coffee": require("../assets/images/DarkCoffeeIcon.png"),
  "Light Coffee": require("../assets/images/LightCoffeeIcon.png"),
};

type BitternessLevel = "Low" | "Medium" | "High";

// Custom Bean SVG Component
const CustomBean = ({ color = "#A9612F", size = 29 }) => (
  <Svg height={size} width={size} fill="none" viewBox="0 0 29 29">
    <Path
      d="M22.5044 22.5034C16.6948 28.3107 8.36376 29.3975 3.89734 24.9288C-0.573655 20.4601 0.515492 12.1313 6.32275 6.32178C12.1346 0.514517 20.4657 -0.572342 24.9321 3.89637C29.4008 8.36278 28.3116 16.6938 22.5044 22.5034Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.28812"
    />
    <Path
      d="M24.9289 3.89648C24.9289 3.89648 24.1212 9.55959 20.8835 12.795C17.6481 16.0304 11.1773 12.795 7.94189 16.0304C4.70419 19.2658 3.89648 24.9312 3.89648 24.9312"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.28812"
    />
  </Svg>
);

export default function CoffeeDetailsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Grab parameters from Home
  const { name, strength } = useLocalSearchParams();
  const coffeeName = (name as string) || "Light Coffee";
  const coffeeImage = coffeeImages[coffeeName] || coffeeImages["Light Coffee"];

  // Map the passed string ("Weak", "Strong", "Light") to our 3 pill states
  // Since it's a recommended coffee, it stays fixed on this value.
  const bitterness: BitternessLevel =
    strength === "Strong" ? "High" : strength === "Medium" ? "Medium" : "Low";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* --- Top Bar --- */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primaryButton }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text
          style={[styles.title, { color: isDark ? "#f0ceab" : colors.text }]}
        >
          {coffeeName}
        </Text>
        {/* Empty view for flexbox centering balance */}
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Main Image Card (Nested Squares) --- */}
        <View
          style={[
            styles.outerImageCard,
            { backgroundColor: colors.primaryButton },
          ]}
        >
          <View
            style={[
              styles.innerImageCard,
              { backgroundColor: isDark ? "#E6B786" : "#F0CEAB" },
            ]}
          >
            <Image
              source={coffeeImage}
              style={styles.mainImage}
              contentFit="contain"
            />
          </View>
        </View>

        {/* --- Coffee Information Text --- */}
        <View style={styles.infoSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#f0ceab" : colors.text },
            ]}
          >
            Coffee Information
          </Text>
          <Text
            style={[
              styles.bitternessTitle,
              { color: isDark ? "#f0ceab" : colors.text },
            ]}
          >
            Bitterness
          </Text>
        </View>

        {/* --- Static Bitterness Pill Display --- */}
        <View style={styles.selectorSection}>
          <View
            style={[
              styles.pillContainer,
              { backgroundColor: colors.primaryButton },
            ]}
          >
            {/* Low Highlight */}
            <View
              style={[
                styles.beanCircle,
                bitterness === "Low" && styles.beanCircleActive,
              ]}
            >
              <CustomBean
                size={28}
                color={bitterness === "Low" ? "#A9612F" : "rgba(0,0,0,0.2)"}
              />
            </View>

            {/* Medium Highlight */}
            <View
              style={[
                styles.beanCircle,
                bitterness === "Medium" && styles.beanCircleActive,
              ]}
            >
              <CustomBean
                size={28}
                color={bitterness === "Medium" ? "#A9612F" : "rgba(0,0,0,0.2)"}
              />
            </View>

            {/* High Highlight */}
            <View
              style={[
                styles.beanCircle,
                bitterness === "High" && styles.beanCircleActive,
              ]}
            >
              <CustomBean
                size={28}
                color={bitterness === "High" ? "#A9612F" : "rgba(0,0,0,0.2)"}
              />
            </View>
          </View>

          {/* Labels Row */}
          <View style={styles.labelsRow}>
            <Text
              style={[
                styles.labelText,
                { color: isDark ? "#fff" : colors.text },
              ]}
            >
              Low
            </Text>
            <Text
              style={[
                styles.labelText,
                { color: isDark ? "#fff" : colors.text },
              ]}
            >
              Medium
            </Text>
            <Text
              style={[
                styles.labelText,
                { color: isDark ? "#fff" : colors.text },
              ]}
            >
              High
            </Text>
          </View>
        </View>

        {/* --- Continue Button --- */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primaryButton },
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  title: {
    fontFamily: "serif",
    fontSize: 24,
    fontWeight: "800",
  },
  scrollContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 40,
  },
  // Image Card Styling
  outerImageCard: {
    width: 280,
    height: 330,
    borderRadius: 35,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  innerImageCard: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  mainImage: {
    width: "85%",
    height: "85%",
  },
  // Info Text
  infoSection: {
    alignItems: "center",
    gap: 12,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  bitternessTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  // Selector Pill Styling
  selectorSection: {
    alignItems: "center",
    width: "100%",
    marginBottom: 40,
  },
  pillContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 260,
    height: 70,
    borderRadius: 35,
    paddingHorizontal: 8,
  },
  beanCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  beanCircleActive: {
    backgroundColor: "rgba(240, 206, 171, 0.9)", // Glowing beige background
    shadowColor: "#F97E02",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 230,
    marginTop: 10,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    width: 60, // Fixed width to align cleanly under the circular elements
  },
  // Footer Button
  continueButton: {
    width: 260,
    height: 55,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#F0CEAB",
    fontSize: 18,
    fontWeight: "700",
  },
});

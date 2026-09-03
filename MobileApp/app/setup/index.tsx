import { useRouter } from "expo-router";
import { Image } from "expo-image"; // optimized image component
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

export default function SetupStart() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* 1. Top Decoration Group */}
      <View style={styles.decorationGroup}>
        {/* Large faint circle */}
        <View style={styles.bgShade} />
        {/* Small faint circle */}
        <View style={styles.smallCircle} />
      </View>

      {/* 2. Greeting Text */}
      <View style={styles.greetingContainer}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Turn on your coffee maker</Text>
        </View>
        <Text style={styles.subtitle}>Continue when it's on.</Text>
      </View>

      {/* 3. Main Content (Image + Button) */}
      <View style={styles.content}>
        {/* Machine Image Placeholder */}
        <View style={styles.imageContainer}>
          {/* Replace with your actual image asset when available */}
          <Image source={require("../../assets/images/PO1.png")} style={styles.machineImage} contentFit="contain" />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/setup/search")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // .element-connect-machine
  container: {
    flex: 1,
    backgroundColor: "#2c2929", // Dark background from CSS
    alignItems: "center",
    paddingHorizontal: 21,
    paddingTop: 34,
  },

  // .group
  decorationGroup: {
    height: 122,
    width: "100%",
    position: "relative",
    marginBottom: 20, // spacing between deco and text
  },
  // .bg-shade
  bgShade: {
    backgroundColor: "rgba(169, 97, 47, 0.44)", // #a9612f70 converted roughly
    borderRadius: 61,
    height: 122,
    width: 122,
    position: "absolute",
    right: 20, // positioning approximated from "left: calc(50% + 44px)"
    top: 0,
  },
  // .div (small circle)
  smallCircle: {
    backgroundColor: "rgba(169, 97, 47, 0.44)",
    borderRadius: 19.5,
    height: 39,
    width: 39,
    position: "absolute",
    left: 20, // positioning approximated
    bottom: 20,
  },

  // .greeting-text
  greetingContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  // .text-wrapper
  title: {
    color: "#f0ceab",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    textAlign: "center",
    width: "100%",
  },
  titleWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 5,
  },
  // .continue-when-it-s
  subtitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    width: "100%",
  },

  // .content
  content: {
    flex: 1,
    justifyContent: "center", // Vertical centering
    alignItems: "center",
    width: "100%",
    gap: 58, // Gap between image and button
    paddingBottom: 50,
  },

  // .image (The container box)
  imageContainer: {
    backgroundColor: "#a9612f",
    borderRadius: 26,
    height: 125,
    width: 125,
    justifyContent: "center",
    alignItems: "center",
    // Shadow for depth (optional, based on "modern" feel)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  machineImage: {
    width: 82,
    height: 109,
  },

  // .get-started-button
  primaryButton: {
    backgroundColor: "#a9612f",
    borderRadius: 59,
    height: 58,
    width: 326,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "100%",
  },
  // .text-wrapper-2
  buttonText: {
    color: "#f0ceab",
    fontSize: 20,
    fontWeight: "600",
  },
});

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 1. Image Section with Gradient 
        Matches CSS: linear-gradient(180deg, rgba(249, 233, 207, 1) 0%, ...)
      */}
      <View style={styles.imageSection}>
        <LinearGradient
          colors={[
            "rgba(249, 233, 207, 1)", // 0%
            "rgba(234, 201, 149, 1)", // 38%
            "rgba(196, 131, 65, 1)", // 75%
          ]}
          locations={[0, 0.38, 0.75]}
          style={styles.gradient}
        >
          {/* Using the Coffee Beans image you uploaded */}
          <Image
            source={require("../assets/images/SignIn-Image.png")}
            style={styles.image}
            resizeMode="cover"
          />
        </LinearGradient>
      </View>

      {/* 2. Content Section
        Matches .div and .buttons classes
      */}
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Title & Subtitle */}
          <View style={styles.textWrapper}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Unlock the power of automation in your daily coffee routine.
            </Text>
          </View>

          {/* Buttons Section */}
          <View style={styles.buttonsWrapper}>
            {/* Sign In Button (Height 52px, Radius 45px) */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/auth/login")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Sign in</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Or login with</Text>

            {/* Google Button - Keeping styling consistent with your design system */}
            <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
              <View style={styles.googleIconCircle}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.primaryButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Divider Line */}
            <View style={styles.divider} />

            {/* Terms Text */}
            <Text style={styles.footerText}>
              By using this app, you agree to our{" "}
              <Text style={styles.linkText}>Privacy policy</Text> and{" "}
              <Text style={styles.linkText}>Terms of use</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // --- Image Section ---
  imageSection: {
    height: "55%", // Matches approx 478px / 874px
    width: "100%",
    position: "absolute",
    top: 0,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    // CSS had mix-blend-mode: multiply.
    // On RN, 'overlay' or just opacity sometimes works, but default cover is safest.
    opacity: 0.8,
  },

  // --- Content Section ---
  safeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  textWrapper: {
    alignItems: "center",
    paddingHorizontal: 34,
    marginBottom: 29, // Matches gap: 29px
  },
  title: {
    fontFamily: "serif", // Matches "Domine"
    fontSize: 25,
    fontWeight: "700",
    color: "#0F0F0F", // var(--primitives-base-black)
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7E7E7E", // var(--primitives-grey-700)
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },

  // --- Buttons ---
  buttonsWrapper: {
    paddingHorizontal: 34,
    alignItems: "center",
    gap: 16, // Matches CSS gap: 16px
  },
  primaryButton: {
    width: "100%",
    height: 52, // Matches CSS height: 52px
    borderRadius: 45,
    backgroundColor: "#0F0F0F", // var(--primitives-base-black)
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600", // Medium/SemiBold
  },
  orText: {
    fontSize: 12,
    color: "#6C7278", // var(--mode-grey)
    marginVertical: 4,
  },
  googleButton: {
    width: "100%",
    height: 52,
    borderRadius: 45,
    backgroundColor: "#C5281B", // Keeping the red from your previous design
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  googleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  googleIconText: {
    color: "#C5281B",
    fontWeight: "bold",
    fontSize: 16,
  },

  // --- Footer ---
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#E0E3EF",
    marginVertical: 10,
  },
  footerText: {
    fontSize: 12,
    color: "#7E7E7E",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#7E7E7E",
  },
});

// app/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithGoogle } from "../src/auth/cognitoGoogle";
import { isLoggedIn } from "../src/auth/session";

export default function Welcome() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // --- Auto Login Check ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
          const hasSetup = await AsyncStorage.getItem("is_setup_complete");
          if (hasSetup === "true") {
            router.replace("/(tabs)/home");
          } else {
            router.replace("/setup");
          }
        } else {
          setIsChecking(false);
        }
      } catch (e) {
        setIsChecking(false);
      }
    };
    checkSession();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();

      const hasSetup = await AsyncStorage.getItem("is_setup_complete");
      if (hasSetup === "true") {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/setup");
      }
    } catch (error: any) {
      if (error.message !== "Login cancelled/failed") {
        Alert.alert("Google Sign-In Error", error.message);
      }
    }
  };

  // Show a blank screen while checking the session to prevent flashing the login screen
  if (isChecking) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageSection}>
        <LinearGradient
          colors={[
            "rgba(249, 233, 207, 1)",
            "rgba(234, 201, 149, 1)",
            "rgba(196, 131, 65, 1)",
          ]}
          locations={[0, 0.38, 0.75]}
          style={styles.gradient}
        >
          <Image
            source={require("../assets/images/SignIn-Image.png")}
            style={styles.image}
            resizeMode="cover"
          />
        </LinearGradient>
      </View>

      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Unlock the power of automation in your daily coffee routine.
            </Text>
          </View>

          <View style={styles.buttonsWrapper}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/auth/login")}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Sign in</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>Or login with</Text>

            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.8}
              onPress={handleGoogleSignIn}
            >
              <View style={styles.googleIconCircle}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.primaryButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  imageSection: { height: "55%", width: "100%", position: "absolute", top: 0 },
  gradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "100%", opacity: 0.8 },
  safeArea: { flex: 1, justifyContent: "flex-end" },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  textWrapper: {
    alignItems: "center",
    paddingHorizontal: 34,
    marginBottom: 29,
  },
  title: {
    fontFamily: "serif",
    fontSize: 25,
    fontWeight: "700",
    color: "#0F0F0F",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7E7E7E",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  buttonsWrapper: { paddingHorizontal: 34, alignItems: "center", gap: 16 },
  primaryButton: {
    width: "100%",
    height: 52,
    borderRadius: 45,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  orText: { fontSize: 12, color: "#6C7278", marginVertical: 4 },
  googleButton: {
    width: "100%",
    height: 52,
    borderRadius: 45,
    backgroundColor: "#C5281B",
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
  googleIconText: { color: "#C5281B", fontWeight: "bold", fontSize: 16 },
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
  linkText: { textDecorationLine: "underline", color: "#7E7E7E" },
});

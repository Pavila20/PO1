// app/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { signInWithGoogle } from "../src/backend/auth/cognitoGoogle";
import { isLoggedIn } from "../src/backend/auth/session";
import BeanBackground from "../src/components/BeanBackground";
import HeartCupIcon from "../src/components/HeartCupIcon";
import {
  Accent,
  Glass,
  Gradients,
  Latte,
  Motion,
  Orbs,
  Pop,
  Radii,
  SoftShadow,
} from "../src/constants/DesignSystem";

export default function Welcome() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const g = isDark ? Gradients.dark : Gradients.light;
  const glass = isDark ? Glass.dark : Glass.light;
  const pop = isDark ? Pop.dark : Pop.light;
  const accent = isDark ? Accent.dark : Accent.light;
  const latte = isDark ? Latte.dark : Latte.light;
  const beanOpacity = isDark ? Orbs.dark.opacity : Orbs.light.opacity;
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

  // Same gradient while checking the session, so there is no flash of a
  // different screen before auto-login redirects
  if (isChecking) {
    return <LinearGradient colors={g.screen} style={{ flex: 1 }} />;
  }

  return (
    <LinearGradient colors={g.screen} style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <BeanBackground colors={[pop, latte, accent]} opacity={beanOpacity} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heroArea}>
          {/* Soft halo behind the cup */}
          <MotiView
            from={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...Motion.springSoft, delay: 100 }}
            style={styles.haloWrap}
          >
            <LinearGradient
              colors={g.heroSoft}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.halo, SoftShadow]}
            />
          </MotiView>

          {/* Cup pops in, then bobs gently forever */}
          <MotiView
            from={{ opacity: 0, scale: 0.5, translateY: 30 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ ...Motion.spring, delay: 250 }}
          >
            <MotiView
              from={{ translateY: 0, rotate: "-3deg" }}
              animate={{ translateY: -10, rotate: "3deg" }}
              transition={{
                type: "timing",
                duration: 2600,
                loop: true,
                repeatReverse: true,
              }}
            >
              <HeartCupIcon width={200} />
            </MotiView>
          </MotiView>
        </View>

        <View style={styles.bottom}>
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...Motion.spring, delay: 450 }}
            style={styles.textWrapper}
          >
            <Text style={[styles.brand, { color: pop }]}>PourOver1</Text>
            <Text style={[styles.title, { color: colors.text }]}>Welcome</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              Unlock the power of automation in your daily coffee routine.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...Motion.spring, delay: 600 }}
            style={styles.buttonsWrapper}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/auth/login")}
              style={styles.fullWidth}
            >
              <LinearGradient
                colors={[pop, accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.primaryButton, SoftShadow]}
              >
                <Text style={styles.primaryButtonText}>Sign in</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={[styles.orLine, { backgroundColor: glass.border }]} />
              <Text style={[styles.orText, { color: colors.subtext }]}>
                or continue with
              </Text>
              <View style={[styles.orLine, { backgroundColor: glass.border }]} />
            </View>

            <TouchableOpacity
              style={[
                styles.googleButton,
                {
                  backgroundColor: glass.surface,
                  borderColor: glass.border,
                  ...SoftShadow,
                },
              ]}
              activeOpacity={0.85}
              onPress={handleGoogleSignIn}
            >
              <View style={styles.googleIconCircle}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={[styles.googleButtonText, { color: colors.text }]}>
                Google
              </Text>
            </TouchableOpacity>

            <Text style={[styles.footerText, { color: colors.subtext }]}>
              By using this app, you agree to our{" "}
              <Text style={styles.linkText}>Privacy policy</Text> and{" "}
              <Text style={styles.linkText}>Terms of use</Text>
            </Text>
          </MotiView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  heroArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  haloWrap: { position: "absolute" },
  halo: { width: 270, height: 270, borderRadius: 135, opacity: 0.85 },
  bottom: { paddingHorizontal: 30, paddingBottom: 18 },
  textWrapper: { alignItems: "center", marginBottom: 26 },
  brand: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontFamily: "serif",
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 23,
    maxWidth: 310,
  },
  buttonsWrapper: { alignItems: "center", gap: 14 },
  fullWidth: { width: "100%" },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: Radii.pill,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, width: "100%" },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 12 },
  googleButton: {
    width: "100%",
    height: 56,
    borderRadius: Radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  googleIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  googleIconText: { color: "#DB4437", fontWeight: "800", fontSize: 16 },
  googleButtonText: { fontSize: 16, fontWeight: "700" },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  linkText: { textDecorationLine: "underline" },
});

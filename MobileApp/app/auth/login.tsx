import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Pop } from "../../src/constants/DesignSystem";

// --- AWS Auth Imports ---
import { signInWithGoogle } from "../../src/backend/auth/cognitoGoogle";
import { signInEmailPassword } from "../../src/backend/auth/emailPassword";

import { CoffeeWithCreamIcon } from "../../src/components/icons/CoffeeIcons";
import AuthScreen from "../../src/components/auth/AuthScreen";
import {
  GlassInput,
  GoogleButton,
  GradientButton,
  OrDivider,
} from "../../src/components/auth/AuthControls";

export default function LoginScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const pop = theme === "dark" ? Pop.dark : Pop.light;

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRememberedEmail();
  }, []);

  const loadRememberedEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch (e) {
      console.log("Failed to load email");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInEmailPassword(email, password);
      await AsyncStorage.setItem("remembered_email", email);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      let msg = error.message;
      if (msg.toLowerCase().includes("not confirmed")) {
        Alert.alert(
          "Account Not Confirmed",
          "Please check your email for the confirmation code.",
        );
      } else {
        Alert.alert("Login Failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();

      // FIX: Check if setup was previously completed
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

  return (
    <AuthScreen
      title="Welcome Back!"
      subtitle="Please enter your account here"
      onBack={() => router.back()}
      icon={<CoffeeWithCreamIcon size={104} />}
      footer={
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth/signup")}>
            <Text style={[styles.footerLink, { color: pop }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.fields}>
        <GlassInput
          icon={<Mail size={20} color={colors.inputIcon} />}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <GlassInput
          icon={<Lock size={20} color={colors.inputIcon} />}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          right={
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eye}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.inputIcon} />
              ) : (
                <Eye size={20} color={colors.inputIcon} />
              )}
            </TouchableOpacity>
          }
        />

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/auth/forgot-password",
              params: { email },
            })
          }
          style={styles.forgot}
        >
          <Text style={[styles.forgotText, { color: colors.subtext }]}>
            Forgot password?
          </Text>
        </TouchableOpacity>
      </View>

      <GradientButton label="Login" onPress={handleLogin} loading={loading} />

      <View style={styles.social}>
        <OrDivider />
        <GoogleButton onPress={handleGoogle} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 14, marginBottom: 18 },
  eye: { marginLeft: 10 },
  forgot: { alignSelf: "flex-end" },
  forgotText: { fontSize: 14 },
  social: { marginTop: 22, gap: 16 },
  footerRow: { flexDirection: "row", gap: 8 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "800" },
});

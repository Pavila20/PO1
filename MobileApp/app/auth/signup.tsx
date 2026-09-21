import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Pop } from "../../src/constants/DesignSystem";

// --- Auth Imports ---
import { signInWithGoogle } from "../../src/backend/auth/cognitoGoogle";
import { signUpEmailPassword } from "../../src/backend/auth/emailPassword";

import { CoffeeBagIcon } from "../../src/components/icons/CoffeeIcons";
import AuthScreen from "../../src/components/auth/AuthScreen";
import {
  GlassInput,
  GoogleButton,
  GradientButton,
  OrDivider,
} from "../../src/components/auth/AuthControls";

export default function SignUpScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const pop = theme === "dark" ? Pop.dark : Pop.light;

  // State
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.fullName) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await signUpEmailPassword(form.email, form.password, form.fullName);
      Alert.alert(
        "Success",
        "Account created! Please check your email for the code.",
      );

      // Navigate to separate Verify screen
      router.push({
        pathname: "/auth/verify",
        params: { email: form.email },
      });
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      router.replace("/setup");
    } catch (error: any) {
      if (error.message !== "Login cancelled/failed") {
        Alert.alert("Google Sign-In Error", error.message);
      }
    }
  };

  return (
    <AuthScreen
      title="Create Account"
      subtitle="Sign up to get started!"
      onBack={() => router.back()}
      icon={<CoffeeBagIcon size={104} />}
      footer={
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.subtext }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={[styles.footerLink, { color: pop }]}>Login</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.fields}>
        <GlassInput
          icon={<User size={20} color={colors.inputIcon} />}
          placeholder="Full Name"
          value={form.fullName}
          onChangeText={(t) => setForm({ ...form, fullName: t })}
        />

        <GlassInput
          icon={<Mail size={20} color={colors.inputIcon} />}
          placeholder="Email"
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <GlassInput
          icon={<Lock size={20} color={colors.inputIcon} />}
          placeholder="Create Password"
          secureTextEntry={!showPassword}
          value={form.password}
          onChangeText={(t) => setForm({ ...form, password: t })}
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
      </View>

      <GradientButton
        label="Sign Up"
        onPress={handleRegister}
        loading={loading}
      />

      <View style={styles.social}>
        <OrDivider />
        <GoogleButton onPress={handleGoogle} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 14, marginBottom: 20 },
  eye: { marginLeft: 10 },
  social: { marginTop: 22, gap: 16 },
  footerRow: { flexDirection: "row", gap: 8 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "800" },
});

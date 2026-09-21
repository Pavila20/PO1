import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import {
  forgotPasswordConfirm,
  forgotPasswordRequest,
  isStrongPassword,
  isValidEmail,
} from "../../src/backend/auth/emailPassword";
import { Pop } from "../../src/constants/DesignSystem";
import AuthScreen from "../../src/components/auth/AuthScreen";
import {
  GlassInput,
  GradientButton,
} from "../../src/components/auth/AuthControls";

// Two steps on one screen: 1) ask for the email and send a reset code,
// 2) enter the code plus a new password.
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const pop = theme === "dark" ? Pop.dark : Pop.light;
  const params = useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState(
    (Array.isArray(params.email) ? params.email[0] : params.email) ?? "",
  );
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!isValidEmail(email.trim())) {
      Alert.alert("Error", "Enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordRequest(email);
      setStep("reset");
      Alert.alert("Code sent", "Check your email for the reset code.");
    } catch (error: any) {
      Alert.alert("Couldn't send code", error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (code.trim().length < 6) {
      Alert.alert("Error", "Enter the 6-digit code from your email.");
      return;
    }
    if (!isStrongPassword(newPassword)) {
      Alert.alert(
        "Weak password",
        "Password must be 8+ chars and include upper/lower/number/special.",
      );
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordConfirm(email, code, newPassword);
      Alert.alert("Password updated", "You can now log in with your new password.");
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("Reset failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title={step === "email" ? "Forgot password?" : "Reset password"}
      subtitle={
        step === "email"
          ? "We'll email you a code to reset it"
          : `Enter the code we sent to ${email.trim()}`
      }
      onBack={() => (step === "reset" ? setStep("email") : router.back())}
      footer={
        step === "reset" ? (
          <TouchableOpacity onPress={sendCode} disabled={loading}>
            <Text style={[styles.link, { color: pop }]}>Send the code again</Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      {step === "email" ? (
        <View style={styles.fields}>
          <GlassInput
            icon={<Mail size={20} color={colors.inputIcon} />}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <GradientButton label="Send code" onPress={sendCode} loading={loading} />
        </View>
      ) : (
        <View style={styles.fields}>
          <GlassInput
            icon={<KeyRound size={20} color={colors.inputIcon} />}
            placeholder="6-digit code"
            value={code}
            onChangeText={(t) => setCode(t.slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
          />
          <GlassInput
            icon={<Lock size={20} color={colors.inputIcon} />}
            placeholder="New password"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
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
          <GradientButton
            label="Update password"
            onPress={resetPassword}
            loading={loading}
          />
        </View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  fields: { gap: 14 },
  eye: { marginLeft: 10 },
  link: { fontSize: 14, fontWeight: "800" },
});

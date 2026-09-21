import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import {
  confirmSignUp,
  resendConfirmationCode,
} from "../../src/backend/auth/emailPassword";
import { Glass, Pop, Radii } from "../../src/constants/DesignSystem";
import AuthScreen from "../../src/components/auth/AuthScreen";
import { GradientButton } from "../../src/components/auth/AuthControls";

export default function VerifyScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const pop = isDark ? Pop.dark : Pop.light;
  const glass = isDark ? Glass.dark : Glass.light;
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(192); // 3:12

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleConfirm = async () => {
    // Check for 6 digits
    if (!code || code.length < 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const emailStr = Array.isArray(email) ? email[0] : email;
      if (!emailStr) throw new Error("No email provided");

      await confirmSignUp(emailStr, code);
      Alert.alert("Success", "Email verified!");

      // FIX: Redirect to Setup Flow instead of Home
      router.replace("/setup");
    } catch (error: any) {
      Alert.alert("Verification Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const emailStr = Array.isArray(email) ? email[0] : email;
    if (!emailStr) {
      Alert.alert("Error", "No email provided");
      return;
    }
    setResending(true);
    try {
      await resendConfirmationCode(emailStr);
      setCode("");
      setTimer(192);
      Alert.alert("Code sent", "We sent a new code to your email.");
    } catch (error: any) {
      Alert.alert("Couldn't resend", error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthScreen
      title="Check your email"
      subtitle="We've sent the code to your email"
      onBack={() => router.back()}
    >
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={code}
        onChangeText={(t) => setCode(t.slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        caretHidden={true}
      />

      <Pressable style={styles.codeRow} onPress={() => inputRef.current?.focus()}>
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const digit = code[index] || "";
          const isFilled = index < code.length;
          const isNext = index === code.length;
          const active = isNext || isFilled;

          return (
            <MotiView
              key={index}
              animate={{ scale: isFilled ? 1.06 : 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              style={[
                styles.box,
                {
                  backgroundColor: isDark
                    ? colors.inputBackground
                    : "rgba(255,255,255,0.9)",
                  borderColor: active ? pop : glass.border,
                  borderWidth: active ? 2 : 1,
                },
              ]}
            >
              <Text style={[styles.boxText, { color: colors.inputText }]}>
                {digit}
              </Text>
            </MotiView>
          );
        })}
      </Pressable>

      <Text style={[styles.timerText, { color: colors.subtext }]}>
        Code expires in:{" "}
        <Text style={{ color: pop, fontWeight: "800" }}>{formatTime(timer)}</Text>
      </Text>

      <View style={styles.actions}>
        <GradientButton label="Verify" onPress={handleConfirm} loading={loading} />

        <TouchableOpacity
          onPress={handleResend}
          disabled={resending}
          style={[
            styles.resendButton,
            resending && { opacity: 0.6 },
            {
              backgroundColor: isDark ? glass.surface : "#fff",
              borderColor: glass.border,
            },
          ]}
        >
          <Text style={[styles.resendText, { color: colors.text }]}>
            Send again
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  hiddenInput: { position: "absolute", opacity: 0, width: 1, height: 1 },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  box: {
    flex: 1,
    aspectRatio: 0.85,
    maxHeight: 62,
    borderRadius: Radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  boxText: { fontSize: 24, fontWeight: "800" },
  timerText: { textAlign: "center", fontSize: 14, marginTop: 18 },
  actions: { marginTop: 22, gap: 14 },
  resendButton: {
    width: "100%",
    height: 54,
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  resendText: { fontSize: 16, fontWeight: "700" },
});

import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { confirmSignUp } from "../../src/auth/emailPassword";

export default function VerifyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Main Card */}
            <View style={[styles.card, { backgroundColor: colors.background }]}>
              {/* Top Illustration */}
              <Image
                source={require("../../assets/images/Group 36758 1.png")}
                style={styles.topIllustration}
                contentFit="contain"
              />

              <View style={styles.contentContainer}>
                {/* Inner Content Wrapper */}
                <View style={styles.innerContent}>
                  {/* Header Section */}
                  <View style={styles.headerSection}>
                    <TouchableOpacity
                      onPress={() => router.back()}
                      style={[styles.circleBackButton, { borderColor: colors.inputBorder }]}
                    >
                      <ArrowLeft size={24} color={colors.text} />
                    </TouchableOpacity>

                    <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
                    <Text style={[styles.subtitle, { color: colors.subtext }]}>
                      We’ve sent the code to your email
                    </Text>
                  </View>

                  {/* Code Input Section */}
                  <View style={styles.inputSection}>
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
                        const borderColor =
                          isNext || isFilled ? colors.primaryButton : colors.inputBorder;

                        return (
                          <View
                            key={index}
                            style={[
                              styles.box,
                              {
                                backgroundColor: colors.inputBackground,
                                borderColor: borderColor,
                              },
                            ]}
                          >
                            <Text style={[styles.boxText, { color: colors.inputText }]}>
                              {digit}
                            </Text>
                          </View>
                        );
                      })}
                    </Pressable>

                    <Text style={[styles.timerText, { color: colors.subtext }]}>
                      Code expires in:{" "}
                      <Text style={{ color: colors.primaryButton }}>{formatTime(timer)}</Text>
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionSection}>
                    <TouchableOpacity
                      style={[styles.verifyButton, { backgroundColor: colors.primaryButton }]}
                      onPress={handleConfirm}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.primaryButtonText} />
                      ) : (
                        <Text
                          style={[styles.verifyButtonText, { color: colors.primaryButtonText }]}
                        >
                          Verify
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.resendButton,
                        {
                          backgroundColor: colors.socialButtonBackground,
                          borderColor: colors.socialButtonBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.resendButtonText, { color: colors.socialButtonText }]}>
                        Send again
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* FIX: pointerEvents="none" added so clicks pass through to buttons */}
                <View style={styles.decorativeImageContainer} pointerEvents="none">
                  <Image
                    source={require("../../assets/images/Group 1547.svg")}
                    style={styles.decorativeImage}
                    contentFit="contain"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  card: { width: "100%", maxWidth: 480, alignSelf: "center" },
  topIllustration: { width: "100%", aspectRatio: 1.52, marginTop: -60 },
  contentContainer: { width: "100%", paddingHorizontal: 24 },
  innerContent: { width: "100%", maxWidth: 340, alignSelf: "center", alignItems: "center" },
  headerSection: { width: "100%", alignItems: "center", marginBottom: 30, position: "relative" },
  circleBackButton: {
    position: "absolute",
    left: 0,
    top: -5,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center", lineHeight: 35 },
  subtitle: { fontSize: 14, textAlign: "center", marginTop: 5 },
  inputSection: { width: "100%", alignItems: "center", gap: 15 },
  hiddenInput: { position: "absolute", width: 1, height: 1, opacity: 0 },
  codeRow: { flexDirection: "row", gap: 8, justifyContent: "center", width: "100%" },
  box: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  boxText: { fontSize: 24, fontWeight: "600" },
  timerText: { fontSize: 15, marginTop: 5, textAlign: "center" },
  actionSection: { width: "100%", alignItems: "center", gap: 13, marginTop: 30 },
  verifyButton: {
    width: 250,
    height: 55,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonText: { fontSize: 18, fontWeight: "600" },
  resendButton: {
    width: 250,
    height: 55,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resendButtonText: { fontSize: 18, fontWeight: "600" },
  decorativeImageContainer: {
    alignItems: "flex-end",
    marginTop: -120,
    marginRight: -24,
    zIndex: 10,
  },
  decorativeImage: { width: 61, height: 145 },
});

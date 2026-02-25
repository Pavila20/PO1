import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

// --- Auth Imports ---
import { signInWithGoogle } from "../../src/auth/cognitoGoogle";
import { signUpEmailPassword } from "../../src/auth/emailPassword";

interface HeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  showBack?: boolean;
}

function Header({ title, subtitle, onBack, showBack }: HeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.headerContainer}>
      {showBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
        {subtitle}
      </Text>
    </View>
  );
}

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();

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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card Container */}
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            {/* Top Illustration */}
            <Image
              source={require("../../assets/images/Group 36756.png")}
              style={styles.topIllustration}
              contentFit="contain"
            />

            <View style={styles.contentContainer}>
              <View style={styles.innerContent}>
                <Header
                  title="Create Account"
                  subtitle="Sign up to get started!"
                  showBack={false}
                />

                <View style={styles.formSection}>
                  {/* Full Name Input */}
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <User
                      size={20}
                      color={colors.inputIcon}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.inputText }]}
                      placeholder="Full Name"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={form.fullName}
                      onChangeText={(t) => setForm({ ...form, fullName: t })}
                    />
                  </View>

                  {/* Email Input */}
                  <View
                    style={[
                      styles.inputContainer,
                      styles.inputMargin,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <Mail
                      size={20}
                      color={colors.inputIcon}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.inputText }]}
                      placeholder="Email"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={form.email}
                      onChangeText={(t) => setForm({ ...form, email: t })}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  {/* Password Input */}
                  <View
                    style={[
                      styles.inputContainer,
                      styles.inputMargin,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <Lock
                      size={20}
                      color={colors.inputIcon}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.inputText }]}
                      placeholder="Create Password"
                      placeholderTextColor={colors.inputPlaceholder}
                      secureTextEntry={!showPassword}
                      value={form.password}
                      onChangeText={(t) => setForm({ ...form, password: t })}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={colors.inputIcon} />
                      ) : (
                        <Eye size={20} color={colors.inputIcon} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Main Sign Up Button */}
                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={loading}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.primaryButton },
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.primaryButtonText} />
                    ) : (
                      <Text
                        style={[
                          styles.actionButtonText,
                          { color: colors.primaryButtonText },
                        ]}
                      >
                        Sign Up
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Google Sign In */}
                  <View style={styles.socialSection}>
                    <Text
                      style={[
                        styles.socialText,
                        { color: colors.socialButtonTextLabel },
                      ]}
                    >
                      Or continue with
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.socialButton,
                        {
                          backgroundColor: colors.socialButtonBackground,
                          borderColor: colors.socialButtonBorder,
                        },
                      ]}
                      onPress={handleGoogle}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={require("../../assets/images/GoogleLogo.svg")}
                        style={styles.socialIcon}
                        contentFit="contain"
                      />
                      <Text
                        style={[
                          styles.socialButtonText,
                          { color: colors.socialButtonText },
                        ]}
                      >
                        Google
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* FIX: pointerEvents="none" added here as well */}
              <View
                style={styles.decorativeImageContainer}
                pointerEvents="none"
              >
                <Image
                  source={require("../../assets/images/Group 1547.svg")}
                  style={styles.decorativeImage}
                  contentFit="contain"
                />
              </View>

              {/* Footer */}
              <View style={styles.footerContainer}>
                <Text style={[styles.footerText, { color: colors.footerText }]}>
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/auth/login")}>
                  <Text style={[styles.signUpText, { color: colors.link }]}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  card: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingBottom: 10,
  },
  topIllustration: { width: "100%", aspectRatio: 1.52, marginTop: 0 },
  contentContainer: {
    width: "100%",
    paddingLeft: 24,
    paddingRight: 24,
    marginTop: 24,
  },
  innerContent: {
    width: "100%",
    maxWidth: 325,
    alignSelf: "center",
    alignItems: "center",
  },

  headerContainer: { alignItems: "center", marginBottom: 20, width: "100%" },
  backButton: {
    position: "absolute",
    left: -40,
    top: 2,
    padding: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 28,
    textAlign: "center",
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  formSection: { width: "100%", alignItems: "center" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
  },
  inputMargin: { marginTop: 14 },
  input: { flex: 1, fontSize: 14, height: "100%" },
  inputIcon: { marginRight: 10 },
  eyeIcon: { marginLeft: 10 },

  actionButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    width: 249,
    height: 50,
    borderRadius: 24,
  },
  actionButtonText: { fontSize: 18, lineHeight: 36, fontWeight: "500" },

  socialSection: { alignItems: "center", marginTop: 32, width: "100%" },
  socialText: { fontSize: 14, lineHeight: 28, textAlign: "center" },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 80,
    borderWidth: 1,
    borderRadius: 70,
    gap: 10,
  },
  socialIcon: { width: 18, height: 18 },
  socialButtonText: { fontSize: 16 },

  decorativeImageContainer: {
    alignItems: "flex-end",
    marginTop: -120,
    marginRight: -24,
    zIndex: 10,
  },
  decorativeImage: { width: 61, height: 145 },
  footerContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
    width: 236,
    justifyContent: "center",
  },
  footerText: { fontSize: 14 },
  signUpText: { fontSize: 14, fontWeight: "600" },
});

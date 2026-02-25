import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useEffect, useState } from "react";
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
import { useTheme } from "../../context/ThemeContext"; // <--- Import useTheme

// --- AWS Auth Imports ---
import { signInWithGoogle } from "../../src/auth/cognitoGoogle";
import { signInEmailPassword } from "../../src/auth/emailPassword";

// --- Sub-Components ---

interface WelcomeHeaderProps {
  title: string;
  subtitle: string;
}

function WelcomeHeader({ title, subtitle }: WelcomeHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.headerContainer}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
        {subtitle}
      </Text>
    </View>
  );
}

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  onForgotPassword: () => void;
  onSubmit: () => void;
  onGoogleSignIn: () => void;
  loading: boolean;
}

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  onForgotPassword,
  onSubmit,
  onGoogleSignIn,
  loading,
}: LoginFormProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.formWrapper}>
      <View style={styles.inputsColumn}>
        {/* Email Input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Mail size={20} color={colors.inputIcon} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.inputText }]}
            placeholder="Email"
            placeholderTextColor={colors.inputPlaceholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View
          style={[
            styles.inputContainer,
            styles.passwordMargin,
            {
              backgroundColor: colors.inputBackground,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Lock size={20} color={colors.inputIcon} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.inputText }]}
            placeholder="Password"
            placeholderTextColor={colors.inputPlaceholder}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
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

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={onForgotPassword}
          style={styles.forgotButton}
        >
          <Text style={[styles.forgotText, { color: colors.subtext }]}>
            Forgot password?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={loading}
        style={[styles.loginButton, { backgroundColor: colors.primaryButton }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryButtonText} />
        ) : (
          <Text
            style={[
              styles.loginButtonText,
              { color: colors.primaryButtonText },
            ]}
          >
            Login
          </Text>
        )}
      </TouchableOpacity>

      {/* Social Login Section */}
      <View style={styles.socialSection}>
        <Text
          style={[styles.socialText, { color: colors.socialButtonTextLabel }]}
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
          onPress={onGoogleSignIn}
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
  );
}

interface SignUpPromptProps {
  onSignUp: () => void;
}

function SignUpPrompt({ onSignUp }: SignUpPromptProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.footerContainer}>
      <Text style={[styles.footerText, { color: colors.footerText }]}>
        Don't have any account?
      </Text>
      <TouchableOpacity onPress={onSignUp}>
        <Text style={[styles.signUpText, { color: colors.link }]}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Main Screen Component ---
export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();

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
            {/* 1. Top Illustration */}
            <Image
              source={require("../../assets/images/Frame 427321851.svg")}
              style={styles.topIllustration}
              contentFit="contain"
            />

            <View style={styles.contentContainer}>
              <View style={styles.innerContent}>
                {/* Header */}
                <WelcomeHeader
                  title="Welcome Back!"
                  subtitle="Please enter your account here"
                />

                {/* Login Form */}
                <View style={styles.formSection}>
                  <LoginForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    onForgotPassword={() =>
                      Alert.alert("Reset Password", "Navigation to reset flow.")
                    }
                    onSubmit={handleLogin}
                    onGoogleSignIn={handleGoogle}
                    loading={loading}
                  />
                </View>
              </View>

              {/* 3. Decorative Side Image (Bottom Right) */}
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
              <SignUpPrompt onSignUp={() => router.push("/auth/signup")} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Styles (Structural only - Colors are handled by context) ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center", // Keeps content centered on taller screens
  },
  card: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingBottom: 10, // Reduced from 24 to lessen the bottom gap
    // REMOVED: minHeight: Dimensions.get("window").height
  },
  topIllustration: {
    width: "100%",
    aspectRatio: 1.52,
    marginTop: 0,
  },
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
  // Header
  headerContainer: {
    alignItems: "center",
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
    lineHeight: 28,
    textAlign: "center",
  },
  // Form Wrapper
  formSection: {
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },
  formWrapper: {
    width: "100%",
    alignItems: "center",
  },
  inputsColumn: {
    width: "100%",
    alignItems: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: "100%",
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: "100%",
  },
  inputIcon: {
    marginRight: 10,
  },
  passwordMargin: {
    marginTop: 14,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  forgotButton: {
    marginTop: 14,
  },
  forgotText: {
    fontSize: 14,
    lineHeight: 28,
    textAlign: "center",
  },
  // Login Button
  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    width: 249,
    height: 50,
    borderRadius: 24,
  },
  loginButtonText: {
    fontSize: 18,
    lineHeight: 36,
    fontWeight: "500",
  },
  // Social
  socialSection: {
    alignItems: "center",
    marginTop: 32,
    width: "100%",
  },
  socialText: {
    fontSize: 14,
    lineHeight: 28,
    textAlign: "center",
  },
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
  socialIcon: {
    width: 18,
    height: 18,
  },
  socialButtonText: {
    fontSize: 16,
  },
  // Decorative Image
  decorativeImageContainer: {
    alignItems: "flex-end",
    marginTop: -120,
    marginRight: -24,
    zIndex: 10,
  },
  decorativeImage: {
    width: 61,
    height: 145,
  },
  // Footer
  footerContainer: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
    gap: 8,
    width: 236,
  },
  footerText: {
    fontSize: 14,
    flex: 1,
  },
  signUpText: {
    fontSize: 14,
    textAlign: "right",
  },
});

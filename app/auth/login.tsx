import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/firebase";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRememberedEmail();
  }, []);

  const loadRememberedEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem("remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
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
      await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        await AsyncStorage.setItem("remembered_email", email);
      } else {
        await AsyncStorage.removeItem("remembered_email");
      }
      router.replace("/(tabs)/home");
    } catch (error: any) {
      let msg = error.message;
      if (error.code === "auth/invalid-credential")
        msg = "Invalid email or password.";
      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* --- BACKGROUND BLOBS (Larger & Smoother) --- */}

      {/* Top Left Ellipse */}
      <LinearGradient
        colors={["rgba(250, 208, 140, 0.9)", "rgba(196, 131, 65, 0.6)"]}
        style={styles.ellipseTop}
      />

      {/* Bottom Right Ellipse */}
      <LinearGradient
        colors={["rgba(245, 206, 144, 0.9)", "rgba(162, 93, 23, 0.6)"]}
        style={styles.ellipseBottom}
      />

      {/* --- MAIN CONTENT --- */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={28} color="#111827" />
          </TouchableOpacity>

          {/* Floating Card */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.textWrapper}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>
                Enter your email and password to log in
              </Text>
            </View>

            {/* Inputs */}
            <View style={styles.formGroup}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputArea}>
                  <TextInput
                    style={styles.input}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#9d9fa1"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputArea}>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9d9fa1"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#6C7278" />
                    ) : (
                      <Eye size={16} color="#6C7278" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Checkbox
                    style={styles.checkbox}
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    color={rememberMe ? "#000" : undefined}
                  />
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot Password ?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={handleLogin} disabled={loading}>
                <LinearGradient
                  colors={["#000000", "#000000"]}
                  style={styles.loginButton}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>Log In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.orContainer}>
                <View style={styles.line} />
                <Text style={styles.orText}>Or login with</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                <View style={styles.googleIconPlaceholder}>
                  <Text style={{ color: "#C5281B", fontWeight: "bold" }}>
                    G
                  </Text>
                </View>
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // --- Adjusted Gradient Sizes ---
  ellipseTop: {
    position: "absolute",
    width: 670, // Increased from 582
    height: 790, // Increased from 582
    left: -200,
    top: -310,
    borderRadius: 400,
    opacity: 0.8,
  },
  ellipseBottom: {
    position: "absolute",
    width: 900, // Increased from 934
    height: 950,
    right: -400,
    top: height * 0.5, // Position relative to screen height
    borderRadius: 500,
    opacity: 0.8,
  },

  safeArea: { flex: 1 },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    gap: 24,
  },
  textWrapper: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontFamily: "Inter",
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6C7278",
    textAlign: "center",
  },
  formGroup: {
    gap: 16,
    width: "100%",
  },
  fieldContainer: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6C7278",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#EDF1F3",
    borderWidth: 1,
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 14,
    shadowColor: "#E4E5E7",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1C1E",
    height: "100%",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderColor: "#6C7278",
    borderRadius: 4,
  },
  rememberText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6C7278",
  },
  forgotText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4D81E7",
  },
  buttonsContainer: {
    gap: 24,
    width: "100%",
  },
  loginButton: {
    height: 48,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#EDF1F3",
  },
  orText: {
    fontSize: 12,
    color: "#6C7278",
  },
  googleButton: {
    height: 52,
    borderRadius: 45,
    backgroundColor: "#C5281B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  googleIconPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: "white",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6C7278",
  },
  footerLink: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4D81E7",
  },
});

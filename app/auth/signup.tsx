import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  signUpEmailPassword,
  confirmSignUp,
} from "../../src/auth/emailPassword"; // AWS

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const router = useRouter();

  // State
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    phone: "",
    password: "",
  });

  // Confirmation Code
  const [code, setCode] = useState("");

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.firstName) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      // Pass Name as extra attribute if needed
      await signUpEmailPassword(form.email, form.password, form.firstName);
      setStep("confirm"); // Move to confirmation step
      Alert.alert(
        "Success",
        "Account created! Please check your email for the code.",
      );
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!code) {
      Alert.alert("Error", "Please enter the code sent to your email.");
      return;
    }
    setLoading(true);
    try {
      await confirmSignUp(form.email, code);
      Alert.alert("Success", "Email verified! Logging you in...");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Confirmation Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* --- BACKGROUND SHAPES --- */}
      <View style={styles.whiteCurveContainer}>
        <View style={styles.whiteCurve} />
      </View>

      <LinearGradient
        colors={["transparent", "rgba(162, 93, 23, 0.3)"]}
        style={styles.goldOverlay}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              step === "confirm" ? setStep("signup") : router.back()
            }
          >
            <ChevronLeft size={28} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.textWrapper}>
              <Text style={styles.title}>
                {step === "signup" ? "Sign Up" : "Confirm Email"}
              </Text>
              <Text style={styles.subtitle}>
                {step === "signup"
                  ? "Create an account to continue!"
                  : `Enter the code sent to ${form.email}`}
              </Text>
            </View>

            {/* Inputs Group */}
            <View style={styles.formGroup}>
              {step === "signup" ? (
                <>
                  {/* First Name */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.inputArea}>
                      <TextInput
                        style={styles.input}
                        placeholder="Lois"
                        placeholderTextColor="#1A1C1E"
                        value={form.firstName}
                        onChangeText={(t) => setForm({ ...form, firstName: t })}
                      />
                    </View>
                  </View>

                  {/* Last Name */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.inputArea}>
                      <TextInput
                        style={styles.input}
                        placeholder="Becket"
                        placeholderTextColor="#1A1C1E"
                        value={form.lastName}
                        onChangeText={(t) => setForm({ ...form, lastName: t })}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputArea}>
                      <TextInput
                        style={styles.input}
                        placeholder="Loisbecket@gmail.com"
                        placeholderTextColor="#1A1C1E"
                        value={form.email}
                        onChangeText={(t) => setForm({ ...form, email: t })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Set Password</Text>
                    <View style={styles.inputArea}>
                      <TextInput
                        style={styles.input}
                        placeholder="*******"
                        placeholderTextColor="#1A1C1E"
                        secureTextEntry={!showPassword}
                        value={form.password}
                        onChangeText={(t) => setForm({ ...form, password: t })}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="#6C7278" />
                        ) : (
                          <Eye size={18} color="#6C7278" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  {/* Confirmation Code Input */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Confirmation Code</Text>
                    <View style={styles.inputArea}>
                      <TextInput
                        style={styles.input}
                        placeholder="123456"
                        placeholderTextColor="#1A1C1E"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Action Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={step === "signup" ? handleRegister : handleConfirm}
                disabled={loading}
              >
                <LinearGradient
                  colors={["rgba(20, 20, 20, 1)", "rgba(0, 0, 0, 1)"]}
                  style={styles.registerButton}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.registerButtonText}>
                      {step === "signup" ? "Register" : "Verify & Login"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            {step === "signup" && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/auth/login")}>
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C49A6C", // Base gold color
  },
  // --- Background Shapes (Matches Login) ---
  whiteCurveContainer: {
    position: "absolute",
    top: height * 0.4,
    left: -width * 0.1,
    width: height * 0.8,
    height: height * 0.9,
    borderRadius: height * 0.45,
    backgroundColor: "#FFFFFF",
    transform: [{ scaleX: 1 }],
  },
  whiteCurve: {
    flex: 1,
    borderRadius: height * 0.45,
    backgroundColor: "#c49a6c59",
  },
  goldOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },

  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 50,
    justifyContent: "center",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    gap: 20, // Slightly tighter gap to fit more fields
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  textWrapper: {
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  title: {
    fontFamily: "Inter",
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6C7278",
    textAlign: "center",
  },
  formGroup: {
    gap: 14, // Consistent spacing between fields
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
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1C1E",
    height: "100%",
  },

  // Phone Specific Styles
  phoneContainer: {
    flexDirection: "row",
    gap: 10,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#EDF1F3",
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    width: 70,
    gap: 4,
  },
  phoneInputArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#EDF1F3",
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
  },

  buttonContainer: {
    marginTop: 10,
  },
  registerButton: {
    height: 52,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 5,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6C7278",
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4D81E7",
  },
});

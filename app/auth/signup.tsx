import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
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
import { auth } from "../../config/firebase";

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Here you would typically save the extra user data (name, phone, dob) to Firestore
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* --- BACKGROUND SHAPES --- */}

      {/* 1. The White Curve (Centered) */}
      <View style={styles.whiteCurveContainer}>
        <View style={styles.whiteCurve} />
      </View>

      {/* 2. The Gold Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(162, 93, 23, 0.3)"]}
        style={styles.goldOverlay}
        pointerEvents="none"
      />

      {/* --- MAIN CONTENT --- */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={28} color="#111827" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Floating Card */}
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.textWrapper}>
              <Text style={styles.title}>Sign Up</Text>
              <Text style={styles.subtitle}>
                Create an account to continue!
              </Text>
            </View>

            {/* Inputs Group */}
            <View style={styles.formGroup}>
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

              {/* Date of Birth */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Date of birth</Text>
                <View style={styles.inputArea}>
                  <TextInput
                    style={styles.input}
                    placeholder="18/03/2024"
                    placeholderTextColor="#1A1C1E"
                    value={form.dob}
                    onChangeText={(t) => setForm({ ...form, dob: t })}
                  />
                  <Calendar size={18} color="#6C7278" />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneContainer}>
                  {/* Country Code Mock */}
                  <View style={styles.countrySelector}>
                    <Text style={{ fontSize: 16 }}>🇬🇧</Text>
                    <ChevronDown size={14} color="#6C7278" />
                  </View>

                  <View style={styles.phoneInputArea}>
                    <TextInput
                      style={styles.input}
                      placeholder="(454) 726-0592"
                      placeholderTextColor="#1A1C1E"
                      value={form.phone}
                      onChangeText={(t) => setForm({ ...form, phone: t })}
                      keyboardType="phone-pad"
                    />
                  </View>
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
            </View>

            {/* Register Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleRegister} disabled={loading}>
                <LinearGradient
                  colors={["rgba(20, 20, 20, 1)", "rgba(0, 0, 0, 1)"]}
                  style={styles.registerButton}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.registerButtonText}>Register</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text style={styles.footerLink}>Login</Text>
              </TouchableOpacity>
            </View>
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

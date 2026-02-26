import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image"; // optimized image component
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle } from "lucide-react-native"; // Badge icon
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function SetupSuccess() {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      // Mark the general app setup as complete
      await AsyncStorage.setItem("is_setup_complete", "true");

      // 👇 NEW: Mark the specific machine as paired so home.tsx sees it!
      await AsyncStorage.setItem("isMachinePaired", "true");

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Failed to save setup status", error);
      router.replace("/(tabs)/home");
    }
  };
  // Inside your success component...
  const handleFinishSetup = async () => {
    // 👇 Save that the machine is successfully paired!
    await AsyncStorage.setItem("isMachinePaired", "true");

    // Navigate home
    router.replace("/(tabs)/home");
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Decoration Group */}
      <View style={styles.decorationGroup}>
        <View style={styles.bgShade} />
        <View style={styles.smallCircle} />
      </View>

      <View style={styles.greetingContainer}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>PourOver is ready to use</Text>
        </View>
        <Text style={styles.subtitle}>Let's brew some magic!</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/PO1.png")}
              style={styles.machineImage}
              contentFit="contain"
            />
            <View style={styles.badge}>
              <CheckCircle size={32} color="white" fill="#2c2929" />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGetStarted} // <--- Use the new handler
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Keep the styles from the previous step) ...
  container: {
    flex: 1,
    backgroundColor: "#2c2929",
    alignItems: "center",
    paddingTop: 34,
    paddingHorizontal: 21,
  },
  decorationGroup: {
    height: 122,
    width: "100%",
    position: "relative",
    marginBottom: 20,
  },
  bgShade: {
    backgroundColor: "rgba(169, 97, 47, 0.44)",
    borderRadius: 61,
    height: 122,
    width: 122,
    position: "absolute",
    right: 20,
    top: 0,
  },
  smallCircle: {
    backgroundColor: "rgba(169, 97, 47, 0.44)",
    borderRadius: 19.5,
    height: 39,
    width: 39,
    position: "absolute",
    left: 20,
    bottom: 20,
  },
  machineImage: {
    width: 82,
    height: 109,
  },
  greetingContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  titleWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    color: "#f0ceab",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    textAlign: "center",
    width: "100%",
  },
  subtitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    width: "100%",
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 50,
    gap: 24,
  },
  imageSection: {
    height: 226,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  imageContainer: {
    backgroundColor: "#a9612f",
    borderRadius: 26,
    height: 125,
    width: 125,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  badge: {
    position: "absolute",
    right: -10,
    bottom: -10,
    backgroundColor: "black",
    borderRadius: 16,
  },
  primaryButton: {
    backgroundColor: "#a9612f",
    borderRadius: 59,
    height: 58,
    width: 326,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#f0ceab",
    fontSize: 20,
    fontWeight: "600",
  },
});

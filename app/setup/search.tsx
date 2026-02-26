// app/setup/search.tsx

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { getMachineStatus } from "../../src/api/machine"; // Import our API

export default function SetupSearch() {
  const router = useRouter();
  const { colors } = useTheme();

  const [statusText, setStatusText] = useState("Searching for Machine...");

  useEffect(() => {
    const scanForMachine = async () => {
      const status = await getMachineStatus();

      if (status) {
        setStatusText("Machine Found!");
        // Wait a brief moment so the user sees the success message
        setTimeout(() => {
          router.push("/setup/connecting");
        }, 800);
      } else {
        setStatusText("Machine not found. Ensure it is powered on.");
      }
    };

    // Give it a 1.5 second delay just so the search animation is visible to the user
    setTimeout(scanForMachine, 1500);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryButton} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{statusText}</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Make sure your machine is turned on and connected to the same network.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderContainer: { marginBottom: 30, transform: [{ scale: 1.5 }] },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: { fontSize: 16, textAlign: "center", paddingHorizontal: 20 },
});

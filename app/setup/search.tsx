import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function SetupSearch() {
  const router = useRouter();
  const { colors } = useTheme();

  // Mock search delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/setup/wifi-scan");
    }, 2500); // 2.5 seconds delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primaryButton} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Searching...</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Make sure your machine is turned on.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderContainer: { marginBottom: 30, transform: [{ scale: 1.5 }] },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  subtitle: { fontSize: 16, textAlign: "center" },
});

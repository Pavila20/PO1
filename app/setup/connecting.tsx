import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function SetupConnecting() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/setup/success");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primaryButton} style={{ marginBottom: 30 }} />

        <Text style={[styles.title, { color: colors.text }]}>Connecting...</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          Just a moment more, please.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          style={styles.cancelButton}
        >
          <Text style={[styles.cancelText, { color: colors.subtext }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  subtitle: { fontSize: 16, textAlign: "center" },
  footer: { marginBottom: 20 },
  cancelButton: { alignItems: "center", padding: 10 },
  cancelText: { fontSize: 16 },
});

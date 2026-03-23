import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { getMachineStatus } from "../../src/api/machine";

export default function SetupConnecting() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionFailed, setConnectionFailed] = useState(false);

  const attemptConnection = async () => {
    setIsConnecting(true);
    setConnectionFailed(false);

    // Attempt to fetch the machine status
    const status = await getMachineStatus();

    if (status !== null) {
      // Connection successful!
      router.push("/setup/success");
    } else {
      // Connection failed
      setIsConnecting(false);
      setConnectionFailed(true);
    }
  };

  useEffect(() => {
    attemptConnection();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {isConnecting ? (
          <>
            <ActivityIndicator
              size="large"
              color={colors.primaryButton}
              style={{ marginBottom: 30 }}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Connecting...
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              Just a moment more, please.
            </Text>
          </>
        ) : connectionFailed ? (
          <>
            <Text style={[styles.title, { color: "red" }]}>
              Connection Failed
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colors.subtext, marginBottom: 20 },
              ]}
            >
              We couldn't reach the machine. Make sure you are on the same Wi-Fi
              network.
            </Text>

            {/* NEW RETRY BUTTON */}
            <TouchableOpacity
              onPress={attemptConnection}
              style={[
                styles.retryButton,
                { backgroundColor: colors.primaryButton },
              ]}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
                Retry Connection
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          style={styles.cancelButton}
        >
          <Text style={[styles.cancelText, { color: colors.subtext }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: { fontSize: 16, textAlign: "center" },
  footer: { marginBottom: 20 },
  cancelButton: { alignItems: "center", padding: 10 },
  cancelText: { fontSize: 16 },
  retryButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
});

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { getMachineStatus } from "../../src/backend/api/machine";
import { GradientButton } from "../../src/components/auth/AuthControls";
import MachineHero from "../../src/components/setup/MachineHero";
import SetupScreen from "../../src/components/setup/SetupScreen";

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
    <SetupScreen
      step={3}
      title={connectionFailed ? "Connection failed" : "Connecting..."}
      subtitle={
        connectionFailed
          ? "We couldn't reach the machine. Make sure it's powered on and nearby."
          : "Just a moment more, please."
      }
      hero={<MachineHero mode={isConnecting ? "searching" : "failed"} />}
      footer={
        <>
          {connectionFailed && (
            <GradientButton
              label="Retry connection"
              onPress={attemptConnection}
            />
          )}
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/home")}
            style={styles.cancelButton}
          >
            <Text style={[styles.cancelText, { color: colors.subtext }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  cancelButton: { alignItems: "center", padding: 10 },
  cancelText: { fontSize: 16 },
});

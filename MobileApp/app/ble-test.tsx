// TEMP: proves react-native-ble-plx works in the real app, and lets you
// flip the app over to actually use BLE for the real screens (home,
// active-brew, etc.) via setConnectionType. Remove before merging to main.

import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getConnectionType, setConnectionType } from "../src/backend/api/machine";
import {
  connectToMachineBle,
  getMachineStatusBle,
  sendMachineCommandBle,
} from "../src/backend/api/machineBle";

export default function BleTestScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [connectionState, setConnectionState] = useState("Not connected");
  const [statusJson, setStatusJson] = useState("--");
  const [activeTransport, setActiveTransport] = useState(getConnectionType());
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setLog((prev) => [line, ...prev].slice(0, 50));
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleConnect = async () => {
    setConnectionState("Scanning...");
    addLog("Scanning for PourOver1-BLE-Test...");

    const connected = await connectToMachineBle();
    if (!connected) {
      setConnectionState("Connect failed");
      addLog("Could not find/connect to the device");
      return;
    }

    setConnectionState("Connected");
    addLog("Connected");

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const status = await getMachineStatusBle();
      if (status) {
        const json = JSON.stringify(status);
        setStatusJson(json);
        addLog(`Status update: ${json}`);
      }
    }, 2000);
  };

  const sendCommand = async (command: string) => {
    const result = await sendMachineCommandBle(command);
    addLog(
      result.success
        ? `Sent command: ${command}`
        : `Failed to send: ${command}`,
    );
  };

  const toggleAppTransport = () => {
    const next = activeTransport === "ble" ? "wifi" : "ble";
    setConnectionType(next);
    setActiveTransport(next);
    addLog(`App now using ${next.toUpperCase()} for getMachineStatus/sendMachineCommand`);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          BLE Test
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleConnect}>
        <Text style={styles.primaryBtnText}>
          Connect to PourOver1-BLE-Test
        </Text>
      </TouchableOpacity>

      <View style={[styles.statusBox, { backgroundColor: colors.card }]}>
        <Text style={{ color: colors.text, fontWeight: "700" }}>
          {connectionState}
        </Text>
        <Text style={{ color: colors.text, marginTop: 6 }}>{statusJson}</Text>
      </View>

      <View style={styles.commandRow}>
        <TouchableOpacity
          style={styles.commandBtn}
          onPress={() => sendCommand("START_GRIND")}
        >
          <Text style={styles.commandBtnText}>START_GRIND</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.commandBtn}
          onPress={() => sendCommand("START_DISPENSE")}
        >
          <Text style={styles.commandBtnText}>START_DISPENSE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.commandBtn}
          onPress={() => sendCommand("RESET")}
        >
          <Text style={styles.commandBtnText}>RESET</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.transportBtn,
          { backgroundColor: activeTransport === "ble" ? "#4CAF50" : "#555" },
        ]}
        onPress={toggleAppTransport}
      >
        <Text style={styles.commandBtnText}>
          App is using: {activeTransport.toUpperCase()} (tap to switch to{" "}
          {activeTransport === "ble" ? "WIFI" : "BLE"})
        </Text>
      </TouchableOpacity>

      <FlatList
        style={styles.log}
        data={log}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <Text style={styles.logLine}>{item}</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  primaryBtn: {
    backgroundColor: "#946656",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  statusBox: { borderRadius: 12, padding: 16, marginBottom: 16 },
  commandRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  commandBtn: {
    flex: 1,
    backgroundColor: "#333",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  commandBtnText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  transportBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  log: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 10,
  },
  logLine: { color: "#6f6", fontSize: 11, fontFamily: "monospace" },
});

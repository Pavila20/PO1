// TEMP: proves react-native-ble-plx actually works in the real app,
// talking to the same GATT shape as PO1_Hardware_BLE_Test/src/main.cpp.
// Not the real machine integration yet - remove before merging to main.

import { Buffer } from "buffer";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BleManager, type Device } from "react-native-ble-plx";
import { useTheme } from "../context/ThemeContext";

const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const STATUS_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const COMMAND_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const DEVICE_NAME = "PourOver1-BLE-Test";

async function requestAndroidPermissions() {
  if (Platform.OS !== "android") return true;
  const result = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]);
  return Object.values(result).every(
    (r) => r === PermissionsAndroid.RESULTS.GRANTED,
  );
}

export default function BleTestScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const managerRef = useRef<BleManager | null>(null);
  const deviceRef = useRef<Device | null>(null);

  const [connectionState, setConnectionState] = useState("Not connected");
  const [statusJson, setStatusJson] = useState("--");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setLog((prev) => [line, ...prev].slice(0, 50));
  };

  useEffect(() => {
    managerRef.current = new BleManager();
    return () => {
      deviceRef.current?.cancelConnection().catch(() => {});
      managerRef.current?.destroy();
    };
  }, []);

  const handleConnect = async () => {
    const manager = managerRef.current;
    if (!manager) return;

    const granted = await requestAndroidPermissions();
    if (!granted) {
      addLog("Bluetooth permissions denied");
      return;
    }

    setConnectionState("Scanning...");
    addLog(`Scanning for ${DEVICE_NAME}...`);

    manager.startDeviceScan([SERVICE_UUID], null, async (error, device) => {
      if (error) {
        addLog(`Scan error: ${error.message}`);
        setConnectionState("Scan failed");
        return;
      }

      if (device && device.name === DEVICE_NAME) {
        manager.stopDeviceScan();
        addLog(`Found ${device.name}, connecting...`);
        setConnectionState("Connecting...");

        try {
          const connected = await device.connect();
          await connected.discoverAllServicesAndCharacteristics();
          deviceRef.current = connected;
          setConnectionState("Connected");
          addLog("Connected and discovered services");

          connected.monitorCharacteristicForService(
            SERVICE_UUID,
            STATUS_CHAR_UUID,
            (charError, characteristic) => {
              if (charError) {
                addLog(`Notify error: ${charError.message}`);
                return;
              }
              if (characteristic?.value) {
                const json = Buffer.from(
                  characteristic.value,
                  "base64",
                ).toString("utf8");
                setStatusJson(json);
                addLog(`Status update: ${json}`);
              }
            },
          );

          connected.onDisconnected(() => {
            setConnectionState("Disconnected");
            addLog("Device disconnected");
          });
        } catch (connectError: any) {
          addLog(`Connect error: ${connectError.message}`);
          setConnectionState("Connect failed");
        }
      }
    });
  };

  const sendCommand = async (command: string) => {
    const device = deviceRef.current;
    if (!device) {
      addLog("Not connected yet");
      return;
    }
    try {
      const base64Value = Buffer.from(command, "utf8").toString("base64");
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        COMMAND_CHAR_UUID,
        base64Value,
      );
      addLog(`Sent command: ${command}`);
    } catch (writeError: any) {
      addLog(`Write error: ${writeError.message}`);
    }
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
          Connect to {DEVICE_NAME}
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

      <FlatList
        style={styles.log}
        data={log}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <Text style={styles.logLine}>{item}</Text>
        )}
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
    backgroundColor: "#A9612F",
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
  log: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 10,
  },
  logLine: { color: "#6f6", fontSize: 11, fontFamily: "monospace" },
});

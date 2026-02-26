// app/machine-info.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Bean,
  ChevronLeft,
  Coffee,
  Droplet,
  Info,
  Sparkles,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { getMachineStatus } from "../src/api/machine";

export default function MachineInfoScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  const [machineData, setMachineData] = useState<any>(null);

  // Poll the machine every 2 seconds for live data
  useEffect(() => {
    const fetchMachine = async () => {
      const data = await getMachineStatus();
      setMachineData(data);
    };

    fetchMachine();
    const interval = setInterval(fetchMachine, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleUnpair = () => {
    Alert.alert(
      "Unpair Machine",
      "Are you sure you want to disconnect this machine?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unpair",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("isMachinePaired");
            router.replace("/(tabs)/home");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Top Bar --- */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft color={colors.text} size={28} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            PourOver1
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Info color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        {/* --- Machine Image Section --- */}
        <View style={styles.imageSection}>
          <View style={styles.imageCircle}>
            <Image
              source={require("../assets/images/PO1.png")}
              style={styles.machineImage}
              contentFit="contain"
            />
          </View>
        </View>

        {/* --- Summary Section --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Summary
          </Text>

          {/* Row 1: Water and Beans */}
          <View style={styles.summaryRow}>
            <View style={styles.taskCard}>
              <View style={styles.iconCircle}>
                <Droplet size={20} color="#fff" />
              </View>
              <View style={styles.taskText}>
                <Text style={styles.taskTitle}>
                  {machineData?.waterLevel ?? "--"}%
                </Text>
                <Text style={styles.taskSubtitle}>water</Text>
              </View>
            </View>

            <View style={styles.taskCard}>
              <View style={styles.iconCircle}>
                <Bean size={20} color="#fff" />
              </View>
              <View style={styles.taskText}>
                <Text style={styles.taskTitle}>
                  {machineData?.beanLevel ?? "--"}%
                </Text>
                <Text style={styles.taskSubtitle}>beans</Text>
              </View>
            </View>
          </View>

          {/* Row 2: Cup and Clean */}
          <View style={styles.summaryRow}>
            <View style={styles.taskCard}>
              <View style={styles.iconCircle}>
                <Coffee size={20} color="#fff" />
              </View>
              <View style={styles.taskText}>
                <Text style={styles.taskTitle}>Yes</Text>
                <Text style={styles.taskSubtitle}>cup</Text>
              </View>
            </View>

            <View style={styles.taskCard}>
              <View style={styles.iconCircle}>
                <Sparkles size={20} color="#fff" />
              </View>
              <View style={styles.taskText}>
                <Text style={styles.taskTitle}>50 days</Text>
                <Text style={styles.taskSubtitle}>next clean</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- Statistics Section --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Statistic
          </Text>

          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Made coffee</Text>
              <Text style={styles.statValue}>476 cups</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Time in use</Text>
              <Text style={styles.statValue}>94 days</Text>
            </View>
          </View>
        </View>

        {/* --- Unpair Button --- */}
        <TouchableOpacity
          style={styles.unpairButton}
          onPress={handleUnpair}
          activeOpacity={0.8}
        >
          <Trash2 color="#fff" size={20} />
          <Text style={styles.unpairText}>Unpair Machine</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Decorative SVG in bottom right corner */}
      <View style={styles.bottomDecoration} pointerEvents="none">
        <Image
          source={require("../assets/images/Group 1547.svg")}
          style={styles.decorationImage}
          contentFit="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 24,
  },

  // --- Header ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "Inter-ExtraBold",
  },
  helpButton: {
    backgroundColor: "#A9612F",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  // --- Image Section ---
  imageSection: {
    alignItems: "center",
    marginVertical: 10,
  },
  imageCircle: {
    backgroundColor: "#A9612F",
    width: 172,
    height: 172,
    borderRadius: 86,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  machineImage: {
    width: 100,
    height: 120,
  },

  // --- Summary & Sections ---
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 8,
  },
  taskCard: {
    flex: 1,
    backgroundColor: "#A9612F",
    borderRadius: 15,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#535353",
    justifyContent: "center",
    alignItems: "center",
  },
  taskText: {
    flex: 1,
    justifyContent: "center",
  },
  taskTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  taskSubtitle: {
    color: "#ffffff",
    fontSize: 12,
    opacity: 0.8,
  },

  // --- Statistics ---
  statsList: {
    borderRadius: 15,
    overflow: "hidden",
    gap: 1, // Creates a 1px gap between rows
    backgroundColor: "rgba(0,0,0,0.1)", // Color of the gap lines
  },
  statRow: {
    flexDirection: "row",
    backgroundColor: "#A9612F",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  statValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },

  // --- Actions ---
  unpairButton: {
    backgroundColor: "#e72020",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 20,
  },
  unpairText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // --- Decoration ---
  bottomDecoration: {
    position: "absolute",
    bottom: -20,
    right: 0,
    zIndex: -1,
  },
  decorationImage: {
    width: 90,
    height: 250,
  },
});

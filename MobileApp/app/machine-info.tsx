import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronLeft, Info, Thermometer, Trash2 } from "lucide-react-native";
import { MotiView } from "moti";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { getMachineStatus } from "../src/backend/api/machine";
import BeanBackground from "../src/components/BeanBackground";
import { CoffeeCupIcon, MachineIcon } from "../src/components/icons/CoffeeIcons";
import {
  Accent,
  Glass,
  Gradients,
  Latte,
  Motion,
  Orbs,
  Pop,
  Radii,
  SoftShadow,
} from "../src/constants/DesignSystem";

export default function MachineInfoScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const g = isDark ? Gradients.dark : Gradients.light;
  const glass = isDark ? Glass.dark : Glass.light;
  const pop = isDark ? Pop.dark : Pop.light;
  const accent = isDark ? Accent.dark : Accent.light;
  const latte = isDark ? Latte.dark : Latte.light;
  const beanOpacity = isDark ? Orbs.dark.opacity : Orbs.light.opacity;

  const [machineData, setMachineData] = useState<any>(null);

  // --- Dynamic Stats State ---
  const [cupsMade, setCupsMade] = useState(0);
  const [daysInUse, setDaysInUse] = useState(0);
  const [coffeePref, setCoffeePref] = useState("--");

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

  // Fetch Stats dynamically when the screen loads
  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        // 1. Preference
        const pref = await AsyncStorage.getItem("user_coffee_pref");
        if (pref) setCoffeePref(pref);

        // 2. Cups Made
        const cups = await AsyncStorage.getItem("stats_cups_made");
        if (cups) setCupsMade(parseInt(cups, 10));

        // 3. Time in Use (Calculate days since first app use/install)
        let installDateStr = await AsyncStorage.getItem("stats_install_date");
        if (!installDateStr) {
          // If it doesn't exist, we set today as the install date
          installDateStr = Date.now().toString();
          await AsyncStorage.setItem("stats_install_date", installDateStr);
        }
        const installDate = parseInt(installDateStr, 10);
        const days = Math.floor(
          (Date.now() - installDate) / (1000 * 60 * 60 * 24),
        );
        // Show at least 1 day if it was just installed
        setDaysInUse(Math.max(1, days));
      };

      loadStats();
    }, []),
  );

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

  const cardStyle = {
    backgroundColor: glass.surface,
    borderColor: glass.border,
    ...SoftShadow,
  };

  const stats = [
    { label: "Made coffee", value: `${cupsMade} cups` },
    { label: "Time in use", value: `${daysInUse} days` },
    {
      label: "Preference",
      value: isNaN(Number(coffeePref)) ? coffeePref : `Level ${coffeePref}`,
    },
  ];

  return (
    <LinearGradient colors={g.screen} style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <BeanBackground colors={[pop, latte, accent]} opacity={beanOpacity} />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Top Bar --- */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.roundButton, cardStyle]}
            >
              <ChevronLeft color={colors.text} size={22} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              PourOver1
            </Text>
            <TouchableOpacity style={[styles.roundButton, { backgroundColor: pop }]}>
              <Info color="#fff" size={18} />
            </TouchableOpacity>
          </View>

          {/* --- Machine --- */}
          <MotiView
            from={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={Motion.spring}
            style={styles.imageSection}
          >
            <MotiView
              from={{ translateY: 0 }}
              animate={{ translateY: -8 }}
              transition={{
                type: "timing",
                duration: 2400,
                loop: true,
                repeatReverse: true,
              }}
            >
              <LinearGradient
                colors={g.heroSoft}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.imageCircle, SoftShadow]}
              >
                <MachineIcon size={128} />
              </LinearGradient>
            </MotiView>
          </MotiView>

          {/* --- Summary Section --- */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...Motion.spring, delay: 120 }}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Summary
            </Text>

            <View style={styles.summaryRow}>
              <View style={[styles.taskCard, cardStyle]}>
                <CoffeeCupIcon size={40} />
                <View style={styles.taskText}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>
                    {machineData?.cupPresent === false ? "No" : "Yes"}
                  </Text>
                  <Text style={[styles.taskSubtitle, { color: colors.subtext }]}>
                    cup
                  </Text>
                </View>
              </View>

              <View style={[styles.taskCard, cardStyle]}>
                <View style={[styles.iconCircle, { backgroundColor: pop }]}>
                  <Thermometer size={20} color="#fff" />
                </View>
                <View style={styles.taskText}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>
                    {machineData?.boilerTemp ?? "--"}°F
                  </Text>
                  <Text style={[styles.taskSubtitle, { color: colors.subtext }]}>
                    water temp
                  </Text>
                </View>
              </View>
            </View>
          </MotiView>

          {/* --- Statistics Section --- */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ...Motion.spring, delay: 220 }}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Statistics
            </Text>

            <View style={[styles.statsList, cardStyle]}>
              {stats.map((s, i) => (
                <View
                  key={s.label}
                  style={[
                    styles.statRow,
                    i > 0 && {
                      borderTopWidth: 1,
                      borderTopColor: "rgba(148,102,86,0.15)",
                    },
                  ]}
                >
                  <Text style={[styles.statLabel, { color: colors.subtext }]}>
                    {s.label}
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {s.value}
                  </Text>
                </View>
              ))}
            </View>
          </MotiView>

          {/* --- Unpair Button --- */}
          <TouchableOpacity
            style={[styles.unpairButton, { borderColor: "#E5738A" }]}
            onPress={handleUnpair}
            activeOpacity={0.8}
          >
            <Trash2 color="#E5738A" size={20} />
            <Text style={styles.unpairText}>Unpair Machine</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  imageSection: { alignItems: "center", marginVertical: 6 },
  imageCircle: {
    width: 184,
    height: 184,
    borderRadius: 92,
    justifyContent: "center",
    alignItems: "center",
  },
  section: { gap: 14 },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  summaryRow: { flexDirection: "row", gap: 12 },
  taskCard: {
    flex: 1,
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  taskText: { flex: 1, justifyContent: "center" },
  taskTitle: { fontSize: 16, fontWeight: "800" },
  taskSubtitle: { fontSize: 12 },
  statsList: { borderRadius: Radii.md, borderWidth: 1, overflow: "hidden" },
  statRow: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: 14, fontWeight: "600" },
  statValue: { fontSize: 14, fontWeight: "700", textAlign: "right" },
  unpairButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    gap: 10,
    marginTop: 4,
  },
  unpairText: { color: "#E5738A", fontSize: 16, fontWeight: "800" },
});

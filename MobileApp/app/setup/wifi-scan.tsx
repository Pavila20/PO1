import { useRouter } from "expo-router";
import { ChevronRight, Wifi } from "lucide-react-native";
import { MotiView } from "moti";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Glass, Motion, Pop, Radii, SoftShadow } from "../../src/constants/DesignSystem";
import SetupScreen from "../../src/components/setup/SetupScreen";

export default function SetupWifiScan() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const glass = isDark ? Glass.dark : Glass.light;
  const pop = isDark ? Pop.dark : Pop.light;

  const networks = [{ ssid: "Home_Network_5G" }, { ssid: "Guest_Wifi" }, { ssid: "Neighbor_Net" }];

  return (
    <SetupScreen
      title="Let's connect to PO1"
      subtitle="Choose your Wi-Fi network to continue."
      hero={
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {networks.map((net, index) => (
            <MotiView
              key={net.ssid}
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ ...Motion.spring, delay: 100 + index * 70 }}
            >
              <TouchableOpacity
                style={[
                  styles.cell,
                  {
                    backgroundColor: glass.surface,
                    borderColor: glass.border,
                    ...SoftShadow,
                  },
                ]}
                onPress={() => router.push("/setup/connecting")}
                activeOpacity={0.8}
              >
                <View style={styles.cellLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: pop }]}>
                    <Wifi size={18} color="#fff" />
                  </View>
                  <Text style={[styles.addressText, { color: colors.text }]}>
                    {net.ssid}
                  </Text>
                </View>
                <ChevronRight size={22} color={colors.subtext} />
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { width: "100%", flexGrow: 0, maxHeight: 340 },
  listContent: { gap: 12, paddingVertical: 6 },
  cell: {
    borderRadius: Radii.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  cellLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addressText: { fontSize: 16, fontWeight: "600" },
});

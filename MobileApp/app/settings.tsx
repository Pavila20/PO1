import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, mode, setMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={mode === "dark"}
            onValueChange={(val) => setMode(val ? "dark" : "light")}
            trackColor={{ false: "#767577", true: colors.primary }}
          />
        </View>
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>
            Use System Theme
          </Text>
          <Switch
            value={mode === "system"}
            onValueChange={(val) => setMode(val ? "system" : "light")}
            trackColor={{ false: "#767577", true: colors.primary }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  section: { borderRadius: 16, padding: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: { fontSize: 16 },
  separator: { height: 1, width: "100%" },
});

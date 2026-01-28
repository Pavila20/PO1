import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/firebase";
import { useTheme } from "../../context/ThemeContext";

export default function SettingsTab() {
  const router = useRouter();
  const { colors, mode, setMode } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/"); // Go back to Welcome screen
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Settings
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Appearance */}
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
            APPEARANCE
          </Text>
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View
              style={[
                styles.row,
                { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.label, { color: colors.text }]}>
                Dark Mode
              </Text>
              <Switch
                value={mode === "dark"}
                onValueChange={(val) => setMode(val ? "dark" : "light")}
                trackColor={{ false: "#767577", true: colors.primary }}
              />
            </View>
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

          {/* Account */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.subtext, marginTop: 30 },
            ]}
          >
            ACCOUNT
          </Text>
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>
                Manage Account
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colors.border }]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingVertical: 20 },
  headerTitle: { fontSize: 32, fontWeight: "bold", fontFamily: "serif" },
  content: { padding: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    marginLeft: 10,
  },
  section: { borderRadius: 16, overflow: "hidden" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  label: { fontSize: 16, fontWeight: "500" },
  logoutButton: {
    marginTop: 40,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  logoutText: {
    color: "#FF3B30", // Standard iOS destructive red
    fontSize: 16,
    fontWeight: "bold",
  },
});

import { useRouter } from "expo-router";
import { Play, Plus, Settings } from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function Home() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hello, Paola
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            {/* Avatar placeholder */}
            <View style={styles.avatar}>
              <Settings size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Machine Status Card */}
          <TouchableOpacity
            style={[styles.statusCard, { backgroundColor: colors.card }]}
            onPress={() => router.push("/setup/connect")} // Re-run setup if needed
          >
            <View style={styles.statusHeader}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                PourOver
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Ready</Text>
              </View>
            </View>

            {/* 3D Machine Placeholder */}
            <View style={styles.machinePlaceholder}>
              <View
                style={{
                  width: 80,
                  height: 100,
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                }}
              />
            </View>

            {/* Status Circles */}
            <View style={styles.statusGrid}>
              <View style={styles.statusCircle}>
                <Text>💧</Text>
              </View>
              <View style={styles.statusCircle}>
                <Text>🫘</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Favourites Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Favourites
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.favScroll}
          >
            {/* Favourite Card 1 */}
            <TouchableOpacity
              style={[styles.favCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.coffeeImagePlaceholder} />
              <Text style={[styles.coffeeName, { color: colors.text }]}>
                My coffee
              </Text>
              <View style={styles.coffeeDetails}>
                <Text style={{ color: colors.subtext }}>Weak, L</Text>
                <TouchableOpacity style={styles.playButton}>
                  <Play size={16} color={colors.text} fill={colors.text} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Favourite Card 2 */}
            <TouchableOpacity
              style={[styles.favCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.coffeeImagePlaceholder} />
              <Text style={[styles.coffeeName, { color: colors.text }]}>
                Daddy
              </Text>
              <View style={styles.coffeeDetails}>
                <Text style={{ color: colors.subtext }}>Strong, S</Text>
                <TouchableOpacity style={styles.playButton}>
                  <Play size={16} color={colors.text} fill={colors.text} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Scheduled Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Scheduled
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.scheduleCard, { backgroundColor: colors.card }]}>
            <View style={styles.coffeeImagePlaceholderSmall} />
            <View>
              <Text style={[styles.coffeeName, { color: colors.text }]}>
                Morning
              </Text>
              <Text style={{ color: colors.subtext }}>Every day, 12PM</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  greeting: { fontSize: 24, fontWeight: "bold", fontFamily: "serif" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { padding: 24 },
  statusCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    height: 200,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusHeader: { position: "absolute", top: 20, left: 20 },
  statusTitle: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  badge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  badgeText: { color: "#065F46", fontSize: 12, fontWeight: "bold" },
  machinePlaceholder: { marginTop: 40 },
  statusGrid: { justifyContent: "center", gap: 10 },
  statusCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginRight: 10 },
  addButton: { padding: 4, borderRadius: 12, backgroundColor: "#E5E5EA" },

  favScroll: { marginBottom: 30, overflow: "visible" },
  favCard: {
    width: 140,
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    justifyContent: "space-between",
  },
  coffeeImagePlaceholder: {
    width: "100%",
    height: 80,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginBottom: 10,
  },
  coffeeName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  coffeeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playButton: { padding: 6, backgroundColor: "#F3F4F6", borderRadius: 20 },

  scheduleCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  coffeeImagePlaceholderSmall: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
});

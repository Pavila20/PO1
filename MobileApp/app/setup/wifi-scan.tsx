import { useRouter } from "expo-router";
import { Image } from "expo-image"; // optimized image component
import { ChevronRight, Wifi } from "lucide-react-native"; // Using lucide icons for now
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function SetupWifiScan() {
  const router = useRouter();

  const networks = [{ ssid: "Home_Network_5G" }, { ssid: "Guest_Wifi" }, { ssid: "Neighbor_Net" }];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* 1. Decoration Group */}
      <View style={styles.decorationGroup}>
        <View style={styles.bgShade} />
        <View style={styles.smallCircle} />
      </View>

      {/* 2. Greeting Text */}
      <View style={styles.greetingContainer}>
        <Text style={styles.title}>Let's connect to PO1</Text>
        <Text style={styles.subtitle}>Choose your Wi-Fi network to continue.</Text>
      </View>

      <View style={styles.content}>
        {/* 3. Image Container */}
        <View style={styles.imageContainer}>
          {/* Machine Image Placeholder */}
          <Image source={require("../../assets/images/PO1.png")} style={styles.machineImage} contentFit="contain" />
        </View>

        {/* 4. Wi-Fi List (The "Frame") */}
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {networks.map((net, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cell}
              onPress={() => router.push("/setup/connecting")}
              activeOpacity={0.7}
            >
              <View style={styles.cellLeft}>
                <Wifi size={24} color="white" />
                <View style={styles.textWrapper}>
                  <Text style={styles.addressText}>{net.ssid}</Text>
                </View>
              </View>
              <ChevronRight size={24} color="white" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // .element-connect-machine-wi
  container: {
    flex: 1,
    backgroundColor: "#2c2929",
    alignItems: "center",
    paddingTop: 34,
    paddingHorizontal: 21,
  },

  // .group (Decoration)
  decorationGroup: {
    height: 122,
    width: "100%",
    position: "relative",
    marginBottom: 10,
  },
  bgShade: {
    backgroundColor: "rgba(169, 97, 47, 0.44)",
    borderRadius: 61,
    height: 122,
    width: 122,
    position: "absolute",
    right: 20,
    top: 0,
  },
  smallCircle: {
    backgroundColor: "rgba(169, 97, 47, 0.44)",
    borderRadius: 19.5,
    height: 39,
    width: 39,
    position: "absolute",
    left: 20,
    bottom: 20,
  },

  // .greeting-text
  greetingContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  title: {
    color: "#f0ceab",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    textAlign: "center",
    width: "100%",
    marginBottom: 5,
  },
  subtitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    width: "100%",
  },

  // .content wrapper to manage spacing
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    gap: 30, // Spacing between Image, List, and Button
  },

  // .image
  imageContainer: {
    backgroundColor: "#a9612f",
    borderRadius: 26,
    height: 125,
    width: 125,
    justifyContent: "center",
    alignItems: "center",
    // Shadow optional
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  machineImage: {
    width: 82,
    height: 109,
  },
  // List Container
  listContainer: {
    width: "100%",
    maxHeight: 300, // Limit height if many networks
  },
  listContent: {
    gap: 12, // Spacing between cells
  },

  // .cell
  cell: {
    backgroundColor: "#626262",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    width: "100%",
    justifyContent: "space-between",
  },
  cellLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textWrapper: {
    justifyContent: "center",
  },
  addressText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "400",
  },
});

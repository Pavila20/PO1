// app/(tabs)/home.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router"; // 👈 NEW: useFocusEffect added
import {
  Bean,
  Camera,
  ChevronRight,
  Coffee,
  Droplet,
  LogOut,
  Moon,
  Plus,
  Sparkles,
  Sun,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { getMachineStatus } from "../../src/api/machine";
import { getSessionUser, signOutLocal } from "../../src/auth/session";

const PROFILE_OPTIONS = [
  { id: "default", src: require("../../assets/images/dino.png") },
  { id: "avatar2", src: require("../../assets/images/chicken.png") },
  { id: "avatar3", src: require("../../assets/images/panda.png") },
  { id: "avatar4", src: require("../../assets/images/giraffe.png") },
  { id: "avatar5", src: require("../../assets/images/penguin.png") },
];

export default function HomeScreen() {
  const router = useRouter();
  const { colors, mode, setMode, theme } = useTheme();
  const isDark = theme === "dark";

  const [firstName, setFirstName] = useState("There");
  const [greeting, setGreeting] = useState("Good Morning");
  const [emoji, setEmoji] = useState("☕");
  const [profilePic, setProfilePic] = useState(PROFILE_OPTIONS[0].src);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isPicModalVisible, setPicModalVisible] = useState(false);

  // 👇 NEW: State to track if the user has actually paired a machine
  const [isPaired, setIsPaired] = useState(false);
  const [machineData, setMachineData] = useState<any>(null);

  // 1. Clock and User Data
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning");
      setEmoji("☕");
    } else if (currentHour < 17) {
      setGreeting("Good Afternoon");
      setEmoji("☀️");
    } else if (currentHour < 21) {
      setGreeting("Good Evening");
      setEmoji("🌆");
    } else {
      setGreeting("Good Night");
      setEmoji("🌙");
    }

    const loadUserData = async () => {
      const user = await getSessionUser();
      if (user) {
        let nameToDisplay = "There";
        if (user.given_name) nameToDisplay = user.given_name;
        else if (user.name) nameToDisplay = user.name.split(" ")[0];
        else if (user.email) {
          nameToDisplay = user.email.split("@")[0];
          nameToDisplay =
            nameToDisplay.charAt(0).toUpperCase() + nameToDisplay.slice(1);
        }
        setFirstName(nameToDisplay);
      }
      const savedPicId = await AsyncStorage.getItem("user_profile_pic");
      if (savedPicId) {
        const foundPic = PROFILE_OPTIONS.find((p) => p.id === savedPicId);
        if (foundPic) setProfilePic(foundPic.src);
      }
    };
    loadUserData();
  }, []);

  // 👇 NEW: Check pairing status every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const checkPairing = async () => {
        const paired = await AsyncStorage.getItem("isMachinePaired");
        setIsPaired(paired === "true");
      };
      checkPairing();
    }, []),
  );

  // 👇 UPDATED: Only poll the machine if it is actually paired!
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchMachine = async () => {
      if (isPaired) {
        const data = await getMachineStatus();
        setMachineData(data);
      }
    };

    if (isPaired) {
      fetchMachine();
      interval = setInterval(fetchMachine, 2000);
    } else {
      setMachineData(null); // Clear data if unpaired
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaired]); // Re-run effect if pairing status changes

  const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOutLocal();
          router.replace("/");
        },
      },
    ]);
  };

  const handleChangePicture = () => {
    setMenuVisible(false);
    setPicModalVisible(true);
  };

  const selectNewProfilePic = async (
    selectedOption: (typeof PROFILE_OPTIONS)[0],
  ) => {
    setProfilePic(selectedOption.src);
    setPicModalVisible(false);
    await AsyncStorage.setItem("user_profile_pic", selectedOption.id);
  };

  // 👇 UPDATED: Dynamic UI based on Pairing Status
  const isConnected = isPaired && !!machineData;
  const statusText = !isPaired
    ? "Tap to connect machine"
    : !isConnected
      ? "Connecting..."
      : machineData.status === "idle"
        ? "Ready to Brew"
        : machineData.status === "heating"
          ? "Heating..."
          : machineData.status === "brewing"
            ? "Brewing..."
            : "Done";

  const statusColor = !isPaired
    ? "#e72020" // Red for not paired
    : !isConnected
      ? "#FFA500" // Orange while searching
      : machineData.status === "idle"
        ? "#4CAF50" // Green for Ready
        : "#FFA500"; // Orange for Heating/Brewing

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* MODALS START */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.menuContent, { backgroundColor: colors.card }]}
          >
            <TouchableOpacity
              style={styles.menuRow}
              onPress={handleChangePicture}
            >
              <Camera color={colors.text} size={20} />
              <Text style={[styles.menuText, { color: colors.text }]}>
                Change Picture
              </Text>
            </TouchableOpacity>
            <View
              style={[
                styles.menuDivider,
                { backgroundColor: isDark ? "#444" : "#E5E5E5" },
              ]}
            />
            <View style={styles.menuRow}>
              {isDark ? (
                <Moon color={colors.text} size={20} />
              ) : (
                <Sun color={colors.text} size={20} />
              )}
              <Text style={[styles.menuText, { color: colors.text, flex: 1 }]}>
                Dark Mode
              </Text>
              <Switch
                value={mode === "dark"}
                onValueChange={(val) => setMode(val ? "dark" : "light")}
                trackColor={{ false: "#767577", true: colors.primaryButton }}
              />
            </View>
            <View
              style={[
                styles.menuDivider,
                { backgroundColor: isDark ? "#444" : "#E5E5E5" },
              ]}
            />
            <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
              <LogOut color="#e72020" size={20} />
              <Text style={[styles.menuText, { color: "#e72020" }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={isPicModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPicModalVisible(false)}
      >
        <View style={styles.picModalOverlay}>
          <View
            style={[
              styles.picModalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.picModalHeader}>
              <Text style={[styles.picModalTitle, { color: colors.text }]}>
                Choose an Avatar
              </Text>
              <TouchableOpacity onPress={() => setPicModalVisible(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.picGrid}>
              {PROFILE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.picOption,
                    {
                      backgroundColor: colors.card,
                      borderColor:
                        profilePic === option.src
                          ? colors.primaryButton
                          : "transparent",
                    },
                  ]}
                  onPress={() => selectNewProfilePic(option)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={option.src}
                    style={styles.picOptionImage}
                    contentFit="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      {/* MODALS END */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <View style={styles.greetingTextWrapper}>
              <Text style={[styles.greetingName, { color: colors.text }]}>
                Hi, {firstName} {emoji}
              </Text>
              <Text style={[styles.greetingTime, { color: colors.text }]}>
                {greeting}
              </Text>
            </View>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              What would you like to order today?
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.profileButton,
              {
                backgroundColor: colors.primaryButton,
                borderColor: colors.primaryButton,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setMenuVisible(true)}
          >
            <Image
              source={profilePic}
              style={styles.profileImage}
              contentFit="cover"
            />
          </TouchableOpacity>
        </View>

        {/* 👇 UPDATED WIDGET: Routes to /machine-info if paired, otherwise /setup */}
        <TouchableOpacity
          style={[
            styles.widgetContainer,
            { backgroundColor: colors.widgetBackground },
          ]}
          onPress={() => router.push(isPaired ? "/machine-info" : "/setup")}
          activeOpacity={0.9}
        >
          <View style={styles.widgetHeader}>
            <View style={styles.widgetTitleContainer}>
              <Text style={[styles.widgetTitle, { color: colors.widgetText }]}>
                {isPaired ? "PourOver1" : "No Machine"}
              </Text>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}
              >
                <Text style={styles.statusText}>{statusText}</Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.widgetText} />
          </View>

          <View
            style={[
              styles.machineContent,
              { backgroundColor: isDark ? "#A9612F" : "#C27A45" },
            ]}
          >
            <View style={styles.machineImageWrapper}>
              <Image
                source={require("../../assets/images/PO1.png")}
                style={styles.machineImage}
                contentFit="contain"
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statCircle,
                    machineData?.waterLevelWarning
                      ? styles.statCritical
                      : { backgroundColor: "rgba(255,255,255,0.2)" },
                  ]}
                >
                  <Droplet
                    size={14}
                    color={machineData?.waterLevelWarning ? "#e72020" : "#000"}
                  />
                </View>
                <Text style={styles.statLabel}>
                  {machineData?.waterLevel ?? "--"}%
                </Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statCircle,
                    { backgroundColor: "rgba(255,255,255,0.2)" },
                  ]}
                >
                  <Bean size={14} color="#000" />
                </View>
                <Text style={styles.statLabel}>
                  {machineData?.beanLevel ?? "--"}%
                </Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statCircle,
                    { backgroundColor: "rgba(255,255,255,0.2)" },
                  ]}
                >
                  <Sparkles size={14} color="#000" />
                </View>
                <Text style={styles.statLabel}>
                  {machineData?.waterTemperature ?? "--"}°C
                </Text>
              </View>

              <View style={styles.statItem}>
                <View
                  style={[
                    styles.statCircle,
                    { backgroundColor: "rgba(255,255,255,0.2)" },
                  ]}
                >
                  <Coffee size={14} color="#000" />
                </View>
                <Text style={styles.statLabel}>
                  {machineData?.status
                    ? machineData.status.charAt(0).toUpperCase() +
                      machineData.status.slice(1)
                    : "--"}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recommended
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {/* Recommend Cards */}
            <TouchableOpacity
              style={[styles.recommendCard, { backgroundColor: colors.card }]}
              onPress={() =>
                router.push({
                  pathname: "/coffee-details",
                  params: { name: "Medium Coffee", strength: "Medium" },
                })
              }
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/images/CreamLatteCoffeeIcon.png")}
                style={styles.recommendImage}
                contentFit="contain"
              />
              <View style={styles.recommendTextContainer}>
                <Text
                  style={[styles.recommendTitle, { color: colors.cardHeader }]}
                >
                  Medium Coffee
                </Text>
                <Text
                  style={[
                    styles.recommendSubtitle,
                    { color: colors.cardSubtext },
                  ]}
                >
                  Medium
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recommendCard, { backgroundColor: colors.card }]}
              onPress={() =>
                router.push({
                  pathname: "/coffee-details",
                  params: { name: "Dark Coffee", strength: "Strong" },
                })
              }
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/images/DarkCoffeeIcon.png")}
                style={styles.recommendImage}
                contentFit="contain"
              />
              <View style={styles.recommendTextContainer}>
                <Text
                  style={[styles.recommendTitle, { color: colors.cardHeader }]}
                >
                  Dark Coffee
                </Text>
                <Text
                  style={[
                    styles.recommendSubtitle,
                    { color: colors.cardSubtext },
                  ]}
                >
                  Strong
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recommendCard, { backgroundColor: colors.card }]}
              onPress={() =>
                router.push({
                  pathname: "/coffee-details",
                  params: { name: "Light Coffee", strength: "Light" },
                })
              }
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/images/LightCoffeeIcon.png")}
                style={styles.recommendImage}
                contentFit="contain"
              />
              <View style={styles.recommendTextContainer}>
                <Text
                  style={[styles.recommendTitle, { color: colors.cardHeader }]}
                >
                  Light Coffee
                </Text>
                <Text
                  style={[
                    styles.recommendSubtitle,
                    { color: colors.cardSubtext },
                  ]}
                >
                  Light
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.recipeHeader}>
            <Text
              style={[styles.sectionTitle, { color: colors.widgetBackground }]}
            >
              Your Recipes
            </Text>
            <TouchableOpacity style={styles.plusButton}>
              <Plus size={16} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.recipeList}>
            <TouchableOpacity
              style={[styles.recipeCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.recipeRow}>
                <Image
                  source={require("../../assets/images/MorningCoffeeIcon.png")}
                  style={styles.recipeImage}
                  contentFit="contain"
                />
                <View style={styles.recipeInfo}>
                  <Text
                    style={[styles.recipeTitle, { color: colors.cardHeader }]}
                  >
                    Morning
                  </Text>
                  <Text
                    style={[
                      styles.recipeSubtitle,
                      { color: colors.cardSubtext },
                    ]}
                  >
                    08:00 AM
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.cardHeader} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recipeCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.recipeRow}>
                <Image
                  source={require("../../assets/images/AfternoonCoffeeIcon.png")}
                  style={styles.recipeImage}
                  contentFit="contain"
                />
                <View style={styles.recipeInfo}>
                  <Text
                    style={[styles.recipeTitle, { color: colors.cardHeader }]}
                  >
                    Afternoon
                  </Text>
                  <Text
                    style={[
                      styles.recipeSubtitle,
                      { color: colors.cardSubtext },
                    ]}
                  >
                    02:00 PM
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.cardHeader} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomDecoration} pointerEvents="none">
        <Image
          source={require("../../assets/images/Group 1547.svg")}
          style={styles.decorationImage}
          contentFit="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menuContent: {
    marginTop: 80,
    marginRight: 21,
    width: 230,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuText: { fontSize: 16, fontWeight: "500" },
  menuDivider: { height: 1, width: "100%" },
  picModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  picModalContent: {
    width: "85%",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  picModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  picModalTitle: { fontSize: 20, fontWeight: "700" },
  picGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  picOption: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    overflow: "hidden",
  },
  picOptionImage: { width: "100%", height: "100%" },
  scrollContent: { paddingHorizontal: 21, paddingBottom: 100, gap: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
  },
  greetingContainer: { flex: 1, gap: 5 },
  greetingTextWrapper: { marginBottom: 5 },
  greetingName: { fontSize: 28, fontWeight: "800" },
  greetingTime: { fontSize: 28, fontWeight: "800", opacity: 0.9 },
  subtitle: { fontSize: 14, fontWeight: "500" },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    overflow: "hidden",
  },
  profileImage: { width: "100%", height: "100%" },
  widgetContainer: { borderRadius: 15, padding: 12, gap: 12 },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  widgetTitleContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  widgetTitle: { fontSize: 16, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  machineContent: {
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    height: 120,
  },
  machineImageWrapper: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  machineImage: { width: 100, height: 120 },
  statsContainer: {
    width: 160,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  statItem: { alignItems: "center", justifyContent: "center", width: 35 },
  statCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statCritical: {
    borderWidth: 1,
    borderColor: "#e72020",
    backgroundColor: "#fff",
  },
  statLabel: { fontSize: 10, fontWeight: "600", marginTop: 4, color: "#fff" },
  sectionContainer: { gap: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "600" },
  horizontalScroll: { gap: 12 },
  recommendCard: {
    borderRadius: 15,
    padding: 12,
    width: 140,
    height: 170,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  recommendImage: {
    width: "100%",
    height: 100,
    borderRadius: 15,
    backgroundColor: "#d19a6a",
  },
  recommendTextContainer: { gap: 4 },
  recommendTitle: { fontSize: 14, fontWeight: "600" },
  recommendSubtitle: { fontSize: 12 },
  recipeHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  plusButton: {
    backgroundColor: "grey",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  recipeList: { gap: 10 },
  recipeCard: { borderRadius: 15, padding: 16 },
  recipeRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  recipeImage: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: "#d19a6a",
  },
  recipeInfo: { flex: 1, gap: 2 },
  recipeTitle: { fontSize: 16, fontWeight: "600" },
  recipeSubtitle: { fontSize: 12 },
  bottomDecoration: {
    alignItems: "flex-end",
    marginTop: -250,
    marginRight: 2,
    zIndex: 10,
  },
  decorationImage: { width: 90, height: 250 },
});

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Bean,
  Camera,
  ChevronRight,
  Coffee,
  Droplet,
  LogOut,
  Moon,
  Plus,
  Smartphone,
  Sun,
  Thermometer,
  Trash2,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
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
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
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

  const [isPaired, setIsPaired] = useState(false);
  const [machineData, setMachineData] = useState<any>(null);

  const [coffeePref, setCoffeePref] = useState("8");
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);

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

  useFocusEffect(
    useCallback(() => {
      const loadDynamicData = async () => {
        const paired = await AsyncStorage.getItem("isMachinePaired");
        setIsPaired(paired === "true");

        const pref = await AsyncStorage.getItem("user_coffee_pref");
        if (pref) setCoffeePref(pref);

        const recipesStr = await AsyncStorage.getItem("user_recipes");
        if (recipesStr) {
          setSavedRecipes(JSON.parse(recipesStr));
        }
      };
      loadDynamicData();
    }, []),
  );

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
      setMachineData(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaired]);

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

  // --- DELETE RECIPE LOGIC ---
  const handleDeleteRecipe = async (id: string) => {
    const updatedRecipes = savedRecipes.filter((recipe) => recipe.id !== id);
    setSavedRecipes(updatedRecipes);
    await AsyncStorage.setItem("user_recipes", JSON.stringify(updatedRecipes));
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDeleteRecipe(id)}
      >
        <Trash2 color="#fff" size={24} />
      </TouchableOpacity>
    );
  };

  const isConnected = isPaired && !!machineData;

  const statusText = !isPaired
    ? "Tap to connect machine"
    : !isConnected
      ? "Connecting..."
      : machineData?.status === "IDLE"
        ? "Ready to Brew"
        : machineData?.status === "USER_PROMPT"
          ? "Action Required"
          : machineData?.status === "ERROR"
            ? "Error Check Machine"
            : "Brewing...";

  const statusColor =
    !isPaired || machineData?.status === "ERROR"
      ? "#e72020"
      : !isConnected
        ? "#FFA500"
        : machineData?.status === "IDLE"
          ? "#4CAF50"
          : "#FFA500";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

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

              <View style={styles.menuThemeSection}>
                <View style={[styles.menuRow, styles.themeRow]}>
                  {theme === "dark" ? (
                    <Moon color={colors.text} size={20} />
                  ) : (
                    <Sun color={colors.text} size={20} />
                  )}
                  <Text
                    style={[styles.menuText, { color: colors.text, flex: 1 }]}
                  >
                    Dark Mode
                  </Text>
                  <Switch
                    value={theme === "dark"}
                    onValueChange={(val) => setMode(val ? "dark" : "light")}
                    trackColor={{
                      false: "#767577",
                      true: colors.primaryButton,
                    }}
                  />
                </View>

                <View style={[styles.menuRow, styles.themeRow]}>
                  <Smartphone color={colors.text} size={20} />
                  <Text
                    style={[styles.menuText, { color: colors.text, flex: 1 }]}
                  >
                    System Theme
                  </Text>
                  <Switch
                    value={mode === "system"}
                    onValueChange={(val) => setMode(val ? "system" : theme)}
                    trackColor={{
                      false: "#767577",
                      true: colors.primaryButton,
                    }}
                  />
                </View>
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
                <Text
                  style={[styles.widgetTitle, { color: colors.widgetText }]}
                >
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
                      color={
                        machineData?.waterLevelWarning ? "#e72020" : "#000"
                      }
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
                    <Thermometer size={14} color="#000" />
                  </View>
                  <Text style={styles.statLabel}>
                    {machineData?.boilerTemp ?? "--"}°C
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
                    style={[
                      styles.recommendTitle,
                      { color: colors.cardHeader },
                    ]}
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
                    style={[
                      styles.recommendTitle,
                      { color: colors.cardHeader },
                    ]}
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
                    style={[
                      styles.recommendTitle,
                      { color: colors.cardHeader },
                    ]}
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
                style={[
                  styles.sectionTitle,
                  { color: colors.widgetBackground },
                ]}
              >
                Your Recipes
              </Text>
              <TouchableOpacity
                style={styles.plusButton}
                onPress={() => router.push("/create-recipe")}
              >
                <Plus size={16} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.recipeList}>
              {savedRecipes.length === 0 ? (
                <Text
                  style={{
                    color: colors.subtext,
                    fontStyle: "italic",
                    paddingVertical: 10,
                  }}
                >
                  You haven't saved any recipes yet. Tap the + to create one!
                </Text>
              ) : (
                savedRecipes.map((recipe) => (
                  <Swipeable
                    key={recipe.id}
                    renderRightActions={() => renderRightActions(recipe.id)}
                    containerStyle={{ overflow: "visible" }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.recipeCard,
                        { backgroundColor: colors.card },
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/coffee-details",
                          // Pass isCustom and recipeId so coffee-details.tsx knows it's a custom recipe
                          params: {
                            name: recipe.name,
                            strength: recipe.strength,
                            isCustom: "true",
                            recipeId: recipe.id,
                          },
                        })
                      }
                    >
                      <View style={styles.recipeRow}>
                        <Image
                          source={require("../../assets/images/MorningCoffeeIcon.png")}
                          style={styles.recipeImage}
                          contentFit="contain"
                        />
                        <View style={styles.recipeInfo}>
                          <Text
                            style={[
                              styles.recipeTitle,
                              { color: colors.cardHeader },
                            ]}
                          >
                            {recipe.name}
                          </Text>
                          <Text
                            style={[
                              styles.recipeSubtitle,
                              { color: colors.cardSubtext },
                            ]}
                          >
                            {recipe.strength} • Created at {recipe.time}
                          </Text>
                        </View>
                        <ChevronRight size={20} color={colors.cardHeader} />
                      </View>
                    </TouchableOpacity>
                  </Swipeable>
                ))
              )}
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
    </GestureHandlerRootView>
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
    width: 250,
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
  menuThemeSection: {
    paddingVertical: 4,
  },
  themeRow: {
    paddingVertical: 10,
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
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 15,
  },
  bottomDecoration: {
    alignItems: "flex-end",
    marginTop: -250,
    marginRight: 2,
    zIndex: 10,
  },
  decorationImage: { width: 90, height: 250 },
});

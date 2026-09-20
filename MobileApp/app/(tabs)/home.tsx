// app/(tabs)/home.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Camera,
  ChevronRight,
  Coffee,
  LogOut,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Thermometer,
  Trash2,
  X,
} from "lucide-react-native";
import { MotiView } from "moti";
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
import {
  Accent,
  Glass,
  Gradients,
  Lilac,
  Motion,
  Orbs,
  Pop,
  Radii,
  SoftShadow,
} from "../../src/constants/DesignSystem";
import { getMachineStatus } from "../../src/backend/api/machine";
import { getSessionUser, signOutLocal } from "../../src/backend/auth/session";

import {
  deletePourProfile,
  getUserProfiles,
  getUserRecentBrews,
} from "../../src/backend/api/database";

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
  const g = isDark ? Gradients.dark : Gradients.light;
  const glass = isDark ? Glass.dark : Glass.light;
  const accent = isDark ? Accent.dark : Accent.light;
  const pop = isDark ? Pop.dark : Pop.light;
  const lilac = isDark ? Lilac.dark : Lilac.light;
  const orbOpacity = isDark ? Orbs.dark.opacity : Orbs.light.opacity;

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
  const [recentHistory, setRecentHistory] = useState<any[]>([]);

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

        try {
          const user = await getSessionUser();
          if (user) {
            const cloudRecipes = await getUserProfiles(user.sub);
            setSavedRecipes(cloudRecipes);

            const history = await getUserRecentBrews(user.sub);
            setRecentHistory(history);
          }
        } catch (error) {
          console.error("Failed to load cloud recipes/history:", error);
          setSavedRecipes([]);
          setRecentHistory([]);
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

  const handleDeleteRecipe = async (id: string) => {
    try {
      await deletePourProfile(id);
      const updatedRecipes = savedRecipes.filter(
        (recipe) => recipe.profileId !== id,
      );
      setSavedRecipes(updatedRecipes);
    } catch (error) {
      Alert.alert("Error", "Could not delete recipe from cloud.");
    }
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
  const isBrewing =
    isConnected &&
    ["GRIND", "USER_PROMPT", "PUMP", "HEAT", "DISPENSE"].includes(
      machineData?.status,
    );

  const statusText = !isPaired
    ? "Tap to connect machine"
    : !isConnected
      ? "Connecting..."
      : machineData?.status === "IDLE"
        ? "Ready to Brew"
        : machineData?.status === "USER_PROMPT"
          ? "Action Required"
          : machineData?.status === "ERROR"
            ? "Error — check machine"
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
      <LinearGradient colors={g.screen} style={{ flex: 1 }}>
        {/* Decorative glow orbs - drifting slowly to keep the background alive */}
        <View style={styles.orbLayer} pointerEvents="none">
          <MotiView
            from={{ translateY: 0, scale: 1 }}
            animate={{ translateY: 18, scale: 1.08 }}
            transition={{
              type: "timing",
              duration: 7000,
              loop: true,
              repeatReverse: true,
            }}
            style={[
              styles.orb,
              {
                backgroundColor: pop,
                opacity: orbOpacity,
                width: 260,
                height: 260,
                top: -70,
                right: -60,
              },
            ]}
          />
          <MotiView
            from={{ translateY: 0, scale: 1 }}
            animate={{ translateY: -22, scale: 1.05 }}
            transition={{
              type: "timing",
              duration: 9000,
              loop: true,
              repeatReverse: true,
            }}
            style={[
              styles.orb,
              {
                backgroundColor: accent,
                opacity: orbOpacity * 0.75,
                width: 220,
                height: 220,
                top: 240,
                left: -80,
              },
            ]}
          />
          <MotiView
            from={{ translateX: 0 }}
            animate={{ translateX: 16 }}
            transition={{
              type: "timing",
              duration: 8000,
              loop: true,
              repeatReverse: true,
            }}
            style={[
              styles.orb,
              {
                backgroundColor: lilac,
                opacity: orbOpacity * 0.7,
                width: 200,
                height: 200,
                top: 520,
                right: -70,
              },
            ]}
          />
        </View>

        <SafeAreaView style={styles.container} edges={["top"]}>
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
                style={[
                  styles.menuContent,
                  { backgroundColor: colors.card, borderRadius: Radii.md },
                ]}
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
                      trackColor={{ false: "#767577", true: accent }}
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
                  { backgroundColor: colors.background, borderRadius: Radii.lg },
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
                            profilePic === option.src ? accent : "transparent",
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
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={Motion.spring}
              style={styles.header}
            >
              <View style={styles.greetingContainer}>
                <View style={styles.greetingTextWrapper}>
                  <View style={styles.greetingRow}>
                    <Text style={[styles.greetingName, { color: colors.text }]}>
                      Hi, {firstName} {emoji}
                    </Text>
                    <MotiView
                      from={{ scale: 0.7, rotate: "-12deg" }}
                      animate={{ scale: 1, rotate: "0deg" }}
                      transition={{ ...Motion.spring, delay: 300 }}
                    >
                      <Sparkles size={18} color={pop} />
                    </MotiView>
                  </View>
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
                    borderColor: pop,
                    backgroundColor: glass.surface,
                    ...SoftShadow,
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
            </MotiView>

            {/* TEMP: BLE test entry point, kept as ongoing debug tooling */}
            <TouchableOpacity
              style={styles.bleDevButton}
              onPress={() => router.push("/ble-test")}
            >
              <Text style={styles.bleDevButtonText}>BLE Test (dev)</Text>
            </TouchableOpacity>

            <MotiView
              from={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...Motion.spring, delay: 80 }}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => router.push(isPaired ? "/machine-info" : "/setup")}
              >
                <LinearGradient
                  colors={g.hero}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.widgetContainer, SoftShadow]}
                >
                  <View style={styles.widgetHeader}>
                    <Text style={styles.widgetTitle}>
                      {isPaired ? "PourOver1" : "No Machine"}
                    </Text>
                    <ChevronRight size={22} color="rgba(255,255,255,0.85)" />
                  </View>

                  <View style={styles.machineContent}>
                    <Image
                      source={require("../../assets/images/PO1.png")}
                      style={styles.machineImage}
                      contentFit="contain"
                    />

                    <View style={{ flex: 1, gap: 10 }}>
                      <MotiView
                        style={[
                          styles.statusBadge,
                          { backgroundColor: "rgba(255,255,255,0.18)" },
                        ]}
                        animate={
                          isBrewing
                            ? { opacity: [1, 0.6, 1] }
                            : { opacity: 1 }
                        }
                        transition={
                          isBrewing
                            ? {
                                type: "timing",
                                duration: 1200,
                                loop: true,
                              }
                            : undefined
                        }
                      >
                        <View
                          style={[styles.statusDot, { backgroundColor: statusColor }]}
                        />
                        <Text style={styles.statusText}>{statusText}</Text>
                      </MotiView>

                      {isConnected && (
                        <View style={styles.tempChip}>
                          <Thermometer size={14} color="rgba(255,255,255,0.9)" />
                          <Text style={styles.tempChipText}>
                            {machineData?.boilerTemp ?? "--"}°
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>

            {isPaired && savedRecipes.length > 0 && (
              <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ...Motion.spring, delay: 140 }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push({
                      pathname: "/coffee-details",
                      params: {
                        name: savedRecipes[0].name,
                        strength: "Custom",
                        isCustom: "true",
                        recipeId: savedRecipes[0].profileId,
                      },
                    })
                  }
                >
                  <LinearGradient
                    colors={[pop, accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.brewCta, SoftShadow]}
                  >
                    <Coffee size={20} color="#fff" />
                    <Text style={styles.brewCtaText}>
                      Brew {savedRecipes[0].name}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </MotiView>
            )}

            <View style={styles.sectionContainer}>
              <View style={styles.recipeHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Your Smart Coffee
                </Text>
                <View style={styles.headerActions}>
                  {savedRecipes.length > 0 && coffeePref !== "--" && (
                    <View
                      style={[
                        styles.tasteChip,
                        { backgroundColor: glass.surface, borderColor: pop },
                      ]}
                    >
                      <Text
                        style={[styles.tasteChipText, { color: colors.text }]}
                      >
                        Taste {coffeePref}
                      </Text>
                    </View>
                  )}
                  {savedRecipes.length > 0 && (
                    <TouchableOpacity
                      style={[styles.addButton, { backgroundColor: accent }]}
                      onPress={() => router.push("/create-recipe")}
                    >
                      <Plus size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.recipeList}>
                {savedRecipes.length === 0 ? (
                  <MotiView
                    from={{ opacity: 0, translateY: 12 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ ...Motion.spring, delay: 150 }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.primaryBtn,
                        {
                          backgroundColor: glass.surface,
                          borderColor: glass.border,
                          borderWidth: 1,
                          ...SoftShadow,
                        },
                      ]}
                      onPress={() => router.push("/create-recipe")}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={require("../../assets/images/MorningCoffeeIcon.png")}
                        style={{ width: 72, height: 72, marginBottom: 14 }}
                        contentFit="contain"
                      />
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: 17,
                          fontWeight: "800",
                          marginBottom: 4,
                        }}
                      >
                        Make your first cup
                      </Text>
                      <Text
                        style={{
                          color: colors.subtext,
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        Set your taste, and it learns what you like
                      </Text>
                    </TouchableOpacity>
                  </MotiView>
                ) : (
                  savedRecipes.map((recipe, index) => (
                    <MotiView
                      key={recipe.profileId}
                      from={{ opacity: 0, translateY: 16 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{
                        ...Motion.spring,
                        delay: 180 + index * 70,
                      }}
                    >
                      <Swipeable
                        renderRightActions={() =>
                          renderRightActions(recipe.profileId)
                        }
                        containerStyle={{ overflow: "visible" }}
                      >
                        <TouchableOpacity
                          style={[
                            styles.recipeCard,
                            {
                              backgroundColor: glass.surface,
                              borderColor: glass.border,
                              ...SoftShadow,
                            },
                          ]}
                          onPress={() =>
                            router.push({
                              pathname: "/coffee-details",
                              params: {
                                name: recipe.name,
                                strength: "Custom",
                                isCustom: "true",
                                recipeId: recipe.profileId,
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
                                  { color: colors.text },
                                ]}
                              >
                                {recipe.name}
                              </Text>
                              <Text
                                style={[
                                  styles.recipeSubtitle,
                                  { color: colors.subtext },
                                ]}
                              >
                                Temp: {recipe.targetTemp}°F • Grind:{" "}
                                {recipe.grindSize} • Beans:{" "}
                                {recipe.coffeeWeight || 20}g
                              </Text>
                            </View>
                            <ChevronRight size={20} color={colors.text} />
                          </View>
                        </TouchableOpacity>
                      </Swipeable>
                    </MotiView>
                  ))
                )}
              </View>
            </View>

            {/* --- RECENT HISTORY SECTION --- */}
            <View style={[styles.sectionContainer, { marginTop: 16 }]}>
              <View style={styles.recipeHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Recent Brew History
                </Text>
              </View>

              <View
                style={[
                  styles.historyCard,
                  {
                    backgroundColor: glass.surface,
                    borderColor: glass.border,
                    ...SoftShadow,
                  },
                ]}
              >
                {recentHistory.length === 0 ? (
                  <Text
                    style={{
                      color: colors.subtext,
                      paddingVertical: 4,
                    }}
                  >
                    No recent brews yet.
                  </Text>
                ) : (
                  recentHistory.map((brew, index) => {
                    const profile = savedRecipes.find(
                      (r) => r.profileId === brew.profileId,
                    );
                    const brewName = profile ? profile.name : "Custom Brew";

                    const paramsText = profile
                      ? `${profile.targetTemp}°F • ${profile.coffeeWeight || 20}g • ${profile.waterVolume}ml`
                      : "Custom Parameters";

                    const dateStr = new Date(
                      brew.timestamp,
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                    const timeStr = new Date(
                      brew.timestamp,
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <MotiView
                        key={brew.ratingId || index}
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          type: "timing",
                          duration: 300,
                          delay: 200 + index * 50,
                        }}
                        style={[
                          styles.historyItem,
                          index === 0 && { borderTopWidth: 0 },
                          { borderTopColor: glass.border },
                        ]}
                      >
                        <View
                          style={[styles.historyDot, { backgroundColor: accent }]}
                        />

                        <View style={styles.historyContent}>
                          <View style={styles.historyRowTitle}>
                            <Text
                              style={[
                                styles.historyTitle,
                                { color: colors.text },
                              ]}
                            >
                              {brewName}
                            </Text>
                            <Text
                              style={[
                                styles.historyRating,
                                { color: pop },
                              ]}
                            >
                              {brew.rating}/15
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.historyParams,
                              { color: colors.subtext },
                            ]}
                          >
                            {paramsText} • {brew.perceivedStrength}
                          </Text>

                          <Text
                            style={[
                              styles.historyTime,
                              { color: colors.subtext },
                            ]}
                          >
                            {dateStr} at {timeStr}
                          </Text>
                        </View>
                      </MotiView>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orbLayer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  orb: { position: "absolute", borderRadius: 9999 },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  tasteChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  tasteChipText: { fontSize: 11, fontWeight: "700" },
  brewCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: Radii.pill,
  },
  brewCtaText: { color: "#fff", fontSize: 17, fontWeight: "800" },
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
  historyCard: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: 16,
    gap: 0,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  historyContent: {
    flex: 1,
    gap: 4,
  },
  historyRowTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  historyRating: {
    fontSize: 14,
    fontWeight: "700",
  },
  historyParams: {
    fontSize: 13,
    fontWeight: "500",
  },
  historyTime: {
    fontSize: 12,
    opacity: 0.7,
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
  scrollContent: { paddingHorizontal: 21, paddingBottom: 150, gap: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
  },
  greetingContainer: { flex: 1, gap: 5 },
  greetingTextWrapper: { marginBottom: 5 },
  greetingName: { fontSize: 30, fontWeight: "800" },
  greetingTime: { fontSize: 30, fontWeight: "800", opacity: 0.9 },
  subtitle: { fontSize: 14, fontWeight: "500" },
  profileButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    overflow: "hidden",
  },
  profileImage: { width: "100%", height: "100%" },
  widgetContainer: { borderRadius: Radii.lg, padding: 20, gap: 16 },
  widgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  widgetTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  machineContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  machineImage: { width: 90, height: 108 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  tempChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  tempChipText: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600" },
  sectionContainer: { gap: 12 },
  sectionTitle: { fontSize: 21, fontWeight: "700" },
  recipeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  recipeList: { gap: 10 },
  recipeCard: { borderRadius: Radii.md, padding: 16, borderWidth: 1 },
  recipeRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  recipeImage: {
    width: 55,
    height: 55,
    borderRadius: Radii.sm,
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
    borderRadius: Radii.md,
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: 32,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  bleDevButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#333",
    marginTop: -12,
  },
  bleDevButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});

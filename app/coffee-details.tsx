import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import { MotiView } from "moti";
import { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const coffeeImages: Record<string, any> = {
  "Cream Latte": require("../assets/images/CreamLatteCoffeeIcon.png"),
  "Dark Coffee": require("../assets/images/DarkCoffeeIcon.png"),
  "Light Coffee": require("../assets/images/LightCoffeeIcon.png"),
};

const tutorialData = [
  {
    id: "0",
    title: "Before Continuing",
    desc: "Please follow the instructions to get your coffee started.",
    image: require("../assets/images/Before-continuing.png"),
  },
  {
    id: "1",
    title: "Step 1: Place Filter Cup",
    desc: "Carefully place the filter cup into the designated slot before starting the brew.",
    image: require("../assets/images/Step-1-Place-filter-Cup.png"),
  },
  {
    id: "2",
    title: "Step 2: Move Filtered Cup",
    desc: "Once the extraction is complete, carefully move the filtered cup to the serving area.",
    image: require("../assets/images/Step-2-Move-filtered-cup.png"),
  },
  {
    id: "3",
    title: "Step 3: Enjoy Your Coffee!",
    desc: "Your perfect cup of coffee is ready. Sip, relax, and enjoy the moment.",
    image: require("../assets/images/Step-3-Enjoy-your-coffee.png"),
  },
];

type BitternessLevel = "Low" | "Medium" | "High";

const CustomBean = ({ color = "#A9612F", size = 29 }) => (
  <Svg height={size} width={size} fill="none" viewBox="0 0 29 29">
    <Path
      d="M22.5044 22.5034C16.6948 28.3107 8.36376 29.3975 3.89734 24.9288C-0.573655 20.4601 0.515492 12.1313 6.32275 6.32178C12.1346 0.514517 20.4657 -0.572342 24.9321 3.89637C29.4008 8.36278 28.3116 16.6938 22.5044 22.5034Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.28812"
    />
    <Path
      d="M24.9289 3.89648C24.9289 3.89648 24.1212 9.55959 20.8835 12.795C17.6481 16.0304 11.1773 12.795 7.94189 16.0304C4.70419 19.2658 3.89648 24.9312 3.89648 24.9312"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.28812"
    />
  </Svg>
);

const PaginationBean = ({
  index,
  currentIndex,
}: {
  index: number;
  currentIndex: number;
}) => {
  const isActive = index === currentIndex;
  return (
    <MotiView
      style={{ marginHorizontal: 6 }}
      animate={{
        opacity: isActive ? 1 : 0.4,
        scale: isActive ? 1.3 : 1,
      }}
      transition={{ type: "spring", damping: 15 }}
    >
      <Svg width="17" height="15" fill="none" viewBox="0 0 17 15">
        <Path
          fill="#966A54"
          d="M4.89 13.404c2.565 0 4.644-2.946 4.644-6.58 0-3.632-2.08-6.578-4.644-6.578S.246 3.192.246 6.825s2.08 6.579 4.644 6.579"
        />
        <Path
          fill="#82563F"
          d="M1.668 11.562c.835 1.14 1.97 1.842 3.222 1.842 2.565 0 4.644-2.946 4.644-6.58 0-2.58-1.05-4.814-2.577-5.891.455.62.82 1.371 1.067 2.21.07.24-.012.5-.21.656q-.468.368-.895.794C5.542 5.97 4.624 7.657 4.333 9.343a6 6 0 0 0 .001 2.169.613.613 0 0 1-.59.737h-.009c-.743 0-1.444-.248-2.067-.687"
        />
        <Path
          fill="#664545"
          d="M5.276 11.404c-.156-.735-.292-1.5-.492-2.218a15 15 0 0 0-.704-2.02c-.677-1.563-.795-3.437-.011-4.978a.2.2 0 0 1 .267-.082c.203.157.221.866.32 1.144.245 1.116.578 2.206 1.044 3.233.354.79.563 1.648.585 2.508.02.853-.123 1.715-.508 2.48a.27.27 0 0 1-.359.116.26.26 0 0 1-.142-.183"
        />
        <Path
          fill="#372222"
          d="M5.418 11.587a.27.27 0 0 0 .36-.115c.384-.766.527-1.627.507-2.48A6.6 6.6 0 0 0 5.7 6.483l-.11-.253c-.455.7-.805 1.44-1.036 2.19q.125.378.23.766c.2.717.336 1.483.492 2.218a.26.26 0 0 0 .142.182"
        />
        <Path
          fill="#966A54"
          d="M14.141 11.817c2.569-2.569 3.181-6.121 1.368-7.935s-5.366-1.2-7.934 1.368c-2.57 2.57-3.182 6.121-1.368 7.935s5.365 1.2 7.934-1.368"
        />
        <Path
          fill="#82563F"
          d="M16.488 5.83c-.226 1.465-1.029 3.039-2.344 4.354-2.57 2.57-6.123 3.182-7.936 1.369-.525-.526-.847-1.197-.976-1.948-.216 1.397.091 2.696.976 3.58 1.813 1.814 5.366 1.202 7.935-1.368 1.826-1.825 2.663-4.146 2.345-5.988"
        />
        <Path
          fill="#372222"
          d="M7.894 12.045c.41-.63.855-1.267 1.22-1.916.36-.629.667-1.264.93-1.926.628-1.584 1.87-2.993 3.514-3.529a.2.2 0 0 1 .246.131c.033.255-.455.77-.582 1.036-.616.962-1.151 1.968-1.548 3.025a6.6 6.6 0 0 1-1.36 2.186c-.589.617-1.3 1.125-2.113 1.395a.27.27 0 0 1-.307-.402"
        />
        <Path
          fill="#fff"
          d="M15.686 3.707c-.884-.884-2.187-1.261-3.67-1.063a.246.246 0 1 0 .066.488c1.326-.178 2.483.15 3.256.923 1.714 1.715 1.1 5.119-1.368 7.588-2.47 2.469-5.873 3.083-7.588 1.368-.819-.818-1.135-2.05-.89-3.468.249-1.45 1.051-2.912 2.258-4.12.962-.96 2.088-1.668 3.257-2.045a.246.246 0 1 0-.151-.468c-.559.18-1.107.43-1.634.744-.385-1.026-.95-1.9-1.646-2.538C6.779.386 5.85 0 4.89 0 3.567 0 2.33.721 1.405 2.031.5 3.315 0 5.017 0 6.825c0 1.577.393 3.114 1.106 4.328a.246.246 0 1 0 .424-.25C.86 9.765.492 8.316.492 6.826.492 3.333 2.465.492 4.89.492c1.636 0 3.154 1.34 3.907 3.43a9.5 9.5 0 0 0-1.395 1.154A9.4 9.4 0 0 0 6.074 6.74a7 7 0 0 0-.15-.36c-.43-.946-.765-1.987-1.027-3.183l-.009-.031c-.028-.078-.052-.228-.076-.373-.06-.371-.118-.722-.326-.883a.448.448 0 0 0-.634.16l-.003.006c-.386.76-.578 1.614-.57 2.538a.246.246 0 0 0 .247.243h.002a.246.246 0 0 0 .244-.248 5 5 0 0 1 .46-2.197c.04.131.074.335.094.46.028.167.053.326.093.444.269 1.224.615 2.293 1.057 3.267q.157.355.274.723a7.5 7.5 0 0 0-.7 1.923l-.029-.108a15 15 0 0 0-.716-2.053 6.6 6.6 0 0 1-.421-1.361.246.246 0 1 0-.483.093c.096.5.248.993.452 1.464.28.647.506 1.297.694 1.988.145.52.258 1.077.367 1.615l.044.214c.094.745.361 1.408.79 1.954q-.423.121-.858.122c-.996 0-1.936-.47-2.719-1.361a.246.246 0 0 0-.37.325c.867.985 1.964 1.528 3.089 1.528q.624 0 1.223-.215c.725.684 1.704 1.04 2.827 1.04q.481 0 .994-.088c1.549-.267 3.105-1.118 4.384-2.396 1.278-1.278 2.129-2.835 2.396-4.383.272-1.58-.093-2.965-1.028-3.9"
        />
        <Path
          fill="#fff"
          d="M8.9 10.008c-.264.468-.576.94-.878 1.395l-.334.508s-.141.173-.055.443a.514.514 0 0 0 .646.326c.796-.264 1.541-.754 2.214-1.458a6.9 6.9 0 0 0 1.411-2.27c.367-.974.865-1.948 1.526-2.978l.015-.028c.035-.075.124-.198.21-.317.22-.306.427-.595.394-.855a.448.448 0 0 0-.562-.335l-.005.001c-1.59.519-2.96 1.891-3.666 3.672-.26.654-.56 1.274-.916 1.896m4.615-5.059c-.066.122-.186.289-.26.393a3 3 0 0 0-.248.378c-.675 1.055-1.186 2.056-1.563 3.058a6.4 6.4 0 0 1-1.307 2.104c-.617.645-1.294 1.093-2.01 1.33-.01.003-.024-.004-.028-.017-.001-.003-.003-.008.002-.017l.331-.503c.307-.463.625-.942.896-1.424.367-.641.676-1.281.946-1.958.634-1.6 1.84-2.841 3.24-3.344"
        />
      </Svg>
    </MotiView>
  );
};

export default function CoffeeDetailsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();

  const { name, strength, isCustom, recipeId } = useLocalSearchParams();
  const coffeeName = (name as string) || "Light Coffee";

  // Use a generic cup icon if the name isn't recognized
  const coffeeImage =
    coffeeImages[coffeeName] ||
    require("../assets/images/MorningCoffeeIcon.png");

  const isDark = theme === "dark";

  const [showTutorial, setShowTutorial] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Parse bitterness from the "Strength: 8" text if it's a custom recipe
  let bitterness: BitternessLevel = "Low";
  if (
    strength === "Strong" ||
    (strength as string)?.includes("12") ||
    (strength as string)?.includes("13") ||
    (strength as string)?.includes("14") ||
    (strength as string)?.includes("15")
  ) {
    bitterness = "High";
  } else if (
    strength === "Medium" ||
    (strength as string)?.includes("7") ||
    (strength as string)?.includes("8") ||
    (strength as string)?.includes("9") ||
    (strength as string)?.includes("10") ||
    (strength as string)?.includes("11")
  ) {
    bitterness = "Medium";
  }

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // --- Dynamic Theme Colors ---
  const bgColor = isDark ? colors.background : "#FFF1E5";
  const textColor = isDark ? "#F0CEAB" : "#9C4400";
  const subtextColor = isDark ? "#896D59" : "#896D59";
  const btnBgColor = isDark ? colors.primaryButton : "#FFDEBA";
  const btnTextColor = isDark ? "#F0CEAB" : "#000000";

  const handleBrew = () => {
    setShowTutorial(false);
    setCurrentIndex(0);
    router.replace({
      pathname: "/active-brew",
      params: { name: coffeeName, strength: strength as string },
    });
  };

  const handleNext = () => {
    if (currentIndex < tutorialData.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleBrew();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleBrew();
  };

  // --- DELETE CUSTOM RECIPE FROM DETAILS VIEW ---
  const handleDeleteCustomRecipe = () => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const existingStr = await AsyncStorage.getItem("user_recipes");
            if (existingStr) {
              const recipes = JSON.parse(existingStr);
              const updated = recipes.filter((r: any) => r.id !== recipeId);
              await AsyncStorage.setItem(
                "user_recipes",
                JSON.stringify(updated),
              );
            }
            router.back();
          },
        },
      ],
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: bgColor }]}
        edges={["top", "bottom"]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* --- TUTORIAL CAROUSEL MODAL --- */}
        <Modal visible={showTutorial} animationType="fade" transparent={true}>
          <View style={styles.tutorialContainer}>
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: isDark ? "rgba(44, 41, 41, 1)" : "#FFF1E5" },
              ]}
            >
              {isDark && (
                <LinearGradient
                  colors={[
                    "rgba(44, 41, 41, 0.27)",
                    "rgba(12, 15, 20, 1)",
                    "rgba(12, 15, 20, 1)",
                  ]}
                  locations={[0, 0.56, 1]}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
            </View>

            {/* Skip Button */}
            <View style={styles.tutorialHeader}>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text
                  style={[
                    styles.skipText,
                    { color: isDark ? "#ffffff" : "#000000" },
                  ]}
                >
                  Skip
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.carouselWrapper}>
              <FlatList
                ref={flatListRef}
                data={tutorialData}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewConfig}
                scrollEventThrottle={32}
                bounces={false}
                style={{ flexGrow: 0 }}
                renderItem={({ item }) => (
                  <View
                    style={[styles.slideContainer, { width: SCREEN_WIDTH }]}
                  >
                    <View style={styles.visualContainer}>
                      <Image
                        source={item.image}
                        style={styles.tutorialImage}
                        contentFit="contain"
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text
                        style={[styles.tutorialTitle, { color: textColor }]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[styles.tutorialDesc, { color: subtextColor }]}
                      >
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                )}
              />

              <View style={styles.pagination}>
                {tutorialData.map((_, index) => (
                  <PaginationBean
                    key={index}
                    index={index}
                    currentIndex={currentIndex}
                  />
                ))}
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.tutorialNextBtn,
                  { backgroundColor: btnBgColor },
                ]}
                activeOpacity={0.8}
                onPress={handleNext}
              >
                <Text
                  style={[styles.tutorialNextText, { color: btnTextColor }]}
                >
                  {currentIndex === tutorialData.length - 1
                    ? "Start Brewing"
                    : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* --- Top Bar --- */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: btnBgColor }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft
              color={btnTextColor === "#000000" ? "#000000" : "#fff"}
              size={24}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>{coffeeName}</Text>

          {/* Conditional rendering for Delete Button if the coffee is custom */}
          {isCustom === "true" ? (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: btnBgColor }]}
              onPress={handleDeleteCustomRecipe}
              activeOpacity={0.8}
            >
              <Trash2 color="#FF3B30" size={20} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[styles.outerImageCard, { backgroundColor: btnBgColor }]}
          >
            <View
              style={[
                styles.innerImageCard,
                { backgroundColor: isDark ? "#E6B786" : "#FFF1E5" },
              ]}
            >
              <Image
                source={coffeeImage}
                style={styles.mainImage}
                contentFit="contain"
              />
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Coffee Information
            </Text>
            <Text style={[styles.bitternessTitle, { color: textColor }]}>
              Bitterness
            </Text>
          </View>

          <View style={styles.selectorSection}>
            <View
              style={[styles.pillContainer, { backgroundColor: btnBgColor }]}
            >
              <View
                style={[
                  styles.beanCircle,
                  bitterness === "Low" && [
                    styles.beanCircleActive,
                    {
                      backgroundColor: isDark
                        ? "rgba(240, 206, 171, 0.9)"
                        : "rgba(255, 255, 255, 0.8)",
                    },
                  ],
                ]}
              >
                <CustomBean
                  size={28}
                  color={bitterness === "Low" ? "#A9612F" : "rgba(0,0,0,0.2)"}
                />
              </View>
              <View
                style={[
                  styles.beanCircle,
                  bitterness === "Medium" && [
                    styles.beanCircleActive,
                    {
                      backgroundColor: isDark
                        ? "rgba(240, 206, 171, 0.9)"
                        : "rgba(255, 255, 255, 0.8)",
                    },
                  ],
                ]}
              >
                <CustomBean
                  size={28}
                  color={
                    bitterness === "Medium" ? "#A9612F" : "rgba(0,0,0,0.2)"
                  }
                />
              </View>
              <View
                style={[
                  styles.beanCircle,
                  bitterness === "High" && [
                    styles.beanCircleActive,
                    {
                      backgroundColor: isDark
                        ? "rgba(240, 206, 171, 0.9)"
                        : "rgba(255, 255, 255, 0.8)",
                    },
                  ],
                ]}
              >
                <CustomBean
                  size={28}
                  color={bitterness === "High" ? "#A9612F" : "rgba(0,0,0,0.2)"}
                />
              </View>
            </View>
            <View style={styles.labelsRow}>
              <Text
                style={[
                  styles.labelText,
                  { color: isDark ? "#fff" : "#000000" },
                ]}
              >
                Low
              </Text>
              <Text
                style={[
                  styles.labelText,
                  { color: isDark ? "#fff" : "#000000" },
                ]}
              >
                Medium
              </Text>
              <Text
                style={[
                  styles.labelText,
                  { color: isDark ? "#fff" : "#000000" },
                ]}
              >
                High
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: btnBgColor }]}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowTutorial(true);
            }}
          >
            <Text style={[styles.continueButtonText, { color: btnTextColor }]}>
              Continue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tutorialContainer: {
    flex: 1,
  },
  tutorialHeader: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slideContainer: {
    alignItems: "center",
  },
  visualContainer: {
    height: 265,
    width: 275,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 35,
  },
  tutorialImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    width: 316,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  tutorialTitle: {
    fontFamily: "Inter-ExtraBold",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 35,
  },
  tutorialDesc: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
    zIndex: 20,
  },
  tutorialNextBtn: {
    borderRadius: 20,
    paddingVertical: 10,
    width: 249,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  tutorialNextText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 35,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "serif",
    fontSize: 24,
    fontWeight: "800",
  },
  scrollContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 40,
  },
  outerImageCard: {
    width: 280,
    height: 330,
    borderRadius: 35,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  innerImageCard: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  mainImage: {
    width: "85%",
    height: "85%",
  },
  infoSection: {
    alignItems: "center",
    gap: 12,
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  bitternessTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  selectorSection: {
    alignItems: "center",
    width: "100%",
    marginBottom: 40,
  },
  pillContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: 260,
    height: 70,
    borderRadius: 35,
    paddingHorizontal: 8,
  },
  beanCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  beanCircleActive: {
    shadowColor: "#F0CEAB",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 230,
    marginTop: 10,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    width: 60,
  },
  continueButton: {
    width: 260,
    height: 55,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
});

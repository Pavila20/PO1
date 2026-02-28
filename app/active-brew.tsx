// app/active-brew.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getMachineStatus, sendMachineCommand } from "../src/api/machine";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type BrewStep =
  | "INSTRUCT_GRINDER"
  | "ERROR_GRINDER"
  | "ERROR_BEANS"
  | "GRINDING"
  | "INSTRUCT_DISPENSER"
  | "ERROR_DISPENSER"
  | "ERROR_WATER"
  | "DISPENSING"
  | "DONE";

export default function ActiveBrewScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { name } = useLocalSearchParams();

  const isDark = theme === "dark";

  const [currentStep, setCurrentStep] = useState<BrewStep>("INSTRUCT_GRINDER");
  const [progress, setProgress] = useState(0);

  // --- Dynamic Theme Colors ---
  const bgColor = isDark ? colors.background : "#FFF1E5";
  const textColor = isDark ? colors.text : "#9C4400";
  const subtextColor = isDark ? colors.subtext : "#896D59";
  const btnBgColor = isDark ? colors.primaryButton : "#FFDEBA";
  const btnTextColor = isDark ? "#F0CEAB" : "#000000";
  const progressBgColor = isDark ? "#333" : "#E5E5E5";

  // --- INCREMENT STATS ON FINISH ---
  useEffect(() => {
    if (currentStep === "DONE") {
      const incrementCups = async () => {
        try {
          const cupsStr = await AsyncStorage.getItem("stats_cups_made");
          const currentCups = cupsStr ? parseInt(cupsStr, 10) : 0;
          await AsyncStorage.setItem(
            "stats_cups_made",
            (currentCups + 1).toString(),
          );
        } catch (e) {
          console.error("Failed to increment cups stats", e);
        }
      };
      incrementCups();
    }
  }, [currentStep]);

  // --- HARDWARE POLLING ---
  useEffect(() => {
    const interval = setInterval(async () => {
      const machine = await getMachineStatus();
      if (!machine) return;

      if (machine.status === "GRIND") {
        setCurrentStep("GRINDING");
      } else if (
        machine.status === "USER_PROMPT" &&
        currentStep === "GRINDING"
      ) {
        setCurrentStep("INSTRUCT_DISPENSER");
      } else if (["PUMP", "HEAT", "DISPENSE"].includes(machine.status)) {
        setCurrentStep("DISPENSING");
      } else if (machine.status === "IDLE" && currentStep === "DISPENSING") {
        setCurrentStep("DONE");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep]);

  // --- VISUAL PROGRESS BAR TRICK ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === "GRINDING" || currentStep === "DISPENSING") {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 3 : 95));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [currentStep]);

  // --- ACTION HANDLERS ---
  const handleStartGrinding = async () => {
    const machine = await getMachineStatus();
    if (machine) {
      if (machine.beanWeight < 15) {
        setCurrentStep("ERROR_BEANS");
      } else if (machine.grinderCupDetected) {
        await sendMachineCommand("START_GRIND");
        setCurrentStep("GRINDING");
      } else {
        setCurrentStep("ERROR_GRINDER");
      }
    }
  };

  const handleStartDispensing = async () => {
    const machine = await getMachineStatus();
    if (machine) {
      if (machine.waterWeight < 250) {
        setCurrentStep("ERROR_WATER");
      } else if (machine.dispenserCupDetected) {
        await sendMachineCommand("START_DISPENSE");
        setCurrentStep("DISPENSING");
      } else {
        setCurrentStep("ERROR_DISPENSER");
      }
    }
  };

  const handleFinish = () => {
    router.replace("/(tabs)/home");
  };

  const handleQA = () => {
    router.push("/qa-rating");
  };

  // --- RENDER HELPERS ---
  const renderInstruction = (
    title: string,
    subtitle: string,
    onContinue: () => void,
  ) => (
    <View style={styles.centerContent}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: subtextColor }]}>{subtitle}</Text>
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: btnBgColor }]}
        onPress={onContinue}
      >
        <Text style={[styles.primaryBtnText, { color: btnTextColor }]}>
          Continue to Brew
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = (
    title: string,
    subtitle: string,
    onRetry: () => void,
  ) => (
    <View style={styles.centerContent}>
      <Text style={[styles.title, { color: "#FF3B30" }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: subtextColor }]}>{subtitle}</Text>
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: btnBgColor }]}
        onPress={onRetry}
      >
        <Text style={[styles.primaryBtnText, { color: btnTextColor }]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProgress = (title: string, animationSource: any) => (
    <View style={styles.centerContent}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.progressText, { color: btnBgColor }]}>
        {progress}%
      </Text>
      <LottieView
        source={animationSource}
        autoPlay
        loop
        style={styles.lottie}
      />
      <View
        style={[
          styles.progressBarContainer,
          { backgroundColor: progressBgColor },
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: isDark ? colors.primaryButton : "#A9612F",
              width: `${progress}%`,
            },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={[styles.headerText, { color: textColor }]}>
          Brewing: {name}
        </Text>
      </View>

      <View style={styles.mainArea}>
        {currentStep === "INSTRUCT_GRINDER" &&
          renderInstruction(
            "Add Cup Under Grinder",
            "Place your empty filter cup exactly under the grinder spout.",
            handleStartGrinding,
          )}

        {currentStep === "ERROR_GRINDER" &&
          renderError(
            "No Cup Detected",
            "Please insert the filter cup securely under the grinder and try again.",
            handleStartGrinding,
          )}

        {currentStep === "ERROR_BEANS" &&
          renderError(
            "Out of Beans",
            "Please refill the coffee beans in the hopper to continue.",
            handleStartGrinding,
          )}

        {currentStep === "GRINDING" &&
          renderProgress(
            "Grinding Beans...",
            require("../assets/lottie/Loading coffee bean.json"),
          )}

        {currentStep === "INSTRUCT_DISPENSER" &&
          renderInstruction(
            "Move Filtered Cup",
            "Carefully slide the filtered cup with grinded beans under the water dispenser.",
            handleStartDispensing,
          )}

        {currentStep === "ERROR_DISPENSER" &&
          renderError(
            "Cup Not Found",
            "Please ensure the cup is aligned directly under the water dispenser.",
            handleStartDispensing,
          )}

        {currentStep === "ERROR_WATER" &&
          renderError(
            "Out of Water",
            "Please refill the water tank to continue.",
            handleStartDispensing,
          )}

        {currentStep === "DISPENSING" &&
          renderProgress(
            "Extracting Coffee...",
            require("../assets/lottie/Drip coffee.json"),
          )}

        {currentStep === "DONE" && (
          <View style={styles.centerContent}>
            <Text style={[styles.title, { color: textColor, fontSize: 32 }]}>
              Enjoy your Coffee!
            </Text>
            <LottieView
              source={require("../assets/lottie/Shiba Coffee-relax")}
              autoPlay
              loop={false}
              style={styles.lottie}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: btnBgColor }]}
                onPress={handleQA}
              >
                <Text style={[styles.secondaryBtnText, { color: textColor }]}>
                  Q/A
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor: btnBgColor,
                    flex: 1,
                    marginHorizontal: 0,
                  },
                ]}
                onPress={handleFinish}
              >
                <Text style={[styles.primaryBtnText, { color: btnTextColor }]}>
                  Finish
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: 20, alignItems: "center" },
  headerText: { fontSize: 18, fontWeight: "700", fontFamily: "Inter-SemiBold" },
  mainArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  centerContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Inter-ExtraBold",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.8,
  },
  progressText: { fontSize: 48, fontWeight: "800", marginVertical: 10 },
  lottie: { width: 200, height: 200, marginVertical: 20 },
  progressBarContainer: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 20,
  },
  progressBarFill: { height: "100%", borderRadius: 6 },
  primaryBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: { fontSize: 18, fontWeight: "800" },
  buttonRow: { flexDirection: "row", gap: 15, width: "100%", marginTop: 30 },
  secondaryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: 18, fontWeight: "800" },
});

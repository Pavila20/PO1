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
import {
  getMachineStatus,
  sendMachineCommand,
} from "../src/backend/api/machine";

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
  | "DONE"
  | "ERROR_INTERRUPTED"
  | "ERROR_INTERRUPTED_DISPENSING";

export default function ActiveBrewScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const { name, strength, isCustom, recipeId } = useLocalSearchParams();

  const isDark = theme === "dark";

  const [currentStep, setCurrentStep] = useState<BrewStep>("INSTRUCT_GRINDER");
  const [progress, setProgress] = useState(0);

  const [isDisconnected, setIsDisconnected] = useState(false);
  const [hasBeenInterrupted, setHasBeenInterrupted] = useState(false);

  // --- Dynamic Theme Colors ---
  const bgColor = isDark ? colors.background : "#FFF1E5";
  const textColor = isDark ? colors.text : "#9C4400";
  const subtextColor = isDark ? colors.subtext : "#896D59";
  const btnBgColor = isDark ? colors.primaryButton : "#FFDEBA";
  const btnTextColor = isDark ? "#F0CEAB" : "#000000";
  const progressBgColor = isDark ? "#333" : "#E5E5E5";

  // --- NEW: Track State Changes in Terminal ---
  useEffect(() => {
    console.log(`[Brew State]  Screen updated to: ${currentStep}`);
  }, [currentStep]);

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
    let isPolling = false;

    const interval = setInterval(async () => {
      if (isPolling) return;
      isPolling = true;

      const machine = await getMachineStatus();

      // Lost connection
      if (!machine) {
        if (!isDisconnected) {
          console.log(
            " [Network] Connection lost to machine! Waiting for reconnect...",
          );
          setIsDisconnected(true);
        }
        isPolling = false;
        return;
      }

      // Re-established connection
      if (isDisconnected) {
        console.log(
          ` [Network] Reconnected! Machine woke up with status: ${machine.status}`,
        );
        setIsDisconnected(false);

        if (machine.status === "IDLE") {
          if (currentStep === "GRINDING") {
            console.log(
              " [Recovery] Machine lost power during GRINDING. Forcing full restart.",
            );
            setCurrentStep("ERROR_INTERRUPTED");
            isPolling = false;
            return;
          } else if (currentStep === "DISPENSING") {
            console.log(
              " [Recovery] Machine lost power during DISPENSING. Forcing resume at water pump.",
            );
            setCurrentStep("ERROR_INTERRUPTED_DISPENSING");
            isPolling = false;
            return;
          }
        }
      }

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
        console.log(" [Brew Complete] Machine is IDLE and dispensing is done!");
        setCurrentStep("DONE");
      } else if (machine.status === "IDLE" && currentStep === "GRINDING") {
        console.log(
          " [Glitch Catch] Machine is IDLE during Grinding. Throwing interruption error.",
        );
        setCurrentStep("ERROR_INTERRUPTED");
      }

      isPolling = false;
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep, isDisconnected]);

  // --- VISUAL PROGRESS BAR TRICK ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      !isDisconnected &&
      (currentStep === "GRINDING" || currentStep === "DISPENSING")
    ) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 3 : 95));
      }, 200);
    }
    return () => clearInterval(interval);
  }, [currentStep, isDisconnected]);

  // --- ACTION HANDLERS ---
  const handleStartGrinding = async () => {
    console.log(" [Action] User clicked Start Grinding...");
    const machine = await getMachineStatus();
    if (machine) {
      if (machine.beanLevel < 5) {
        console.log(" [Hardware Check] Failed: Not enough beans.");
        setCurrentStep("ERROR_BEANS");
      } else if (machine.cupPresent === false) {
        console.log(" [Hardware Check] Failed: No cup present.");
        setCurrentStep("ERROR_GRINDER");
      } else {
        console.log(" [Hardware Check] Passed. Sending START_GRIND command.");
        await sendMachineCommand("START_GRIND");
        setCurrentStep("GRINDING");
      }
    }
  };

  const handleStartDispensing = async () => {
    console.log(" [Action] User clicked Start Dispensing...");
    const machine = await getMachineStatus();
    if (machine) {
      if (machine.waterLevel < 15) {
        console.log(" [Hardware Check] Failed: Not enough water.");
        setCurrentStep("ERROR_WATER");
      } else if (machine.cupPresent === false) {
        console.log(" [Hardware Check] Failed: No cup present.");
        setCurrentStep("ERROR_DISPENSER");
      } else {
        console.log(
          " [Hardware Check] Passed. Sending START_DISPENSE command.",
        );
        await sendMachineCommand("START_DISPENSE");
        setCurrentStep("DISPENSING");
      }
    }
  };

  const handleFinish = () => {
    router.replace("/(tabs)/home");
  };

  const handleQA = () => {
    router.push({
      pathname: "/qa-rating",
      params: {
        name: name as string,
        isCustom: isCustom as string,
        recipeId: recipeId as string,
      },
    });
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

  const renderDisconnected = () => (
    <View style={styles.centerContent}>
      <Text style={[styles.title, { color: "#FF3B30" }]}>Connection Lost</Text>
      <Text style={[styles.subtitle, { color: subtextColor }]}>
        Lost connection to the coffee machine. Please check the power and WiFi.
        We will automatically resume when it reconnects.
      </Text>
      <LottieView
        source={require("../assets/lottie/Loading coffee bean.json")}
        autoPlay
        loop
        style={styles.lottie}
      />
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
        {isDisconnected ? (
          renderDisconnected()
        ) : (
          <>
            {currentStep === "INSTRUCT_GRINDER" &&
              renderInstruction(
                hasBeenInterrupted
                  ? "Restarting Brew"
                  : "Add Cup Under Grinder",
                hasBeenInterrupted
                  ? "Place your empty filter cup back under the grinder to restart and continue your brew."
                  : "Place your empty filter cup exactly under the grinder spout.",
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
                hasBeenInterrupted ? "Resume Extraction" : "Move Filtered Cup",
                hasBeenInterrupted
                  ? "Ensure your cup is under the water dispenser to finish pouring your coffee."
                  : "Carefully slide the filtered cup with grinded beans under the water dispenser.",
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

            {currentStep === "ERROR_INTERRUPTED" &&
              renderError(
                "Brew Interrupted",
                "The machine lost power during grinding. Please empty your filter cup and try again.",
                () => {
                  console.log(
                    " [Action] User acknowledged grinding interruption. Restarting...",
                  );
                  setHasBeenInterrupted(true);
                  setCurrentStep("INSTRUCT_GRINDER");
                },
              )}

            {currentStep === "ERROR_INTERRUPTED_DISPENSING" &&
              renderError(
                "Extraction Interrupted",
                "The machine lost connection while pouring water. Check your cup, and resume the pour when ready.",
                () => {
                  console.log(
                    " [Action] User acknowledged pouring interruption. Resuming extraction...",
                  );
                  setHasBeenInterrupted(true);
                  setCurrentStep("INSTRUCT_DISPENSER");
                },
              )}

            {currentStep === "DONE" && (
              <View style={styles.centerContent}>
                <Text
                  style={[styles.title, { color: textColor, fontSize: 32 }]}
                >
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
                    <Text
                      style={[styles.secondaryBtnText, { color: textColor }]}
                    >
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
                    <Text
                      style={[styles.primaryBtnText, { color: btnTextColor }]}
                    >
                      Finish
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
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

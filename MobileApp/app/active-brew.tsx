// app/active-brew.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { MotiView } from "moti";
import { ReactNode, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  getMachineStatus,
  sendMachineCommand,
} from "../src/backend/api/machine";
import { GradientButton } from "../src/components/auth/AuthControls";
import BeanConfetti from "../src/components/BeanConfetti";
import {
  BeanJarIcon,
  CoffeeCupIcon,
  MachineIcon,
  WaterCanIcon,
} from "../src/components/icons/CoffeeIcons";
import RecipeIcon from "../src/components/icons/RecipeIcon";
import ScreenShell from "../src/components/ScreenShell";
import {
  Accent,
  Glass,
  Latte,
  Motion,
  Pop,
  Radii,
  SoftShadow,
} from "../src/constants/DesignSystem";

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

  // --- Theme tokens ---
  const glass = isDark ? Glass.dark : Glass.light;
  const pop = isDark ? Pop.dark : Pop.light;
  const accent = isDark ? Accent.dark : Accent.light;
  const latte = isDark ? Latte.dark : Latte.light;
  const errorColor = "#E5738A";
  const trackBg = isDark ? "rgba(255,255,255,0.15)" : "rgba(148,102,86,0.18)";

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
  const cardStyle = {
    backgroundColor: glass.surface,
    borderColor: glass.border,
    ...SoftShadow,
  };

  // Every step is a glass card with an illustration on top
  const renderCard = (
    icon: ReactNode,
    title: string,
    subtitle: string | null,
    body: ReactNode,
    isError = false,
  ) => (
    <MotiView
      key={currentStep}
      from={{ opacity: 0, translateY: 18, scale: 0.97 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={Motion.spring}
      style={[styles.card, cardStyle]}
    >
      <MotiView
        from={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...Motion.spring, delay: 100 }}
      >
        {icon}
      </MotiView>
      <Text style={[styles.title, { color: isError ? errorColor : colors.text }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          {subtitle}
        </Text>
      ) : null}
      {body}
    </MotiView>
  );

  const renderInstruction = (
    icon: ReactNode,
    title: string,
    subtitle: string,
    onContinue: () => void,
  ) =>
    renderCard(
      icon,
      title,
      subtitle,
      <GradientButton label="Continue to Brew" onPress={onContinue} />,
    );

  const renderError = (
    icon: ReactNode,
    title: string,
    subtitle: string,
    onRetry: () => void,
  ) =>
    renderCard(
      icon,
      title,
      subtitle,
      <GradientButton label="Try Again" onPress={onRetry} />,
      true,
    );

  const renderProgress = (title: string, animationSource: any) =>
    renderCard(
      <LottieView
        source={animationSource}
        autoPlay
        loop
        style={styles.lottie}
      />,
      title,
      null,
      <>
        <Text style={[styles.progressText, { color: pop }]}>{progress}%</Text>
        <View style={[styles.progressBarContainer, { backgroundColor: trackBg }]}>
          <LinearGradient
            colors={[pop, accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progress}%` }]}
          />
        </View>
      </>,
    );

  const renderDisconnected = () =>
    renderCard(
      <LottieView
        source={require("../assets/lottie/Loading coffee bean.json")}
        autoPlay
        loop
        style={styles.lottie}
      />,
      "Connection Lost",
      "Lost connection to the coffee machine. Please check the power and Bluetooth. We will automatically resume when it reconnects.",
      null,
      true,
    );

  return (
    <ScreenShell title="Brewing">
      {/* Which recipe is being brewed */}
      <View style={styles.recipeChipRow}>
        <View style={[styles.recipeChip, cardStyle]}>
          <RecipeIcon name={name as string} size={26} />
          <Text
            style={[styles.recipeChipText, { color: colors.text }]}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
      </View>

      <View style={styles.mainArea}>
        {isDisconnected ? (
          renderDisconnected()
        ) : (
          <>
            {currentStep === "INSTRUCT_GRINDER" &&
              renderInstruction(
                <CoffeeCupIcon size={110} />,
                hasBeenInterrupted ? "Restarting Brew" : "Add Cup Under Grinder",
                hasBeenInterrupted
                  ? "Place your empty filter cup back under the grinder to restart and continue your brew."
                  : "Place your empty filter cup exactly under the grinder spout.",
                handleStartGrinding,
              )}

            {currentStep === "ERROR_GRINDER" &&
              renderError(
                <CoffeeCupIcon size={110} />,
                "No Cup Detected",
                "Please insert the filter cup securely under the grinder and try again.",
                handleStartGrinding,
              )}

            {currentStep === "ERROR_BEANS" &&
              renderError(
                <BeanJarIcon size={110} />,
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
                <WaterCanIcon size={110} />,
                hasBeenInterrupted ? "Resume Extraction" : "Move Filtered Cup",
                hasBeenInterrupted
                  ? "Ensure your cup is under the water dispenser to finish pouring your coffee."
                  : "Carefully slide the filtered cup with grinded beans under the water dispenser.",
                handleStartDispensing,
              )}

            {currentStep === "ERROR_DISPENSER" &&
              renderError(
                <CoffeeCupIcon size={110} />,
                "Cup Not Found",
                "Please ensure the cup is aligned directly under the water dispenser.",
                handleStartDispensing,
              )}

            {currentStep === "ERROR_WATER" &&
              renderError(
                <WaterCanIcon size={110} />,
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
                <MachineIcon size={110} />,
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
                <MachineIcon size={110} />,
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

            {currentStep === "DONE" &&
              renderCard(
                <LottieView
                  source={require("../assets/lottie/Shiba Coffee-relax")}
                  autoPlay
                  loop={false}
                  style={styles.lottie}
                />,
                "Enjoy your Coffee!",
                null,
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, { borderColor: pop }]}
                    onPress={handleQA}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.secondaryBtnText, { color: pop }]}>
                      Rate it
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <GradientButton label="Finish" onPress={handleFinish} />
                  </View>
                </View>,
              )}
          </>
        )}
      </View>

      {/* Bean rain when the cup is ready */}
      {currentStep === "DONE" && !isDisconnected && (
        <BeanConfetti colors={[pop, accent, latte]} />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  recipeChipRow: { alignItems: "center", marginTop: 2 },
  recipeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 16,
    borderRadius: Radii.pill,
    borderWidth: 1,
    maxWidth: "80%",
  },
  recipeChipText: { fontSize: 15, fontWeight: "700" },
  mainArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    alignItems: "center",
    borderRadius: Radii.xl,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: "serif",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  progressText: { fontSize: 48, fontWeight: "800", marginVertical: 6 },
  lottie: { width: 180, height: 180 },
  progressBarContainer: {
    width: "100%",
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBarFill: { height: "100%", borderRadius: 7 },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    marginTop: 18,
  },
  secondaryBtn: {
    height: 54,
    paddingHorizontal: 26,
    borderRadius: Radii.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: 17, fontWeight: "800" },
});

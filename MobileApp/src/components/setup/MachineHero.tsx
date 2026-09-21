// The PourOver1 machine on a frosted tile, with a state-dependent
// animation: idle (gentle float), searching (Bluetooth ripples),
// success (check badge springs in), failed (soft X badge).

import { LinearGradient } from "expo-linear-gradient";
import { Bluetooth, Check, X } from "lucide-react-native";
import { MotiView } from "moti";
import { StyleSheet, View } from "react-native";
import { MachineIcon } from "../icons/CoffeeIcons";
import { useTheme } from "../../../context/ThemeContext";
import {
  Glass,
  Gradients,
  Motion,
  Pop,
  SoftShadow,
} from "../../constants/DesignSystem";

export type HeroMode = "idle" | "searching" | "success" | "failed";

const TILE = 150;

export default function MachineHero({ mode }: { mode: HeroMode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pop = isDark ? Pop.dark : Pop.light;
  const glass = isDark ? Glass.dark : Glass.light;
  const g = isDark ? Gradients.dark : Gradients.light;

  return (
    <View style={styles.wrap}>
      {/* Ripples radiate out while searching */}
      {mode === "searching" &&
        [0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ opacity: 0.45, scale: 1 }}
            animate={{ opacity: 0, scale: 2.1 }}
            transition={{
              type: "timing",
              duration: 2400,
              delay: i * 800,
              loop: true,
              repeatReverse: false,
            }}
            style={[styles.ring, { borderColor: pop }]}
          />
        ))}

      <MotiView
        from={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...Motion.spring, delay: 100 }}
      >
        <MotiView
          animate={{ translateY: mode === "failed" ? 0 : -6 }}
          transition={{
            type: "timing",
            duration: 2200,
            loop: mode !== "failed",
            repeatReverse: true,
          }}
        >
          <LinearGradient
            colors={g.heroSoft}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.tile, { borderColor: glass.border }, SoftShadow]}
          >
            <MachineIcon size={116} />
          </LinearGradient>

          {mode !== "idle" && (
            <MotiView
              key={mode}
              from={{ scale: 0, rotate: "-40deg" }}
              animate={{ scale: 1, rotate: "0deg" }}
              transition={Motion.spring}
              style={[
                styles.badge,
                {
                  backgroundColor:
                    mode === "success"
                      ? "#5FB98F"
                      : mode === "failed"
                        ? "#E5738A"
                        : pop,
                },
              ]}
            >
              {mode === "success" ? (
                <Check size={22} color="#fff" strokeWidth={3} />
              ) : mode === "failed" ? (
                <X size={22} color="#fff" strokeWidth={3} />
              ) : (
                <Bluetooth size={20} color="#fff" />
              )}
            </MotiView>
          )}
        </MotiView>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", width: 320, height: 320 },
  ring: {
    position: "absolute",
    width: TILE,
    height: TILE,
    borderRadius: TILE / 2,
    borderWidth: 3,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: -12,
    bottom: -12,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    ...SoftShadow,
  },
});

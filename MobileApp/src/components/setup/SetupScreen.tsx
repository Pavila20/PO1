// Shared shell for the machine-setup wizard: blush gradient, drifting beans,
// a step indicator, centered title/subtitle, a hero slot and a footer slot.

import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { ReactNode } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../context/ThemeContext";
import {
  Accent,
  Gradients,
  Latte,
  Motion,
  Orbs,
  Pop,
} from "../../constants/DesignSystem";
import BeanBackground from "../BeanBackground";

const TOTAL_STEPS = 4;

type Props = {
  step?: number; // 1-based; omit to hide the indicator
  title: string;
  subtitle?: string;
  hero: ReactNode;
  footer?: ReactNode;
};

export default function SetupScreen({
  step,
  title,
  subtitle,
  hero,
  footer,
}: Props) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const g = isDark ? Gradients.dark : Gradients.light;
  const pop = isDark ? Pop.dark : Pop.light;
  const accent = isDark ? Accent.dark : Accent.light;
  const latte = isDark ? Latte.dark : Latte.light;
  const beanOpacity = isDark ? Orbs.dark.opacity : Orbs.light.opacity;

  return (
    <LinearGradient colors={g.screen} style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <BeanBackground colors={[pop, latte, accent]} opacity={beanOpacity} />

      <SafeAreaView style={styles.safe}>
        {step ? (
          <View style={styles.steps}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const active = i + 1 === step;
              const done = i + 1 < step;
              return (
                <MotiView
                  key={i}
                  animate={{ width: active ? 28 : 8 }}
                  transition={Motion.spring}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        active || done ? pop : "rgba(148,102,86,0.25)",
                      opacity: done ? 0.6 : 1,
                    },
                  ]}
                />
              );
            })}
          </View>
        ) : null}

        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={Motion.spring}
          style={styles.header}
        >
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
              {subtitle}
            </Text>
          ) : null}
        </MotiView>

        <View style={styles.hero}>{hero}</View>

        <View style={styles.footer}>{footer}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 28 },
  steps: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  dot: { height: 8, borderRadius: 4 },
  header: { alignItems: "center", marginTop: 34 },
  title: {
    fontFamily: "serif",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    maxWidth: 320,
  },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  footer: { paddingBottom: 18, gap: 10, minHeight: 60 },
});

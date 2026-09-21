// Shared frame for the inner app screens (coffee details, create recipe,
// active brew, feedback ...): blush gradient, drifting beans, and a top bar
// with a glass back button, serif title and an optional right-hand slot.

import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { ReactNode } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import {
  Accent,
  Glass,
  Gradients,
  Latte,
  Orbs,
  Pop,
  SoftShadow,
} from "../constants/DesignSystem";
import BeanBackground from "./BeanBackground";

type Props = {
  title?: string;
  onBack?: () => void;
  backDisabled?: boolean;
  right?: ReactNode;
  children: ReactNode;
  contentStyle?: ViewStyle;
};

export default function ScreenShell({
  title,
  onBack,
  backDisabled,
  right,
  children,
  contentStyle,
}: Props) {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const g = isDark ? Gradients.dark : Gradients.light;
  const glass = isDark ? Glass.dark : Glass.light;
  const pop = isDark ? Pop.dark : Pop.light;
  const accent = isDark ? Accent.dark : Accent.light;
  const latte = isDark ? Latte.dark : Latte.light;
  const beanOpacity = isDark ? Orbs.dark.opacity : Orbs.light.opacity;

  return (
    <LinearGradient colors={g.screen} style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <BeanBackground colors={[pop, latte, accent]} opacity={beanOpacity} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.topBar}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              disabled={backDisabled}
              activeOpacity={0.8}
              style={[
                styles.roundButton,
                {
                  backgroundColor: glass.surface,
                  borderColor: glass.border,
                  ...SoftShadow,
                },
              ]}
            >
              <ArrowLeft size={22} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}

          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>

          {right ?? <View style={styles.spacer} />}
        </View>

        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: { width: 44, height: 44 },
  title: {
    flex: 1,
    fontFamily: "serif",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  content: { flex: 1 },
});

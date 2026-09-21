// Shared shell for the auth screens (login / sign up / verify): blush
// gradient, drifting beans, a bobbing cup, title + subtitle, and the form
// inside a frosted-glass card. Keeps the three screens visually identical.

import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft } from "lucide-react-native";
import { MotiView } from "moti";
import { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../context/ThemeContext";
import {
  Accent,
  Glass,
  Gradients,
  Latte,
  Motion,
  Orbs,
  Pop,
  Radii,
  SoftShadow,
} from "../../constants/DesignSystem";
import BeanBackground from "../BeanBackground";
import HeartCupIcon from "../HeartCupIcon";

type Props = {
  title: string;
  subtitle: string;
  onBack?: () => void;
  icon?: ReactNode; // header illustration; defaults to the heart cup
  footer?: ReactNode; // sits below the glass card
  children: ReactNode;
};

export default function AuthScreen({
  title,
  subtitle,
  onBack,
  icon,
  footer,
  children,
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

      <SafeAreaView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {onBack && (
                <TouchableOpacity
                  onPress={onBack}
                  style={[
                    styles.backButton,
                    {
                      backgroundColor: glass.surface,
                      borderColor: glass.border,
                      ...SoftShadow,
                    },
                  ]}
                >
                  <ChevronLeft size={22} color={colors.text} />
                </TouchableOpacity>
              )}

              <MotiView
                from={{ opacity: 0, scale: 0.6, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={Motion.spring}
                style={styles.cupWrap}
              >
                <MotiView
                  from={{ translateY: 0, rotate: "-3deg" }}
                  animate={{ translateY: -6, rotate: "3deg" }}
                  transition={{
                    type: "timing",
                    duration: 2600,
                    loop: true,
                    repeatReverse: true,
                  }}
                >
                  {icon ?? <HeartCupIcon width={112} />}
                </MotiView>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 14 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ...Motion.spring, delay: 120 }}
                style={styles.header}
              >
                <Text style={[styles.title, { color: colors.text }]}>
                  {title}
                </Text>
                <Text style={[styles.subtitle, { color: colors.subtext }]}>
                  {subtitle}
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ...Motion.spring, delay: 220 }}
                style={[
                  styles.card,
                  {
                    backgroundColor: glass.surface,
                    borderColor: glass.border,
                    ...SoftShadow,
                  },
                ]}
              >
                {children}
              </MotiView>

              {footer && <View style={styles.footer}>{footer}</View>}
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backButton: {
    position: "absolute",
    top: 8,
    left: 24,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  cupWrap: { alignItems: "center", marginBottom: 6 },
  header: { alignItems: "center", marginBottom: 20 },
  title: {
    fontFamily: "serif",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: { marginTop: 6, fontSize: 15, textAlign: "center" },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: 22,
  },
  footer: { marginTop: 22, alignItems: "center" },
});

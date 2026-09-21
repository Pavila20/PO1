// Small building blocks shared by the auth screens.

import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import {
  Accent,
  Glass,
  Pop,
  Radii,
  SoftShadow,
} from "../../constants/DesignSystem";

// Pill-shaped text field with a leading icon and optional trailing element
// (e.g. the show/hide-password eye)
export function GlassInput({
  icon,
  right,
  ...inputProps
}: { icon: ReactNode; right?: ReactNode } & TextInputProps) {
  const { colors, theme } = useTheme();
  const glass = theme === "dark" ? Glass.dark : Glass.light;
  const pop = theme === "dark" ? Pop.dark : Pop.light;
  return (
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor:
            theme === "dark" ? colors.inputBackground : "rgba(255,255,255,0.85)",
          borderColor: glass.border,
        },
      ]}
    >
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        style={[styles.input, { color: colors.inputText }]}
        placeholderTextColor={colors.inputPlaceholder}
        selectionColor={pop}
        {...inputProps}
      />
      {right}
    </View>
  );
}

// Pink -> caramel gradient call-to-action, with a loading spinner state
export function GradientButton({
  label,
  onPress,
  loading,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  const { theme } = useTheme();
  const pop = theme === "dark" ? Pop.dark : Pop.light;
  const accent = theme === "dark" ? Accent.dark : Accent.light;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
      style={{ width: "100%" }}
    >
      <LinearGradient
        colors={[pop, accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientButton, SoftShadow]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.gradientButtonText}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Frosted pill with a white "G" badge, matching the welcome screen
export function GoogleButton({ onPress }: { onPress: () => void }) {
  const { colors, theme } = useTheme();
  const glass = theme === "dark" ? Glass.dark : Glass.light;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.googleButton,
        {
          backgroundColor: theme === "dark" ? glass.surface : "#fff",
          borderColor: glass.border,
        },
      ]}
    >
      <View style={styles.googleCircle}>
        <Text style={styles.googleG}>G</Text>
      </View>
      <Text style={[styles.googleText, { color: colors.text }]}>Google</Text>
    </TouchableOpacity>
  );
}

// "or continue with" divider row
export function OrDivider({ label = "or continue with" }: { label?: string }) {
  const { colors, theme } = useTheme();
  const line = theme === "dark" ? Glass.dark.border : "rgba(148,102,86,0.2)";
  return (
    <View style={styles.orRow}>
      <View style={[styles.orLine, { backgroundColor: line }]} />
      <Text style={[styles.orText, { color: colors.subtext }]}>{label}</Text>
      <View style={[styles.orLine, { backgroundColor: line }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: 20,
    height: 54,
    width: "100%",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, height: "100%" },
  gradientButton: {
    width: "100%",
    height: 54,
    borderRadius: Radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButtonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  googleButton: {
    width: "100%",
    height: 54,
    borderRadius: Radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  googleG: { color: "#DB4437", fontWeight: "800", fontSize: 16 },
  googleText: { fontSize: 16, fontWeight: "700" },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, width: "100%" },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 12 },
});

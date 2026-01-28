import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function BrewScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>Brewing Screen</Text>
      <Text style={{ color: colors.subtext }}>
        Select coffee type here (Page 28)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
});

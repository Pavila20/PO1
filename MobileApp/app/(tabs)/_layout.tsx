import { Stack } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="brew" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

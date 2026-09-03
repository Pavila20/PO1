import { Stack } from "expo-router";

export default function SetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      <Stack.Screen name="wifi-scan" />
      <Stack.Screen name="connecting" />
      <Stack.Screen name="success" />
    </Stack>
  );
}

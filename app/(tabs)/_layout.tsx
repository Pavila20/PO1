import { Tabs } from "expo-router";
import { Coffee, Home, Settings } from "lucide-react-native"; // Changed ScrollText to Settings
import { StyleSheet, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { colors, theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.subtext,
        tabBarShowLabel: false,
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      {/* 2. Brew Tab (Floating Button) */}
      <Tabs.Screen
        name="brew"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.brewButton,
                { backgroundColor: theme === "dark" ? "#FFF" : "#000" },
              ]}
            >
              <Coffee
                size={24}
                color={theme === "dark" ? "#000" : "#FFF"}
                fill={theme === "dark" ? "#000" : "#FFF"}
              />
            </View>
          ),
        }}
      />

      {/* 3. Settings Tab (Replaces Orders) */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  brewButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

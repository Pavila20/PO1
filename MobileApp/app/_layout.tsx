import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ThemeProvider } from "../context/ThemeContext";
import "../src/polyfills/crypto";

// Keep the native splash screen visible while we load the Lottie component
SplashScreen.preventAutoHideAsync();

WebBrowser.maybeCompleteAuthSession();

function RootStack() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Load custom fonts, check auth, or fetch initial data here
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }
    prepareApp();
  }, []);

  // If the app is still loading behind the scenes, or the animation is playing, show the Lottie view
  if (!appReady || !animationFinished) {
    return (
      <View style={styles.splashContainer}>
        <LottieView
          autoPlay
          loop={false}
          source={require("../assets/lottie/coffee-splash.json")} // Update this path to your Lottie file
          onAnimationFinish={() => setAnimationFinished(true)}
          style={styles.lottie}
          onLayout={async () => {
            // Once the Lottie view is actually on the screen, hide the native static splash screen
            await SplashScreen.hideAsync();
          }}
        />
      </View>
    );
  }

  // Once the animation finishes, render the actual app
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#ffffff", // Make sure this matches the backgroundColor in your app.json splash screen config
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: "100%",
    height: "100%",
    // Use scale or absolute positioning here if you want it to fill the entire screen
  },
});

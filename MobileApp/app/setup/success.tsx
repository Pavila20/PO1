import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { GradientButton } from "../../src/components/auth/AuthControls";
import MachineHero from "../../src/components/setup/MachineHero";
import SetupScreen from "../../src/components/setup/SetupScreen";

export default function SetupSuccess() {
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      // Mark the general app setup as complete
      await AsyncStorage.setItem("is_setup_complete", "true");

      // Mark the specific machine as paired so home.tsx sees it
      await AsyncStorage.setItem("isMachinePaired", "true");

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Failed to save setup status", error);
      router.replace("/(tabs)/home");
    }
  };

  return (
    <SetupScreen
      step={4}
      title="PourOver is ready to use"
      subtitle="Let's brew some magic!"
      hero={<MachineHero mode="success" />}
      footer={<GradientButton label="Get started" onPress={handleGetStarted} />}
    />
  );
}

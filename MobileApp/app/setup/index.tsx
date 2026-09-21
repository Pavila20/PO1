import { useRouter } from "expo-router";
import { GradientButton } from "../../src/components/auth/AuthControls";
import MachineHero from "../../src/components/setup/MachineHero";
import SetupScreen from "../../src/components/setup/SetupScreen";

export default function SetupStart() {
  const router = useRouter();

  return (
    <SetupScreen
      step={1}
      title="Turn on your coffee maker"
      subtitle="Continue when it's on."
      hero={<MachineHero mode="idle" />}
      footer={
        <GradientButton
          label="Continue"
          onPress={() => router.push("/setup/search")}
        />
      }
    />
  );
}

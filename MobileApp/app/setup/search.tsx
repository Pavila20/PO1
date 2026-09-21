// app/setup/search.tsx

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { getMachineStatus } from "../../src/backend/api/machine"; // Import our API
import { GradientButton } from "../../src/components/auth/AuthControls";
import MachineHero, { HeroMode } from "../../src/components/setup/MachineHero";
import SetupScreen from "../../src/components/setup/SetupScreen";

type SearchState = "searching" | "found" | "notFound";

export default function SetupSearch() {
  const router = useRouter();
  const [state, setState] = useState<SearchState>("searching");

  const scanForMachine = async () => {
    setState("searching");
    const status = await getMachineStatus();

    if (status) {
      setState("found");
      // Wait a brief moment so the user sees the success state
      setTimeout(() => {
        router.push("/setup/connecting");
      }, 800);
    } else {
      setState("notFound");
    }
  };

  useEffect(() => {
    // Give it a 1.5 second delay just so the search animation is visible to the user
    const t = setTimeout(scanForMachine, 1500);
    return () => clearTimeout(t);
  }, []);

  const heroMode: HeroMode =
    state === "found" ? "success" : state === "notFound" ? "failed" : "searching";

  const title =
    state === "found"
      ? "Machine found!"
      : state === "notFound"
        ? "Machine not found"
        : "Searching for machine...";

  const subtitle =
    state === "notFound"
      ? "Make sure it's powered on and Bluetooth is on for your phone."
      : "Make sure your machine is turned on and within Bluetooth range.";

  return (
    <SetupScreen
      step={2}
      title={title}
      subtitle={subtitle}
      hero={<MachineHero mode={heroMode} />}
      footer={
        state === "notFound" ? (
          <GradientButton label="Try again" onPress={scanForMachine} />
        ) : undefined
      }
    />
  );
}

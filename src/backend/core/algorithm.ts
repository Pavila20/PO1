// backendtest/PO1/src/utils/algorithm.ts
import { PourProfile } from "../../models/types";

// Safety limits for your hardware
const MIN_TEMP = 190;
const MAX_TEMP = 210; // Max water temp in Fahrenheit
const MIN_GRIND = 1; // Finest grind
const MAX_GRIND = 30; // Coarsest grind

export const calculateNewProfile = (
  currentProfile: PourProfile,
  rating: number,
  perceivedStrength: "Too weak" | "Just right" | "Too strong",
): Omit<PourProfile, "profileId" | "createdAt"> => {
  let newTemp = currentProfile.targetTemp;
  let newGrind = currentProfile.grindSize;

  // If the coffee was perfect (4 or 5 stars and just right), don't change the math!
  if (rating >= 4 && perceivedStrength === "Just right") {
    return {
      userId: currentProfile.userId,
      name: `${currentProfile.name} (Perfected)`,
      targetTemp: newTemp,
      grindSize: newGrind,
      waterVolume: currentProfile.waterVolume,
      isDefault: false,
    };
  }

  // ALGORITHM: Adjust based on strength feedback
  if (perceivedStrength === "Too weak") {
    // To extract MORE flavor: Finer grind (lower number) and hotter water
    newGrind = Math.max(MIN_GRIND, currentProfile.grindSize - 2);
    newTemp = Math.min(MAX_TEMP, currentProfile.targetTemp + 2);
  } else if (perceivedStrength === "Too strong") {
    // To extract LESS flavor: Coarser grind (higher number) and cooler water
    newGrind = Math.min(MAX_GRIND, currentProfile.grindSize + 2);
    newTemp = Math.max(MIN_TEMP, currentProfile.targetTemp - 2);
  }

  return {
    userId: currentProfile.userId,
    name: `Auto-Adjusted: ${currentProfile.name}`,
    targetTemp: newTemp,
    grindSize: newGrind,
    waterVolume: currentProfile.waterVolume,
    isDefault: false,
  };
};

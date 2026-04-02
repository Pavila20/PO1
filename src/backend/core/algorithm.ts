import { PourProfile } from "../../models/types";

// Safety limits for your hardware
const MIN_TEMP = 190;
const MAX_TEMP = 210; // Max water temp in Fahrenheit
const MIN_GRIND = 1; // Finest grind
const MAX_GRIND = 30; // Coarsest grind

export const calculateNewProfile = (
  currentProfile: PourProfile,
  rating: number, // Now uses the 1-15 scale
  perceivedStrength: "Too weak" | "Just right" | "Too strong",
): Omit<PourProfile, "profileId" | "createdAt"> => {
  let newTemp = currentProfile.targetTemp;
  let newGrind = currentProfile.grindSize;

  // 1. If it's a perfect (or near-perfect) score of 14 or 15, don't change parameters!
  if (rating >= 14 && perceivedStrength === "Just right") {
    return {
      userId: currentProfile.userId,
      name: currentProfile.name,
      targetTemp: newTemp,
      grindSize: newGrind,
      waterVolume: currentProfile.waterVolume,
      isDefault: false,
    };
  }

  // 2. The Learning Rate (Severity Multiplier)
  // A score of 1 gives a multiplier of ~0.93 (massive changes)
  // A score of 15 gives a multiplier of 0 (no changes)
  const severity = (15 - rating) / 15;

  // Max changes allowed per cycle: 6 degrees Temp, 5 steps Grind Size
  const tempDelta = Math.round(6 * severity);
  const grindDelta = Math.round(5 * severity);

  // 3. Apply Extraction Logic
  if (perceivedStrength === "Too weak") {
    // Need MORE extraction: Hotter water, Finer grind (lower number)
    newTemp += tempDelta;
    newGrind -= grindDelta;
  } else if (perceivedStrength === "Too strong") {
    // Need LESS extraction: Cooler water, Coarser grind (higher number)
    newTemp -= tempDelta;
    newGrind += grindDelta;
  } else if (perceivedStrength === "Just right" && rating < 14) {
    // The strength was good, but they didn't love the overall cup.
    // Usually means it was slightly burnt/bitter. We drop the temp by just 1 degree.
    newTemp -= 1;
  }

  // 4. Hardware Safety Bounds
  // Don't let the AI break the machine or make undrinkable coffee!
  if (newTemp > MAX_TEMP) newTemp = MAX_TEMP;
  if (newTemp < MIN_TEMP) newTemp = MIN_TEMP;

  if (newGrind > MAX_GRIND) newGrind = MAX_GRIND;
  if (newGrind < MIN_GRIND) newGrind = MIN_GRIND;

  // 5. Return the newly optimized profile
  return {
    userId: currentProfile.userId,
    name: currentProfile.name,
    targetTemp: newTemp,
    grindSize: newGrind,
    waterVolume: currentProfile.waterVolume,
    isDefault: false,
  };
};

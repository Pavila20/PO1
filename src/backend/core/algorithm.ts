// PO1/src/backend/core/algorithm.ts
import { PourProfile } from "../../models/types";

const MIN_TEMP = 190;
const MAX_TEMP = 210;
const MIN_GRIND = 1;
const MAX_GRIND = 30;
const MIN_WEIGHT = 12;
const MAX_WEIGHT = 28;

export const calculateNewProfile = (
  currentProfile: PourProfile,
  rating: number, // 1-15 enjoyment scale
  perceivedStrength: "Too weak" | "Just right" | "Too strong",
): Omit<PourProfile, "profileId" | "createdAt"> => {
  let newTemp = currentProfile.targetTemp;
  let newGrind = currentProfile.grindSize;
  let newWeight = currentProfile.coffeeWeight || 20;

  // 1. Perfection threshold (14-15 score = no change)
  if (rating >= 14 && perceivedStrength === "Just right") {
    return {
      userId: currentProfile.userId,
      name: currentProfile.name,
      targetTemp: newTemp,
      grindSize: newGrind,
      coffeeWeight: newWeight,
      waterVolume: currentProfile.waterVolume,
      bloomTime: currentProfile.bloomTime || 30,
      dispenseRate: currentProfile.dispenseRate || 3.5,
      isDefault: false,
    };
  }

  // 2. Learning Rate Calculation (Severity)
  const severity = (15 - rating) / 15;
  const tempDelta = Math.round(6 * severity);
  const grindDelta = Math.round(5 * severity);
  const weightDelta = Math.round(3 * severity);

  // 3. Apply Extraction Logic
  if (perceivedStrength === "Too weak") {
    newTemp += tempDelta; // Increase Heat
    newGrind -= grindDelta; // Finer Grind
    newWeight += weightDelta; // More Beans
  } else if (perceivedStrength === "Too strong") {
    newTemp -= tempDelta; // Decrease Heat
    newGrind += grindDelta; // Coarser Grind
    newWeight -= weightDelta; // Fewer Beans
  } else if (perceivedStrength === "Just right" && rating < 14) {
    newTemp -= 1; // Slight bitterness tweak
  }

  // 4. Safety Bounds
  if (newTemp > MAX_TEMP) newTemp = MAX_TEMP;
  if (newTemp < MIN_TEMP) newTemp = MIN_TEMP;
  if (newGrind > MAX_GRIND) newGrind = MAX_GRIND;
  if (newGrind < MIN_GRIND) newGrind = MIN_GRIND;
  if (newWeight > MAX_WEIGHT) newWeight = MAX_WEIGHT;
  if (newWeight < MIN_WEIGHT) newWeight = MIN_WEIGHT;

  return {
    userId: currentProfile.userId,
    name: currentProfile.name,
    targetTemp: newTemp,
    grindSize: newGrind,
    coffeeWeight: newWeight,
    waterVolume: currentProfile.waterVolume,
    bloomTime: currentProfile.bloomTime || 30,
    dispenseRate: currentProfile.dispenseRate || 3.5,
    isDefault: false,
  };
};

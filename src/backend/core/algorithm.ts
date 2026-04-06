import { PourProfile } from "../../models/types";

// Safety limits for your hardware
const MIN_TEMP = 190;
const MAX_TEMP = 210;
const MIN_GRIND = 1;
const MAX_GRIND = 30;

// NEW: Safety limits for the bean dose (in grams)
const MIN_WEIGHT = 12; // Minimum grounds for a decent cup
const MAX_WEIGHT = 28; // Maximum grounds the filter can probably hold

export const calculateNewProfile = (
  currentProfile: PourProfile,
  rating: number, // Now uses the 1-15 scale
  perceivedStrength: "Too weak" | "Just right" | "Too strong",
): Omit<PourProfile, "profileId" | "createdAt"> => {
  let newTemp = currentProfile.targetTemp;
  let newGrind = currentProfile.grindSize;
  let newWeight = currentProfile.coffeeWeight || 20; // Start with current weight

  // 1. If it's a perfect (or near-perfect) score of 14 or 15, don't change parameters!
  if (rating >= 14 && perceivedStrength === "Just right") {
    return {
      userId: currentProfile.userId,
      name: currentProfile.name,
      targetTemp: newTemp,
      grindSize: newGrind,
      coffeeWeight: newWeight,
      waterVolume: currentProfile.waterVolume,
      bloomTime: currentProfile.bloomTime,
      dispenseRate: currentProfile.dispenseRate,
      isDefault: false,
    };
  }

  // 2. The Learning Rate (Severity Multiplier)
  const severity = (15 - rating) / 15;
  const tempDelta = Math.round(6 * severity);
  const grindDelta = Math.round(5 * severity);

  // NEW: Calculate how many grams of beans to add/remove (max 3g change per brew)
  const weightDelta = Math.round(3 * severity);

  // 3. Apply Extraction Logic
  if (perceivedStrength === "Too weak") {
    newTemp += tempDelta; // Hotter water
    newGrind -= grindDelta; // Finer grind
    newWeight += weightDelta; // ADD MORE BEANS
  } else if (perceivedStrength === "Too strong") {
    newTemp -= tempDelta; // Cooler water
    newGrind += grindDelta; // Coarser grind
    newWeight -= weightDelta; // USE FEWER BEANS
  } else if (perceivedStrength === "Just right" && rating < 14) {
    newTemp -= 1;
  }

  // 4. Hardware Safety Bounds
  if (newTemp > MAX_TEMP) newTemp = MAX_TEMP;
  if (newTemp < MIN_TEMP) newTemp = MIN_TEMP;
  if (newGrind > MAX_GRIND) newGrind = MAX_GRIND;
  if (newGrind < MIN_GRIND) newGrind = MIN_GRIND;

  // NEW: Ensure we don't overflow the filter or use too little coffee
  if (newWeight > MAX_WEIGHT) newWeight = MAX_WEIGHT;
  if (newWeight < MIN_WEIGHT) newWeight = MIN_WEIGHT;

  // 5. Return the newly optimized profile
  return {
    userId: currentProfile.userId,
    name: currentProfile.name,
    targetTemp: newTemp,
    grindSize: newGrind,
    coffeeWeight: newWeight, // Now returns the newly calculated amount of beans!
    waterVolume: currentProfile.waterVolume,
    bloomTime: currentProfile.bloomTime,
    dispenseRate: currentProfile.dispenseRate,
    isDefault: false,
  };
};

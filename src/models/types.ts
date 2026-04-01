// backendtest/PO1/src/models/types.ts

export interface PourProfile {
  profileId: string; // Unique ID for this specific recipe
  userId: string; // The AWS Cognito User Sub (Links recipe to the logged-in user)
  name: string; // e.g., "Morning Strong", "Standard", "Milder"
  targetTemp: number; // e.g., 205 (°F or °C depending on your preference)
  grindSize: number; // e.g., 10 (Grinder timing or stepper position)
  waterVolume: number; // e.g., 250 (ml)
  isDefault: boolean; // True if it's one of the 3 required base profiles
  createdAt: string; // Timestamp
}

export interface BrewRating {
  ratingId: string; // Unique ID for this specific cup of coffee
  userId: string; // The AWS Cognito User Sub
  profileId: string; // The ID of the recipe used to make it
  rating: number; // 1 to 5 stars
  perceivedStrength: string; // e.g., "Too strong", "Just right", "Too weak"
  timestamp: string;
}

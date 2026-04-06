export interface PourProfile {
  profileId: string; // Unique ID for this specific recipe
  userId: string; // The AWS Cognito User Sub (Links recipe to the logged-in user)
  name: string; // e.g., "Morning Strong", "Standard", "Milder"
  targetTemp: number; // e.g., 205 (°F or °C depending on your preference)
  grindSize: number; // e.g., 10 (Grinder timing or stepper position)

  // --- NEW PARAMETERS FROM MIDTERM REPORT REQUIREMENTS ---
  coffeeWeight: number; // e.g., 20 (grams of coffee beans for the coffee-to-water ratio)
  waterVolume: number; // e.g., 250 (ml of water)
  bloomTime: number; // e.g., 30 (seconds for the initial bloom phase)
  dispenseRate: number; // e.g., 3.5 (mL/sec water dispersion rate)

  isDefault: boolean; // True if it's one of the 3 required base profiles
  createdAt: string; // Timestamp
}

export interface BrewRating {
  ratingId: string;
  userId: string;
  profileId: string;
  rating: number;
  perceivedStrength: string;
  timestamp: string;
  targetTemp?: number;
  grindSize?: number;
  coffeeWeight?: number;
  waterVolume?: number;
}

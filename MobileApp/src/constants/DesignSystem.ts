// New visual language for the app redesign (ui-redesign branch).
// Additive to Colors.ts/ThemeContext on purpose - existing screens keep
// using colors.X untouched until they're individually redesigned.
//
// Direction: soft, cute "strawberry latte" palette - blush and candy pink
// melting into latte, caramel and mocha. Gradient backgrounds, drifting
// coffee beans for depth, fully rounded geometry, springy motion.

// The five source colors of the palette
export const Palette = {
  blush: "#FFD6E9",
  pink: "#FFBCDA",
  latte: "#E1B09C",
  caramel: "#C79274",
  mocha: "#946656",
};

export const Gradients = {
  light: {
    // A lighter tint of blush fading down into blush itself
    screen: ["#FFF1F7", "#FFD6E9"] as const,
    // Pink -> caramel -> mocha. Starts on a slightly deepened pink so the
    // white text on it stays readable.
    hero: ["#EE97BE", "#C79274", "#946656"] as const,
    heroSoft: ["#FFBCDA", "#E1B09C"] as const,
  },
  dark: {
    screen: ["#1F1619", "#2B1E20"] as const,
    hero: ["#9A5878", "#946656", "#6B4739"] as const,
    heroSoft: ["#7A4A5E", "#946656"] as const,
  },
};

// Secondary accent: caramel (buttons, add-button, gradient end)
export const Accent = {
  light: "#C79274",
  dark: "#E1B09C",
};

// Pink leads: ratings, highlights, selected states. A deepened version of
// the palette's candy pink so it holds up as a button/border color.
export const Pop = {
  light: "#F27FAE",
  dark: "#F0A0C2",
};

// Latte, the soft in-between tone used for decoration variety
export const Latte = {
  light: "#E1B09C",
  dark: "#B88972",
};

// Base opacity of the drifting background beans (see BeanBackground)
export const Orbs = {
  light: { opacity: 0.5 },
  dark: { opacity: 0.28 },
};

export const Glass = {
  light: {
    surface: "rgba(255,255,255,0.68)",
    border: "rgba(255,255,255,0.9)",
  },
  dark: {
    surface: "rgba(255,255,255,0.07)",
    border: "rgba(255,255,255,0.14)",
  },
};

// Soft, wide, low-opacity shadows - never hard drop shadows
export const SoftShadow = {
  shadowColor: "#946656",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.16,
  shadowRadius: 18,
  elevation: 4,
};

export const Radii = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  pill: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Springy, slightly bouncy motion - reads friendlier than linear timing
export const Motion = {
  spring: { type: "spring", damping: 15, stiffness: 140 } as const,
  springSoft: { type: "spring", damping: 18, stiffness: 100 } as const,
};

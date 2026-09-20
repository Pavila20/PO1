// New visual language for the app redesign (ui-redesign branch).
// Additive to Colors.ts/ThemeContext on purpose - existing screens keep
// using colors.X untouched until they're individually redesigned.
//
// Direction: soft, cute, pink-forward pastel palette pulled from the
// reference apps (butter yellow field, blush pinks, mint, lavender),
// gradient backgrounds, glowing decorative orbs for depth, fully rounded
// geometry, springy motion. Deliberately gentle - high lightness, low-to-mid
// saturation, nothing harsh or neon.

export const Gradients = {
  light: {
    // Cream fading into a gentle pink blush - pink is part of the base
    // field itself, not just an accent on top
    screen: ["#FFF6EC", "#FFE3E9"] as const,
    // Soft rose -> peach -> warm gold. Much gentler than a saturated
    // coral; reads sweet rather than loud.
    hero: ["#F7A8C4", "#F9BE9C", "#FBD29A"] as const,
    heroSoft: ["#F9C6D6", "#FBDCC0"] as const,
  },
  dark: {
    screen: ["#1A1418", "#221A20"] as const,
    hero: ["#8E4A67", "#B2705C", "#C0905A"] as const,
    heroSoft: ["#6E3B52", "#8E5A4C"] as const,
  },
};

// Mint/teal, from the fintech-kit reference and the mint pops in the
// pastel-tracker reference. Softened from a true teal.
export const Accent = {
  light: "#5FC1A8",
  dark: "#7FD6BE",
};

// Pink is a co-lead color now, not a minor accent - used on ratings,
// highlights, decorative glows, and selected states.
export const Pop = {
  light: "#F286A9",
  dark: "#EE93AE",
};

// Third pastel for decorative variety, echoing the lavender/blue accents
// in the pastel-tracker reference. Decoration only, never text.
export const Lilac = {
  light: "#C9B6E4",
  dark: "#9C8BBF",
};

// Large, very-low-opacity circles layered behind content to give the
// background depth and glow. Not a real gaussian blur (that would need
// expo-blur, a new native dep + rebuild) - low opacity over the gradient
// reads as a soft glow well enough and stays instantly reloadable.
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
  shadowColor: "#B4707F",
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

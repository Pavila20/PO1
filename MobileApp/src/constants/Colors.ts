export const Colors = {
  light: {
    // Backgrounds
    background: "#FFF1F7", // Blush tint
    card: "#FFFFFF", // White Card
    widgetBackground: "#FFBCDA", // Candy pink

    // Standard Text
    text: "#5A3A30", // Deep mocha
    subtext: "#946656", // Mocha

    // --- NEW: Specific Text Colors for Cards ---
    // In Light Mode, cards are white, so text must be dark
    cardHeader: "#5A3A30",
    cardSubtext: "#946656",

    // Widget Text (Widget is always light colored, so text is always dark)
    widgetText: "#5A3A30",

    // Input Fields
    inputBackground: "#FFFFFF",
    inputBorder: "#E1B09C",
    inputText: "#5A3A30",
    inputPlaceholder: "#A1A1AA",
    inputIcon: "#946656",

    // Buttons & Brand
    primaryButton: "#946656",
    primaryButtonText: "#FFF1F7",
    tint: "#946656",

    // Social & Footer
    socialButtonBackground: "#FFFFFF",
    socialButtonBorder: "#E5E5E5",
    socialButtonText: "#52525B",
    socialButtonTextLabel: "#71717A",
    footerText: "#A3A3A3",
    link: "#946656",
  },
  dark: {
    // Backgrounds
    background: "#1F1619", // Deep cocoa
    card: "#946656", // Mocha
    widgetBackground: "#E1B09C", // Latte

    // Standard Text
    text: "#FFD6E9", // Blush
    subtext: "#E1B09C", // Latte

    // --- NEW: Specific Text Colors for Cards ---
    // In Dark Mode, cards are Mocha, so text must be White
    cardHeader: "#FFFFFF",
    cardSubtext: "rgba(255, 255, 255, 0.8)",

    // Widget Text (Widget stays light in dark mode design, so text stays dark)
    widgetText: "#000000",

    // Input Fields
    inputBackground: "#2B1E20",
    inputBorder: "#4A3236",
    inputText: "#FFFFFF",
    inputPlaceholder: "#A1A1AA",
    inputIcon: "#FFBCDA",

    // Buttons & Brand
    primaryButton: "#946656",
    primaryButtonText: "#FFD6E9",
    tint: "#FFBCDA",

    // Social & Footer
    socialButtonBackground: "#FFFFFF",
    socialButtonBorder: "#FFFFFF",
    socialButtonText: "#52525B",
    socialButtonTextLabel: "#A3A3A3",
    footerText: "#A3A3A3",
    link: "#FFBCDA",
  },
};

export type ThemeColors = typeof Colors.light;

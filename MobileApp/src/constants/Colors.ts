export const Colors = {
  light: {
    // Backgrounds
    background: "#FFF7ED", // Cream
    card: "#FFFFFF", // White Card
    widgetBackground: "#F0CEAB", // Light Sand

    // Standard Text
    text: "#5C3A21", // Dark Brown
    subtext: "#896D59", // Medium Brown

    // --- NEW: Specific Text Colors for Cards ---
    // In Light Mode, cards are white, so text must be dark
    cardHeader: "#5C3A21",
    cardSubtext: "#896D59",

    // Widget Text (Widget is always light colored, so text is always dark)
    widgetText: "#5C3A21",

    // Input Fields
    inputBackground: "#FFFFFF",
    inputBorder: "#D6D3D1",
    inputText: "#5C3A21",
    inputPlaceholder: "#A1A1AA",
    inputIcon: "#896D59",

    // Buttons & Brand
    primaryButton: "#A9612F",
    primaryButtonText: "#FFF7ED",
    tint: "#A9612F",

    // Social & Footer
    socialButtonBackground: "#FFFFFF",
    socialButtonBorder: "#E5E5E5",
    socialButtonText: "#52525B",
    socialButtonTextLabel: "#71717A",
    footerText: "#A3A3A3",
    link: "#A9612F",
  },
  dark: {
    // Backgrounds
    background: "#2C2929", // Dark Charcoal
    card: "#A9612F", // Brand Orange (CSS Design)
    widgetBackground: "#E6B786", // Light Sand (CSS Design)

    // Standard Text
    text: "#F0CEAB", // Light Beige
    subtext: "#D1D1D1", // Light Grey

    // --- NEW: Specific Text Colors for Cards ---
    // In Dark Mode, cards are Orange, so text must be White
    cardHeader: "#FFFFFF",
    cardSubtext: "rgba(255, 255, 255, 0.8)",

    // Widget Text (Widget stays light in dark mode design, so text stays dark)
    widgetText: "#000000",

    // Input Fields
    inputBackground: "#1C1917",
    inputBorder: "#2C2929",
    inputText: "#FFFFFF",
    inputPlaceholder: "#A1A1AA",
    inputIcon: "#F0CEAB",

    // Buttons & Brand
    primaryButton: "#A9612F",
    primaryButtonText: "#F0CEAB",
    tint: "#F0CEAB",

    // Social & Footer
    socialButtonBackground: "#FFFFFF",
    socialButtonBorder: "#FFFFFF",
    socialButtonText: "#52525B",
    socialButtonTextLabel: "#A3A3A3",
    footerText: "#A3A3A3",
    link: "#F0CEAB",
  },
};

export type ThemeColors = typeof Colors.light;

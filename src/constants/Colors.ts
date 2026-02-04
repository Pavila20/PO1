export const Colors = {
  light: {
    background: "#FFF7ED", // bg-orange-50
    text: "#92400E", // text-amber-800 (Title)
    subtext: "#78716C", // text-stone-500 (Subtitle)

    // Input Fields
    inputBackground: "#FFFFFF",
    inputBorder: "#D6D3D1", // border-stone-300
    inputText: "#71717A", // text-zinc-500
    inputPlaceholder: "#71717A",
    inputIcon: "#71717A",

    // Primary Button
    primaryButton: "#A16207", // bg-yellow-700
    primaryButtonText: "#FED7AA", // text-orange-200

    // Social Button
    socialButtonBackground: "#FFFFFF",
    socialButtonBorder: "#E5E5E5",
    socialButtonText: "#52525B", // text-zinc-600
    socialButtonTextLabel: "#71717A", // "Or continue with"

    // Footer
    footerText: "#A3A3A3", // text-neutral-400
    link: "#A16207", // text-yellow-700
  },
  dark: {
    background: "#27272A", // bg-zinc-800
    text: "#FED7AA", // text-orange-200 (Title)
    subtext: "#78716C", // text-stone-500 (Subtitle)

    // Input Fields
    inputBackground: "#09090B", // bg-zinc-950 / bg-black
    inputBorder: "#1C1917", // border-stone-900
    inputText: "#FFFFFF", // text-white
    inputPlaceholder: "#FFFFFF", // placeholder-white
    inputIcon: "#FFFFFF", // Matching white text

    // Primary Button
    primaryButton: "#A16207", // bg-yellow-700
    primaryButtonText: "#FED7AA", // text-orange-200

    // Social Button
    socialButtonBackground: "#FFFFFF", // bg-white (Google button usually stays white)
    socialButtonBorder: "#FFFFFF",
    socialButtonText: "#52525B", // text-zinc-600
    socialButtonTextLabel: "#71717A", // "Or continue with" (kept similar for visibility)

    // Footer
    footerText: "#A3A3A3", // text-neutral-400
    link: "#A16207", // text-yellow-700
  },
};

export type ThemeColors = typeof Colors.light;

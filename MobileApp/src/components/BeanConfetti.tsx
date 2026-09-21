// One-shot celebration: coffee beans rain down the screen and fade out.
// Used when a brew finishes. Purely visual, ignores touches.

import { MotiView } from "moti";
import { Dimensions, StyleSheet, View } from "react-native";
import { Bean } from "./BeanBackground";

const { width: W, height: H } = Dimensions.get("window");

const COUNT = 16;

// Deterministic "random" so the layout is stable between renders
const pseudo = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export default function BeanConfetti({ colors }: { colors: string[] }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: COUNT }, (_, i) => {
        const size = 22 + pseudo(i, 1) * 26;
        const left = pseudo(i, 2) * (W - size);
        const delay = pseudo(i, 3) * 900;
        const spin = (pseudo(i, 4) > 0.5 ? 1 : -1) * (180 + pseudo(i, 5) * 260);
        return (
          <MotiView
            key={i}
            from={{ translateY: -60, opacity: 0, rotate: "0deg" }}
            animate={{ translateY: H * 0.9, opacity: [0, 1, 1, 0], rotate: `${spin}deg` }}
            transition={{
              type: "timing",
              duration: 2600 + pseudo(i, 6) * 1200,
              delay,
            }}
            style={{ position: "absolute", top: 0, left }}
          >
            <Bean size={size} color={colors[i % colors.length]} />
          </MotiView>
        );
      })}
    </View>
  );
}

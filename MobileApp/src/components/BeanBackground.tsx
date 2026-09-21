// Decorative coffee beans that drift and slowly turn behind a screen's
// content. Replaces the plain glow circles so the backdrop matches the
// coffee theme. Purely visual: pointerEvents none, sits behind content.

import { MotiView } from "moti";
import { StyleSheet, View } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";

export function Bean({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="50" rx="29" ry="43" fill={color} />
      {/* the bean's centre crease */}
      <Path
        d="M50 10 C 36 34, 64 66, 50 90"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

type BeanSpec = {
  size: number;
  color: string;
  opacity: number;
  top: number;
  left?: number;
  right?: number;
  tilt: number; // resting angle, degrees
  swing: number; // how far it turns while drifting
  float: number; // vertical drift distance
  duration: number;
};

type Props = {
  colors: [string, string, string]; // three token colors, used in rotation
  opacity: number; // base opacity (lower in dark mode)
};

export default function BeanBackground({ colors, opacity }: Props) {
  const [a, b, c] = colors;
  const beans: BeanSpec[] = [
    { size: 230, color: a, opacity: opacity, top: -50, right: -70, tilt: 28, swing: 10, float: 18, duration: 7000 },
    { size: 170, color: b, opacity: opacity * 0.85, top: 230, left: -60, tilt: -35, swing: 12, float: -22, duration: 9000 },
    { size: 190, color: c, opacity: opacity * 0.75, top: 500, right: -55, tilt: 60, swing: 8, float: 16, duration: 8000 },
    { size: 84, color: c, opacity: opacity * 0.9, top: 120, left: 34, tilt: -20, swing: 14, float: 12, duration: 6000 },
    { size: 70, color: a, opacity: opacity * 0.9, top: 400, right: 60, tilt: 40, swing: 12, float: -14, duration: 7500 },
    { size: 96, color: b, opacity: opacity * 0.8, top: 680, left: 20, tilt: -50, swing: 10, float: 14, duration: 8500 },
  ];

  return (
    <View style={styles.layer} pointerEvents="none">
      {beans.map((s, i) => (
        <MotiView
          key={i}
          from={{ translateY: 0, rotate: `${s.tilt}deg` }}
          animate={{ translateY: s.float, rotate: `${s.tilt + s.swing}deg` }}
          transition={{
            type: "timing",
            duration: s.duration,
            loop: true,
            repeatReverse: true,
          }}
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            right: s.right,
            opacity: s.opacity,
          }}
        >
          <Bean size={s.size} color={s.color} />
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
});

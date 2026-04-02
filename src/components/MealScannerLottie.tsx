/**
 * MealScannerLottie
 * Renders the Walking Orange animation from the locally bundled JSON.
 * src/assets/meal-scanner.json is the "Walking Orange.json" file,
 * bundled by Vite — zero network, available on frame 1.
 */

import Lottie from "lottie-react";
import animationData from "@/assets/meal-scanner.json";

interface MealScannerLottieProps {
  size?: number;
  className?: string;
}

export const MealScannerLottie = ({
  size = 48,
  className,
}: MealScannerLottieProps) => (
  <span
    aria-hidden="true"
    className={className}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      flexShrink: 0,
    }}
  >
    <Lottie
      animationData={animationData}
      loop
      autoplay
      style={{ width: size, height: size, display: "block" }}
    />
  </span>
);

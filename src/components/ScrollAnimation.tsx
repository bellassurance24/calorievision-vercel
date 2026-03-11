import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

type AnimationType = "fade-up" | "fade-left" | "fade-right" | "scale" | "fade";

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
}

const animationStyles: Record<AnimationType, { initial: string; visible: string }> = {
  "fade-up": {
    initial: "opacity-0 translate-y-8",
    visible: "opacity-100 translate-y-0",
  },
  "fade-left": {
    initial: "opacity-0 -translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  "fade-right": {
    initial: "opacity-0 translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  scale: {
    initial: "opacity-0 scale-95",
    visible: "opacity-100 scale-100",
  },
  fade: {
    initial: "opacity-0",
    visible: "opacity-100",
  },
};

export const ScrollAnimation = ({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
}: ScrollAnimationProps) => {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold });

  const style = animationStyles[animation];

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out will-change-transform",
        isVisible ? style.visible : style.initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;

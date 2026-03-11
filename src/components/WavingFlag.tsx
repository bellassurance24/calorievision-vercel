import { cn } from "@/lib/utils";

interface WavingFlagProps {
  src: string;
  alt: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const WavingFlag = ({ src, alt, className, size = "md" }: WavingFlagProps) => {
  const sizeClasses = {
    sm: "w-5 h-4",
    md: "w-7 h-5",
    lg: "w-8 h-6"
  };

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        sizeClasses[size],
        "object-cover animate-wave",
        className
      )}
      loading="lazy"
      decoding="async"
    />
  );
};

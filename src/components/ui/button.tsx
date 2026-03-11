import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary brand style – matches the "Analyze a meal" CTA gradient
        default:
          "relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/30 hover:from-primary/90 hover:to-accent/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Still clickable but visually consistent with the primary gradient
        outline:
          "relative overflow-hidden border border-primary bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm hover:from-primary/90 hover:to-accent/90",
        secondary:
          "relative overflow-hidden bg-gradient-to-r from-primary to-accent/90 text-primary-foreground/95 shadow-sm hover:from-primary/95 hover:to-accent",
        ghost:
          "relative overflow-hidden bg-gradient-to-r from-primary/90 to-accent/90 text-primary-foreground hover:from-primary hover:to-accent",
        link: "text-primary underline-offset-4 hover:underline",
        hero:
          "relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 hover:from-primary/90 hover:to-accent/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

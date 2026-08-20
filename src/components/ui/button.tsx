import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold tracking-wide transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "btn-shine bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground shadow-[0_0_28px_rgba(45,212,191,.35)] hover:shadow-[0_0_44px_rgba(45,212,191,.55)]",
        secondary:
          "btn-shine bg-gradient-to-r from-secondary to-amber-400 text-secondary-foreground shadow-[0_0_24px_rgba(245,158,11,.3)] hover:shadow-[0_0_40px_rgba(245,158,11,.5)]",
        outline:
          "border border-primary/30 bg-white/5 text-foreground backdrop-blur hover:border-primary/60 hover:bg-primary/10 hover:text-white",
        ghost: "hover:bg-white/10",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

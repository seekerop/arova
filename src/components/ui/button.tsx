import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E84B2C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080505] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#E84B2C] text-[#F3F0E8] hover:bg-[#D94022] shadow-[0_0_20px_rgba(232,75,44,0.25)] hover:shadow-[0_0_28px_rgba(232,75,44,0.4)]",
      secondary:
        "bg-[#161514] text-[#F3F0E8] border border-[rgba(243,240,232,0.12)] hover:bg-[#1C1916] hover:border-[rgba(243,240,232,0.24)]",
      outline:
        "bg-transparent text-[#F3F0E8] border border-[rgba(243,240,232,0.15)] hover:bg-[#161514] hover:border-[rgba(232,75,44,0.35)]",
      ghost:
        "bg-transparent text-[#D0CBC1] hover:text-[#F3F0E8] hover:bg-[#161514]",
      destructive:
        "bg-[#B91C1C] text-[#F3F0E8] hover:bg-[#991B1B] shadow-[0_0_15px_rgba(185,28,28,0.25)]",
      gold:
        "bg-gradient-to-r from-[#D4AF37] to-[#C86938] text-[#080505] font-semibold hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.25)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

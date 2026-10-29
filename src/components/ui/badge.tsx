import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "flame"
    | "amber"
    | "copper"
    | "gold"
    | "success"
    | "muted"
    | "outline"
    | "category"
    | "warning"
    | "destructive"
    | "secondary";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const variants = {
    default:
      "bg-[#161514] text-[#F3F0E8] border border-[rgba(243,240,232,0.12)]",
    flame:
      "bg-[rgba(232,75,44,0.12)] text-[#E84B2C] border border-[rgba(232,75,44,0.3)]",
    destructive:
      "bg-[rgba(232,75,44,0.12)] text-[#E84B2C] border border-[rgba(232,75,44,0.3)]",
    amber:
      "bg-[rgba(255,170,61,0.12)] text-[#FFAA3D] border border-[rgba(255,170,61,0.3)]",
    warning:
      "bg-[rgba(255,170,61,0.12)] text-[#FFAA3D] border border-[rgba(255,170,61,0.3)]",
    copper:
      "bg-[rgba(200,105,56,0.12)] text-[#C86938] border border-[rgba(200,105,56,0.3)]",
    gold:
      "bg-[rgba(212,175,55,0.12)] text-[#D4AF37] border border-[rgba(212,175,55,0.3)]",
    success:
      "bg-[rgba(52,211,153,0.12)] text-[#34D399] border border-[rgba(52,211,153,0.3)]",
    muted:
      "bg-[#111110] text-[#A39E93] border border-[rgba(243,240,232,0.08)]",
    secondary:
      "bg-[#111110] text-[#A39E93] border border-[rgba(243,240,232,0.08)]",
    outline:
      "bg-transparent text-[#D0CBC1] border border-[rgba(243,240,232,0.15)]",
    category:
      "bg-[#1C1916] text-[#FFAA3D] border border-[rgba(255,170,61,0.25)] font-medium",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs rounded-[4px]",
    md: "px-2.5 py-1 text-xs rounded-[6px]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-medium transition-colors focus:outline-none",
        variants[variant] || variants.default,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

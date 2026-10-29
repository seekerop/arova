import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[8px] border border-[rgba(243,240,232,0.12)] bg-[#111110] px-3 py-2 text-sm text-[#F3F0E8] placeholder:text-[#A39E93] transition-colors focus-visible:outline-none focus-visible:border-[#E84B2C] focus-visible:ring-1 focus-visible:ring-[#E84B2C] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[8px] border border-[rgba(243,240,232,0.12)] bg-[#111110] px-3 py-2 text-sm text-[#F3F0E8] placeholder:text-[#A39E93] transition-colors focus-visible:outline-none focus-visible:border-[#E84B2C] focus-visible:ring-1 focus-visible:ring-[#E84B2C] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-[8px] border border-[rgba(243,240,232,0.12)] bg-[#111110] px-3 py-2 text-sm text-[#F3F0E8] focus-visible:outline-none focus-visible:border-[#E84B2C] focus-visible:ring-1 focus-visible:ring-[#E84B2C] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";


"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#002855] text-white hover:bg-[#001a3d] focus-visible:ring-[#002855] active:bg-[#001020]",
      secondary:
        "bg-[#e41d35] text-white hover:bg-[#bb0024] focus-visible:ring-[#e41d35]",
      outline:
        "border border-[#002855] text-[#002855] bg-transparent hover:bg-[#002855]/5 focus-visible:ring-[#002855]",
      ghost:
        "text-[#002855] bg-transparent hover:bg-[#002855]/8 focus-visible:ring-[#002855]",
      danger:
        "bg-[#ba1a1a] text-white hover:bg-[#93000a] focus-visible:ring-[#ba1a1a]",
    };

    const sizes = {
      sm: "text-sm px-3 py-1.5",
      md: "text-sm px-5 py-2.5",
      lg: "text-base px-7 py-3.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

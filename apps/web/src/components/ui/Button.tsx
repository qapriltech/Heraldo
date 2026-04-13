"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gold text-navy-dark font-semibold hover:bg-gold-light shadow-md hover:shadow-lg",
  secondary:
    "bg-navy text-white font-semibold hover:bg-navy-light shadow-md hover:shadow-lg",
  outline:
    "border-2 border-gold text-gold hover:bg-gold hover:text-navy-dark font-semibold",
  ghost: "text-navy hover:bg-navy/5 font-medium",
  danger: "bg-red-600 text-white font-semibold hover:bg-red-700 shadow-md",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={`inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer
          ${variantClasses[variant]} ${sizeClasses[size]}
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
          ${className}`}
        disabled={disabled || loading}
        {...(props as object)}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
export default Button;

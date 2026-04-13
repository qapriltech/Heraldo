import type { ReactNode } from "react";

type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "gold";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-green/10 text-green border-green/20",
  warning: "bg-orange/10 text-orange border-orange/20",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  neutral: "bg-warm-gray/10 text-warm-gray border-warm-gray/20",
  gold: "bg-gold/10 text-gold-dark border-gold/20",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-green",
  warning: "bg-orange",
  error: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-warm-gray",
  gold: "bg-gold",
};

export default function Badge({
  children,
  variant = "neutral",
  className = "",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border
        ${variantClasses[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}

// Safe Button component without circular dependencies
import { cn } from "@/lib/utils";
import React, { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children: React.ReactNode;
  loading?: boolean;
}

const SpinnerIcon = () => (
    <div
        className="w-4 h-4 border-4 border-t-[#275559] border-gray-300 rounded-full animate-spin "
    ></div>
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant = "default", size = "default", children, loading = false, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-[#275559] text-white hover:bg-[#1e4347]",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    
    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? <SpinnerIcon /> : children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
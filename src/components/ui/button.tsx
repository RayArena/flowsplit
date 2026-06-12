import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712] disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-lg focus-visible:ring-[#6366f1] active:scale-[0.98]",
        secondary:
          "bg-[#1e293b] hover:bg-[#334155] text-[#f8fafc] border border-white/10 hover:border-white/20 focus-visible:ring-white/20",
        ghost:
          "hover:bg-white/5 text-[#94a3b8] hover:text-[#f8fafc] focus-visible:ring-white/20",
        danger:
          "bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/20 focus-visible:ring-[#ef4444]",
        outline:
          "border border-white/15 hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 text-[#f8fafc] focus-visible:ring-[#6366f1]",
        gradient:
          "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white shadow-lg shadow-[#6366f1]/20 focus-visible:ring-[#6366f1] active:scale-[0.98]",
        success:
          "bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/20 focus-visible:ring-[#22c55e]",
        link:
          "text-[#818cf8] hover:text-[#6366f1] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-lg",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        xl: "h-13 px-8 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0 rounded-lg",
        "icon-lg": "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
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
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-[#94a3b8] border border-white/10",
        brand:
          "bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/25",
        success:
          "bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/25",
        danger:
          "bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/25",
        warning:
          "bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/25",
        purple:
          "bg-[#8b5cf6]/15 text-[#a78bfa] border border-[#8b5cf6]/25",
        outline:
          "border border-white/20 text-[#94a3b8]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };

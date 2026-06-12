import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

const cardVariants = cva(
  "rounded-2xl transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-[#0f172a] border border-white/8",
        glass: "glass",
        "glass-strong": "glass-strong",
        elevated:
          "bg-[#1e293b] border border-white/10 shadow-xl shadow-black/30",
        gradient:
          "bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10",
        brand:
          "bg-gradient-to-br from-[#6366f1]/10 to-[#8b5cf6]/5 border border-[#6366f1]/20",
        success:
          "bg-gradient-to-br from-[#22c55e]/10 to-transparent border border-[#22c55e]/20",
        danger:
          "bg-gradient-to-br from-[#ef4444]/10 to-transparent border border-[#ef4444]/20",
      },
      hover: {
        true: "card-hover cursor-pointer",
        false: "",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: false,
      padding: "lg",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hover, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-base font-semibold text-[#f8fafc]", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-[#64748b]", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-4 border-t border-white/8", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };

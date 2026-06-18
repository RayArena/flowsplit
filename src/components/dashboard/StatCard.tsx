"use client";

import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  currency?: string;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  variant?: "default" | "positive" | "negative" | "neutral" | "brand";
  index?: number;
}

const variantStyles = {
  default: {
    card: "bg-[#0f172a] border-white/8",
    icon: "bg-white/5 text-[#94a3b8]",
    value: "text-[#f8fafc]",
    trend: "",
  },
  positive: {
    card: "bg-gradient-to-br from-[#22c55e]/8 to-[#0f172a] border-[#22c55e]/15",
    icon: "bg-[#22c55e]/10 text-[#4ade80]",
    value: "text-[#4ade80]",
    trend: "text-[#4ade80]",
  },
  negative: {
    card: "bg-gradient-to-br from-[#ef4444]/8 to-[#0f172a] border-[#ef4444]/15",
    icon: "bg-[#ef4444]/10 text-[#f87171]",
    value: "text-[#f87171]",
    trend: "text-[#f87171]",
  },
  neutral: {
    card: "bg-gradient-to-br from-[#f59e0b]/8 to-[#0f172a] border-[#f59e0b]/15",
    icon: "bg-[#f59e0b]/10 text-[#fbbf24]",
    value: "text-[#fbbf24]",
    trend: "text-[#fbbf24]",
  },
  brand: {
    card: "bg-gradient-to-br from-[#6366f1]/10 to-[#0f172a] border-[#6366f1]/20",
    icon: "bg-[#6366f1]/15 text-[#818cf8]",
    value: "text-[#818cf8]",
    trend: "text-[#818cf8]",
  },
};

export function StatCard({
  title,
  value,
  currency = "INR",
  prefix = "",
  suffix = "",
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
  index = 0,
}: StatCardProps) {
  const styles = variantStyles[variant];

  const TrendIcon =
    trend === undefined ? Minus : trend > 0 ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        "rounded-2xl border p-6 card-hover relative overflow-hidden",
        styles.card
      )}
    >
      {/* Subtle corner decoration */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/2 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium text-[#64748b]">{title}</p>
          <div className={cn("p-2 rounded-xl", styles.icon)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mb-2">
          {prefix && (
            <span className={cn("text-lg font-medium mr-0.5", styles.value)}>
              {prefix}
            </span>
          )}
          <span className={cn("text-3xl font-bold tracking-tight", styles.value)}>
            {currency
              ? formatCurrency(value, currency)
              : `${value.toLocaleString()}${suffix}`}
          </span>
        </div>

        {trend !== undefined && trendLabel && (
          <div className="flex items-center gap-1.5">
            <TrendIcon className={cn("w-3.5 h-3.5", styles.trend)} />
            <span className={cn("text-xs font-medium", styles.trend)}>
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
            <span className="text-xs text-[#475569]">{trendLabel}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(date);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateAvatarColor(name: string): string {
  const colors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#06b6d4", "#3b82f6",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    food: "🍕",
    transport: "🚗",
    accommodation: "🏠",
    entertainment: "🎬",
    utilities: "💡",
    shopping: "🛍️",
    health: "💊",
    other: "📦",
  };
  return icons[category] ?? "📦";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    food: "#f97316",
    transport: "#3b82f6",
    accommodation: "#8b5cf6",
    entertainment: "#ec4899",
    utilities: "#eab308",
    shopping: "#14b8a6",
    health: "#22c55e",
    other: "#6b7280",
  };
  return colors[category] ?? "#6b7280";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
];

export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Drinks", icon: "🍕" },
  { value: "transport", label: "Transport", icon: "🚗" },
  { value: "accommodation", label: "Accommodation", icon: "🏠" },
  { value: "entertainment", label: "Entertainment", icon: "🎬" },
  { value: "utilities", label: "Utilities", icon: "💡" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "health", label: "Health", icon: "💊" },
  { value: "other", label: "Other", icon: "📦" },
] as const;

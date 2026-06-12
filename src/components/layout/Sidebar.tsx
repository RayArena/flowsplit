"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isClerkConfigured } from "@/lib/clerk-config";
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  ArrowLeftRight,
  Settings,
  Zap,
  Bell,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically load Clerk UserButton
let UserButton: React.ComponentType<{ afterSignOutUrl?: string; appearance?: object }> | null = null;
if (isClerkConfigured()) {
  UserButton = require("@clerk/nextjs").UserButton;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/groups", icon: Users, label: "Groups" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settlements", icon: ArrowLeftRight, label: "Settlements" },
];

const bottomItems = [
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col border-r border-white/8 bg-[#0a0f1e] z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/8">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-[#f8fafc] font-semibold text-base tracking-tight">
          Flow<span className="gradient-text-brand">Split</span>
        </span>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-white/8">
        <button
          id="sidebar-search"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/8 text-[#475569] hover:text-[#94a3b8] hover:bg-white/6 transition-all text-sm"
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-xs bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-medium text-[#334155] uppercase tracking-widest px-3 mb-2">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/20"
                  : "text-[#475569] hover:text-[#94a3b8] hover:bg-white/4"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? "text-[#6366f1]"
                    : "text-[#475569] group-hover:text-[#64748b]"
                )}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-white/8 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:text-[#94a3b8] hover:bg-white/4 transition-all"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}

        {/* Notifications */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:text-[#94a3b8] hover:bg-white/4 transition-all">
          <div className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#6366f1]" />
          </div>
          Notifications
          <span className="ml-auto bg-[#6366f1]/20 text-[#818cf8] text-xs px-1.5 py-0.5 rounded-full">
            3
          </span>
        </button>

        {/* User — Clerk or fallback */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
          {isClerkConfigured() && UserButton ? (
            <>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: { avatarBox: "w-7 h-7 rounded-lg" },
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#94a3b8] truncate">
                  My Account
                </div>
                <div className="text-[10px] text-[#475569] truncate">
                  Manage profile
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-[#818cf8]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#94a3b8] truncate">
                  Demo Mode
                </div>
                <div className="text-[10px] text-[#475569] truncate">
                  Configure .env.local
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

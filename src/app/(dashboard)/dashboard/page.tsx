"use client";

import { motion } from "framer-motion";
import { isClerkConfigured } from "@/lib/clerk-config";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";

import {
  Wallet,
  Users,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime, getCategoryIcon } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Metadata } from "next";

// ---- Mock data for UI demo (replace with real API calls) ----
const SPENDING_TREND = [
  { month: "Jan", amount: 12400 },
  { month: "Feb", amount: 8900 },
  { month: "Mar", amount: 15200 },
  { month: "Apr", amount: 11600 },
  { month: "May", amount: 18300 },
  { month: "Jun", amount: 14700 },
  { month: "Jul", amount: 21200 },
];

const CATEGORY_DATA = [
  { name: "Food & Drinks", value: 35, color: "#f97316" },
  { name: "Transport", value: 20, color: "#3b82f6" },
  { name: "Accommodation", value: 25, color: "#8b5cf6" },
  { name: "Entertainment", value: 10, color: "#ec4899" },
  { name: "Other", value: 10, color: "#64748b" },
];

const RECENT_ACTIVITY = [
  {
    id: "1",
    icon: "🍕",
    description: "Anjali added Dinner at Truffles",
    group: "Bangalore Trip",
    amount: 2400,
    time: "2026-06-18T14:30:00Z",
    type: "expense" as const,
  },
  {
    id: "2",
    icon: "✅",
    description: "Rahul settled up with you",
    group: "Office Lunches",
    amount: 1800,
    time: "2026-06-18T11:15:00Z",
    type: "settlement" as const,
  },
  {
    id: "3",
    icon: "🚗",
    description: "You added Uber to Airport",
    group: "Goa Trip",
    amount: 650,
    time: "2026-06-17T22:45:00Z",
    type: "expense" as const,
  },
  {
    id: "4",
    icon: "🏠",
    description: "Priya added Hotel Booking",
    group: "Goa Trip",
    amount: 8500,
    time: "2026-06-17T18:20:00Z",
    type: "expense" as const,
  },
  {
    id: "5",
    icon: "💡",
    description: "Electricity bill split",
    group: "Flat 4B",
    amount: 1200,
    time: "2026-06-17T09:00:00Z",
    type: "expense" as const,
  },
];

const SUGGESTED_SETTLEMENTS = [
  { from: "You", to: "Anjali S.", amount: 3200 },
  { from: "Rahul M.", to: "You", amount: 1800 },
];

// Custom Tooltip for AreaChart
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs">
        <div className="text-[#64748b] mb-1">{label}</div>
        <div className="text-[#f8fafc] font-semibold">
          {formatCurrency(payload[0].value)}
        </div>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">
            {isClerkConfigured() ? (
              <DashboardGreeting />
            ) : (
              <>Good evening, there 👋</>
            )}
          </h1>
          <p className="text-[#64748b] text-sm mt-1">
            Here&apos;s your financial overview for this month.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/groups">
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4" />
              New Group
            </Button>
          </Link>
          <Button variant="gradient" size="sm">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            title="Total Spending"
            value={102200}
            currency="INR"
            icon={Wallet}
            trend={8}
            trendLabel="vs last month"
            variant="brand"
            index={0}
          />
        </div>
        <div>
          <StatCard
            title="Active Groups"
            value={6}
            currency=""
            suffix=" groups"
            icon={Users}
            trend={2}
            trendLabel="this month"
            variant="default"
            index={1}
          />
        </div>
        <div>
          <StatCard
            title="You Owe"
            value={8400}
            currency="INR"
            icon={TrendingDown}
            trend={-12}
            trendLabel="vs last month"
            variant="negative"
            index={2}
          />
        </div>
        <div>
          <StatCard
            title="Owed to You"
            value={14200}
            currency="INR"
            icon={TrendingUp}
            trend={15}
            trendLabel="vs last month"
            variant="positive"
            index={3}
          />
        </div>
        <div>
          <StatCard
            title="Net Balance"
            value={5800}
            currency="INR"
            icon={ArrowUpRight}
            trend={5}
            trendLabel="vs last month"
            variant="positive"
            index={4}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card variant="default" padding="lg">
            <CardHeader className="mb-5">
              <div className="flex items-center justify-between">
                <CardTitle>Spending Trend</CardTitle>
                <Badge variant="brand">Last 7 months</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={SPENDING_TREND}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#475569", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#475569", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#spendGradient)"
                    dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#818cf8" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card variant="default" padding="lg" className="h-full">
            <CardHeader className="mb-5">
              <CardTitle>By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="glass rounded-xl px-3 py-2 text-xs">
                            <div className="text-[#f8fafc]">{payload[0].name}</div>
                            <div className="text-[#6366f1] font-semibold">{payload[0].value}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {CATEGORY_DATA.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[#64748b] flex-1 truncate">{cat.name}</span>
                    <span className="text-[#94a3b8] font-medium">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card variant="default" padding="lg">
            <CardHeader className="mb-5">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Link href="/expenses">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {RECENT_ACTIVITY.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#cbd5e1] truncate">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#475569]">{activity.group}</span>
                        <span className="text-[#334155]">·</span>
                        <span className="text-xs text-[#475569]">
                          {formatRelativeTime(activity.time)}
                        </span>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold flex-shrink-0 ${activity.type === "settlement" ? "text-[#4ade80]" : "text-[#f8fafc]"}`}>
                      {activity.type === "settlement" ? "+" : ""}
                      {formatCurrency(activity.amount)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settlement Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card variant="brand" padding="lg" className="h-full">
            <CardHeader className="mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#6366f1]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#818cf8]" />
                </div>
                <CardTitle>Smart Settlements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-3">
                <div className="text-4xl font-black gradient-text-brand mb-1">5</div>
                <div className="text-xs text-[#64748b]">optimized payments</div>
                <div className="text-xs text-[#475569] mt-1">vs 14 raw transactions</div>

                <div className="mt-3 px-3 py-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20">
                  <span className="text-xs text-[#4ade80] font-semibold">64% reduction ↓</span>
                </div>
              </div>

              <div className="space-y-2">
                {SUGGESTED_SETTLEMENTS.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/5"
                  >
                    <Avatar name={s.from} size="xs" />
                    <span className="text-xs text-[#64748b] flex-shrink-0">→</span>
                    <Avatar name={s.to} size="xs" />
                    <div className="flex-1 min-w-0 mx-1">
                      <span className="text-xs text-[#94a3b8] truncate block">
                        {s.from} → {s.to}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#818cf8] flex-shrink-0">
                      {formatCurrency(s.amount)}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/settlements">
                <Button variant="gradient" size="sm" className="w-full text-xs">
                  View All Settlements
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

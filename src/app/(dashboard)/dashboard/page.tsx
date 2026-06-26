"use client";

import { motion } from "framer-motion";
import { isClerkConfigured } from "@/lib/clerk-config";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { useQuery } from "@tanstack/react-query";

import {
  Wallet,
  Users,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
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
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (!res.ok) throw new Error(json.details || json.error || "Failed to fetch stats");
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
        <p className="text-[#64748b] text-sm">Loading dashboard analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f8fafc]">
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/groups">
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Group</span>
              <span className="sm:hidden">Group</span>
            </Button>
          </Link>
          <Link href="/groups">
            <Button variant="gradient" size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Expense</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="col-span-2 sm:col-span-1">
          <StatCard
            title="Total Spending"
            value={stats?.totalSpending || 0}
            currency="INR"
            icon={Wallet}
            trend={0}
            trendLabel="total logged by you"
            variant="brand"
            index={0}
          />
        </div>
        <div>
          <StatCard
            title="Active Groups"
            value={stats?.activeGroups || 0}
            currency=""
            suffix=" groups"
            icon={Users}
            trend={0}
            trendLabel="active splits"
            variant="default"
            index={1}
          />
        </div>
        <div>
          <StatCard
            title="You Owe"
            value={stats?.totalOwed || 0}
            currency="INR"
            icon={TrendingDown}
            trend={0}
            trendLabel="pending settlements"
            variant="negative"
            index={2}
          />
        </div>
        <div>
          <StatCard
            title="Owed to You"
            value={stats?.totalReceivable || 0}
            currency="INR"
            icon={TrendingUp}
            trend={0}
            trendLabel="receivable balances"
            variant="positive"
            index={3}
          />
        </div>
        <div>
          <StatCard
            title="Net Balance"
            value={stats?.netBalance || 0}
            currency="INR"
            icon={ArrowUpRight}
            trend={0}
            trendLabel="net position"
            variant={(stats?.netBalance || 0) >= 0 ? "positive" : "negative"}
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
                <AreaChart data={stats?.spendingTrend || []}>
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
                    data={stats?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(stats?.categoryDistribution || []).map((entry: any, index: number) => (
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
                {(stats?.categoryDistribution || []).slice(0, 4).map((cat: any) => (
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
                <Link href="/groups">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View groups <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {(stats?.recentActivity || []).map((activity: any, i: number) => (
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
                {(stats?.recentActivity || []).length === 0 && (
                  <div className="text-center text-xs py-8 text-[#475569]">
                    No activity registered yet.
                  </div>
                )}
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
                <div className="text-4xl font-black gradient-text-brand mb-1">
                  {stats?.totalOptimizedPaymentsCount || 0}
                </div>
                <div className="text-xs text-[#64748b]">optimized payments</div>
                <div className="text-xs text-[#475569] mt-1">
                  vs {stats?.totalRawTransactionsCount || 0} raw transactions
                </div>

                <div className="mt-3 px-3 py-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20">
                  <span className="text-xs text-[#4ade80] font-semibold">
                    {stats?.totalRawTransactionsCount > 0
                      ? Math.round(
                          ((stats.totalRawTransactionsCount - stats.totalOptimizedPaymentsCount) /
                            stats.totalRawTransactionsCount) *
                            100
                        )
                      : 0}
                    % reduction ↓
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {(stats?.suggestedSettlements || []).map((s: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/5"
                  >
                    <Avatar name={s.payerName} size="xs" />
                    <span className="text-xs text-[#64748b] flex-shrink-0">→</span>
                    <Avatar name={s.receiverName} size="xs" />
                    <div className="flex-1 min-w-0 mx-1">
                      <span className="text-xs text-[#94a3b8] truncate block">
                        {s.payerName} → {s.receiverName}
                      </span>
                      <span className="text-[10px] text-[#475569] truncate block">
                        {s.groupName}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#818cf8] flex-shrink-0">
                      {formatCurrency(s.amount)}
                    </span>
                  </div>
                ))}
                {(stats?.suggestedSettlements || []).length === 0 && (
                  <div className="text-center text-xs py-4 text-[#475569]">
                    All settled up! No recommended payments.
                  </div>
                )}
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

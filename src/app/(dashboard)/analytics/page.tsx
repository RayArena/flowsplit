"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs space-y-1">
        <div className="text-[#94a3b8] font-medium mb-1">{label}</div>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[#64748b]">{p.name}:</span>
            <span className="text-[#f8fafc] font-semibold">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("Last 3 months");

  const DATE_RANGES = ["Last 7 days", "Last month", "Last 3 months", "Last year"];

  const rangeParam = dateRange === "Last 7 days" ? "last_7_days"
    : dateRange === "Last month" ? "last_month"
    : dateRange === "Last year" ? "last_year"
    : "last_3_months";

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", rangeParam],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?range=${rangeParam}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch analytics");
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
        <p className="text-[#64748b] text-sm">Loading analytics...</p>
      </div>
    );
  }

  const topMetrics = analytics?.topMetrics || {};
  const spendingTrend = analytics?.spendingTrend || [];
  const categoryDistribution = analytics?.categoryDistribution || [];
  const memberContributions = analytics?.memberContributions || [];
  const yearComparison = analytics?.yearComparison || [];

  const thisYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Analytics</h1>
          <p className="text-[#64748b] text-sm mt-1">
            Deep insights into your spending patterns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0f172a] border border-white/8 rounded-xl p-1">
            {DATE_RANGES.map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  dateRange === range
                    ? "bg-[#6366f1]/20 text-[#818cf8]"
                    : "text-[#475569] hover:text-[#94a3b8]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Top metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Spent",
            value: formatCurrency(topMetrics.totalSpent || 0),
            change: topMetrics.activeGroups > 0 ? `Across ${topMetrics.activeGroups} groups` : "No data",
            up: null,
          },
          {
            label: "Avg Monthly",
            value: formatCurrency(topMetrics.avgMonthly || 0),
            change: "average per month",
            up: null,
          },
          {
            label: "Biggest Expense",
            value: formatCurrency(topMetrics.biggestExpense || 0),
            change: topMetrics.biggestExpenseTitle || "N/A",
            up: null,
          },
          {
            label: "Groups Active",
            value: String(topMetrics.activeGroups || 0),
            change: topMetrics.newGroupsThisMonth ? `${topMetrics.newGroupsThisMonth} active this month` : "0 active",
            up: true,
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#0f172a] border border-white/8 rounded-2xl p-5"
          >
            <div className="text-xs text-[#475569] mb-2">{m.label}</div>
            <div className="text-xl font-bold text-[#f8fafc] mb-1">{m.value}</div>
            <div className={`text-xs ${m.up === true ? "text-[#4ade80]" : m.up === false ? "text-[#f87171]" : "text-[#64748b]"}`}>
              {m.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Spending Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="default" padding="lg">
          <CardHeader className="mb-5">
            <div className="flex items-center justify-between">
              <CardTitle>Spending Trends</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                  <div className="w-3 h-0.5 bg-[#6366f1]" />
                  Personal
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                  <div className="w-3 h-0.5 bg-[#8b5cf6]" />
                  Group
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {spendingTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={spendingTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="personal" name="Personal" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="group" name="Group" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-[#475569] text-xs">No spending data available yet.</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Category + Member charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card variant="default" padding="lg" className="h-full">
            <CardHeader className="mb-5">
              <CardTitle>Category Spending</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryDistribution.length > 0 ? (
                <div className="flex gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {categoryDistribution.map((entry: any, i: number) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="glass rounded-xl px-3 py-2 text-xs">
                              <div className="text-[#f8fafc]">{payload[0].name}</div>
                              <div className="font-semibold" style={{ color: (payload[0].payload as { color: string }).color }}>{payload[0].value}%</div>
                            </div>
                          );
                        }
                        return null;
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2.5 justify-center flex flex-col">
                    {categoryDistribution.map((c: any) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-[#64748b] flex-1 truncate">{c.name}</span>
                        <span className="text-xs font-medium text-[#94a3b8]">{formatCurrency(c.amount)}</span>
                        <span className="text-xs text-[#475569] w-6 text-right">{c.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-[#475569] text-xs">No category data available yet.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Member contributions bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="default" padding="lg" className="h-full">
            <CardHeader className="mb-5">
              <CardTitle>Member Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              {memberContributions.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={memberContributions} layout="vertical" barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="paid" name="Paid" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="owed" name="Owes" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-[#475569] text-xs">No member data available yet.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Comparison Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card variant="default" padding="lg">
          <CardHeader className="mb-5">
            <div className="flex items-center justify-between">
              <CardTitle>Year-over-Year Comparison</CardTitle>
              <Badge variant="brand">
                <Calendar className="w-3 h-3" />
                {thisYear - 1} vs {thisYear}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {yearComparison.some((y: any) => y.thisYear > 0 || y.lastYear > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={yearComparison}>
                  <defs>
                    <linearGradient id="thisYear" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lastYear" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="thisYear" name={String(thisYear)} stroke="#6366f1" fill="url(#thisYear)" strokeWidth={2} />
                  <Area type="monotone" dataKey="lastYear" name={String(thisYear - 1)} stroke="#94a3b8" fill="url(#lastYear)" strokeWidth={1.5} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-[#475569] text-xs">
                Not enough data yet for year-over-year comparison. Start logging expenses!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

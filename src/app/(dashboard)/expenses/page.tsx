"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime, getCategoryIcon, getCategoryColor, EXPENSE_CATEGORIES } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const SPLIT_TYPE_LABELS: Record<string, string> = {
  equal: "Equal",
  percentage: "%",
  exact: "Exact",
  shares: "Shares",
};

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all user expenses
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch("/api/expenses");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch expenses");
      return json.data || [];
    },
  });

  const filtered = data.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.groupName && e.groupName.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = !selectedCategory || e.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
        <p className="text-[#64748b] text-sm">Loading expenses list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Expenses</h1>
          <p className="text-[#64748b] text-sm mt-1">
            {filtered.length} expenses · {formatCurrency(total)} total
          </p>
        </div>
        <Link href="/groups">
          <Button variant="gradient" size="md" id="add-expense-btn">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <div className="flex-1">
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            id="expense-search"
          />
        </div>
        <Button variant="secondary" size="md">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </motion.div>

      {/* Category filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            !selectedCategory
              ? "bg-[#6366f1]/15 border-[#6366f1]/30 text-[#818cf8]"
              : "bg-transparent border-white/10 text-[#475569] hover:border-white/20"
          }`}
        >
          All categories
        </button>
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 ${
              selectedCategory === cat.value
                ? "border-[#6366f1]/30 text-[#818cf8]"
                : "bg-transparent border-white/10 text-[#475569] hover:border-white/20"
            }`}
            style={selectedCategory === cat.value ? { backgroundColor: `${getCategoryColor(cat.value)}15` } : {}}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Expense list */}
      <div className="space-y-2">
        {filtered.map((expense, i) => (
          <motion.div
            key={expense._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-[#0f172a] border border-white/8 hover:border-[#6366f1]/30 transition-all cursor-pointer"
          >
            {/* Category icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border"
              style={{
                backgroundColor: `${getCategoryColor(expense.category)}10`,
                borderColor: `${getCategoryColor(expense.category)}20`,
              }}
            >
              {getCategoryIcon(expense.category)}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-[#f8fafc] truncate">
                  {expense.title}
                </span>
                <Badge variant="default" className="text-[10px] py-0 hidden sm:inline-flex">
                  {SPLIT_TYPE_LABELS[expense.splitType] || "Equal"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Avatar name={expense.paidByName} size="xs" />
                  <span className="text-xs text-[#475569]">
                    Paid by {expense.paidByName}
                  </span>
                </div>
                <span className="text-[#334155] text-xs">·</span>
                <span className="text-xs text-[#475569]">{expense.groupName || "Group"}</span>
                <span className="text-[#334155] text-xs">·</span>
                <span className="text-xs text-[#475569]">
                  {expense.participants?.length || 1} people
                </span>
                <span className="text-[#334155] text-xs">·</span>
                <span className="text-xs text-[#475569]">
                  {formatRelativeTime(expense.createdAt)}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-[#f8fafc]">
                {formatCurrency(expense.amount, expense.currency)}
              </div>
              <div className="text-xs text-[#475569]">
                {formatCurrency(expense.amount / Math.max(1, expense.participants?.length || 1), expense.currency)} each
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-[#64748b]">No expenses found</div>
          </div>
        )}
      </div>
    </div>
  );
}

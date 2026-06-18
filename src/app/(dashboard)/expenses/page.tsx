"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime, getCategoryIcon, getCategoryColor, EXPENSE_CATEGORIES } from "@/lib/utils";

const MOCK_EXPENSES = [
  { _id: "e1", title: "Hotel Booking at Taj", amount: 12000, paidByName: "Alice", paidBy: "u1", category: "accommodation", groupName: "Goa Trip", splitType: "equal", participants: 4, createdAt: "2026-06-10T10:00:00Z" },
  { _id: "e2", title: "Dinner at Thalassa", amount: 4800, paidByName: "Bob", paidBy: "u2", category: "food", groupName: "Goa Trip", splitType: "equal", participants: 4, createdAt: "2026-06-11T20:00:00Z" },
  { _id: "e3", title: "Scuba Diving Session", amount: 6000, paidByName: "Alice", paidBy: "u1", category: "entertainment", groupName: "Goa Trip", splitType: "percentage", participants: 3, createdAt: "2026-06-12T09:00:00Z" },
  { _id: "e4", title: "Airport Cab to T1", amount: 1200, paidByName: "Charlie", paidBy: "u3", category: "transport", groupName: "Goa Trip", splitType: "equal", participants: 4, createdAt: "2026-06-09T06:30:00Z" },
  { _id: "e5", title: "Team Lunch at Social", amount: 2800, paidByName: "You", paidBy: "u0", category: "food", groupName: "Office Lunches", splitType: "equal", participants: 3, createdAt: "2026-06-18T12:00:00Z" },
  { _id: "e6", title: "Electricity Bill June", amount: 2400, paidByName: "Grace", paidBy: "u7", category: "utilities", groupName: "Flat 4B", splitType: "exact", participants: 3, createdAt: "2026-06-15T09:00:00Z" },
  { _id: "e7", title: "Grocery Run", amount: 1600, paidByName: "You", paidBy: "u0", category: "shopping", groupName: "Flat 4B", splitType: "shares", participants: 3, createdAt: "2026-06-14T17:30:00Z" },
];

const SPLIT_TYPE_LABELS: Record<string, string> = {
  equal: "Equal",
  percentage: "%",
  exact: "Exact",
  shares: "Shares",
};

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = MOCK_EXPENSES.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.groupName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || e.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

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
        <Button variant="gradient" size="md" id="add-expense-btn">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
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
                  {SPLIT_TYPE_LABELS[expense.splitType]}
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Avatar name={expense.paidByName} size="xs" />
                  <span className="text-xs text-[#475569]">
                    {expense.paidBy === "u0" ? "You" : expense.paidByName} paid
                  </span>
                </div>
                <span className="text-[#334155] text-xs">·</span>
                <span className="text-xs text-[#475569]">{expense.groupName}</span>
                <span className="text-[#334155] text-xs">·</span>
                <span className="text-xs text-[#475569]">
                  {expense.participants} people
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
                {formatCurrency(expense.amount)}
              </div>
              <div className="text-xs text-[#475569]">
                {formatCurrency(expense.amount / expense.participants)} each
              </div>
            </div>

            {/* Action buttons on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button variant="ghost" size="icon-sm" className="text-[#475569] hover:text-[#f8fafc]">
                ✏️
              </Button>
              <Button variant="ghost" size="icon-sm" className="text-[#475569] hover:text-[#f87171]">
                🗑️
              </Button>
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

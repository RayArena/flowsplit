"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Archive, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AvatarGroup } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const MOCK_GROUPS = [
  {
    _id: "1",
    name: "Goa Trip 2026",
    description: "Annual beach trip",
    members: [
      { userId: "u1", name: "Alice", email: "a@a.com" },
      { userId: "u2", name: "Bob", email: "b@b.com" },
      { userId: "u3", name: "Charlie", email: "c@c.com" },
      { userId: "u4", name: "Diana", email: "d@d.com" },
      { userId: "u5", name: "Evan", email: "e@e.com" },
    ],
    currency: "INR",
    totalExpenses: 42600,
    isArchived: false,
    createdAt: "2026-05-01",
    emoji: "🏖️",
    myBalance: 3200,
  },
  {
    _id: "2",
    name: "Office Lunches",
    description: "Weekly team lunches",
    members: [
      { userId: "u1", name: "Alice", email: "a@a.com" },
      { userId: "u2", name: "Bob", email: "b@b.com" },
      { userId: "u6", name: "Frank", email: "f@f.com" },
    ],
    currency: "INR",
    totalExpenses: 8400,
    isArchived: false,
    createdAt: "2026-04-15",
    emoji: "🍱",
    myBalance: -1800,
  },
  {
    _id: "3",
    name: "Flat 4B",
    description: "Shared apartment expenses",
    members: [
      { userId: "u1", name: "Alice", email: "a@a.com" },
      { userId: "u7", name: "Grace", email: "g@g.com" },
      { userId: "u8", name: "Henry", email: "h@h.com" },
    ],
    currency: "INR",
    totalExpenses: 24800,
    isArchived: false,
    createdAt: "2026-01-01",
    emoji: "🏠",
    myBalance: 0,
  },
  {
    _id: "4",
    name: "Bangalore Weekend",
    description: "",
    members: [
      { userId: "u1", name: "Alice", email: "a@a.com" },
      { userId: "u2", name: "Bob", email: "b@b.com" },
      { userId: "u3", name: "Charlie", email: "c@c.com" },
    ],
    currency: "INR",
    totalExpenses: 15200,
    isArchived: false,
    createdAt: "2026-03-20",
    emoji: "🌆",
    myBalance: 4500,
  },
];

function GroupCard({ group, index }: { group: typeof MOCK_GROUPS[0]; index: number }) {
  const isPositive = group.myBalance > 0;
  const isNegative = group.myBalance < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link href={`/groups/${group._id}`}>
        <Card
          variant="default"
          hover={true}
          padding="lg"
          className="group border border-white/8 hover:border-[#6366f1]/30 transition-all"
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#334155] border border-white/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
              {group.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[#f8fafc] font-semibold text-base truncate group-hover:text-[#818cf8] transition-colors">
                {group.name}
              </h3>
              {group.description && (
                <p className="text-[#475569] text-xs mt-0.5 truncate">
                  {group.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <AvatarGroup users={group.members} max={4} size="xs" />
                <span className="text-xs text-[#475569]">
                  {group.members.length} members
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/6 mb-4" />

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#475569] mb-1">Total Expenses</p>
              <p className="text-sm font-semibold text-[#f8fafc]">
                {formatCurrency(group.totalExpenses, group.currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#475569] mb-1">Your Balance</p>
              <p
                className={`text-sm font-bold ${
                  isPositive ? "text-[#4ade80]" : isNegative ? "text-[#f87171]" : "text-[#64748b]"
                }`}
              >
                {isPositive && "+"}
                {group.myBalance === 0
                  ? "Settled ✓"
                  : formatCurrency(Math.abs(group.myBalance), group.currency)}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_GROUPS.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Groups</h1>
          <p className="text-[#64748b] text-sm mt-1">
            {MOCK_GROUPS.length} active groups
          </p>
        </div>
        <Button variant="gradient" size="md" id="create-group-btn">
          <Plus className="w-4 h-4" />
          New Group
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3"
      >
        <div className="flex-1">
          <Input
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            id="groups-search"
          />
        </div>
        <Button variant="secondary" size="md">
          <Archive className="w-4 h-4" />
          Archived
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Total Groups", value: MOCK_GROUPS.length, icon: Users, color: "text-[#818cf8]" },
          { label: "You're Owed", value: formatCurrency(7700), icon: TrendingUp, color: "text-[#4ade80]" },
          { label: "You Owe", value: formatCurrency(1800), icon: TrendingUp, color: "text-[#f87171]" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#0f172a] border border-white/8 rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <s.icon className={`w-4 h-4 ${s.color}`} />
            <div>
              <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-[#475569]">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((group, i) => (
          <GroupCard key={group._id} group={group} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-[#475569]">
            No groups match &quot;{search}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

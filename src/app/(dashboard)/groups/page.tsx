"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Archive, Users, TrendingUp, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AvatarGroup } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GroupCardSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Member {
  userId: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: Member[];
  currency: string;
  totalExpenses?: number;
  myBalance?: number;
  emoji?: string;
  createdAt: string;
}

const EMOJIS = ["🏖️", "🍱", "🏠", "🌆", "🍔", "🚗", "✈️", "🛍️", "🍕", "🎮"];

function GroupCard({ group, index }: { group: Group; index: number }) {
  // Demo mock balances for display if backend net balance solver isn't run yet
  const myBalance = group.myBalance ?? 0;
  const isPositive = myBalance > 0;
  const isNegative = myBalance < 0;

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
          className="group border border-white/8 hover:border-[#6366f1]/30 transition-all h-full flex flex-col justify-between"
        >
          <div>
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#334155] border border-white/10 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                {group.emoji || "📁"}
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
          </div>

          <div>
            {/* Divider */}
            <div className="h-px bg-white/6 mb-4" />

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#475569] mb-1">Total Expenses</p>
                <p className="text-sm font-semibold text-[#f8fafc]">
                  {formatCurrency(group.totalExpenses || 0, group.currency)}
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
                  {myBalance === 0
                    ? "Settled ✓"
                    : formatCurrency(Math.abs(myBalance), group.currency)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("INR");

  // Fetch groups
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await fetch("/api/groups");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch groups");
      return json.data || [];
    },
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (newGroup: { name: string; description: string; currency: string; emoji: string }) => {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create group");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Group created successfully!");
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      setCurrency("INR");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create group.");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Group name is required");
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    createGroupMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      currency,
      emoji: randomEmoji,
    });
  };

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate totals
  const totalOwed = groups
    .filter((g) => (g.myBalance ?? 0) > 0)
    .reduce((sum, g) => sum + (g.myBalance ?? 0), 0);
  const totalOwe = groups
    .filter((g) => (g.myBalance ?? 0) < 0)
    .reduce((sum, g) => sum + Math.abs(g.myBalance ?? 0), 0);

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
            {isLoading ? "Loading groups..." : `${groups.length} active groups`}
          </p>
        </div>
        <Button variant="gradient" size="md" id="create-group-btn" onClick={() => setIsCreateOpen(true)}>
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
      {!isLoading && groups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: "Total Groups", value: groups.length, icon: Users, color: "text-[#818cf8]" },
            { label: "You're Owed", value: formatCurrency(totalOwed), icon: TrendingUp, color: "text-[#4ade80]" },
            { label: "You Owe", value: formatCurrency(totalOwe), icon: TrendingUp, color: "text-[#f87171]" },
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
      )}

      {/* Groups Grid / Loader */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <GroupCardSkeleton />
          <GroupCardSkeleton />
          <GroupCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((group, i) => (
            <GroupCard key={group._id} group={group} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-[#475569] glass rounded-3xl border border-white/8">
              No groups found. Click &quot;New Group&quot; to create one!
            </div>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]" />
              <button
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#64748b] hover:text-[#f8fafc] hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#f8fafc]">Create a New Group</h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                    Group Name
                  </label>
                  <Input
                    placeholder="e.g. Goa Trip 2026, Flat 4B"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    id="new-group-name"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                    Description (Optional)
                  </label>
                  <Input
                    placeholder="What is this group for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    id="new-group-desc"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#1e293b] border border-white/10 text-[#f8fafc] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="flex-1 shadow-lg shadow-[#6366f1]/20"
                    loading={createGroupMutation.isPending}
                    id="submit-create-group"
                  >
                    Create Group
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

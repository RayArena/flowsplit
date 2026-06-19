"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowLeft,
  Plus,
  Settings,
  UserPlus,
  BarChart3,
  GitBranch,
  ArrowLeftRight,
  Receipt,
  LayoutDashboard,
  X,
  Loader2,
  Upload,
  Copy,
  Link2,
  RefreshCw,
  Check,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime, getCategoryIcon } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGroupChannel } from "@/hooks/useGroupChannel";
import { toast } from "sonner";

const ReactFlowComponent = ReactFlow as any;

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "balances", label: "Balances", icon: ArrowLeftRight },
  { id: "graph", label: "Graph", icon: GitBranch },
  { id: "settlements", label: "Settlements", icon: ArrowLeftRight },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function GroupDetailPage() {
  const { id: groupId } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Subscribe to real-time sync channel
  useGroupChannel({ groupId });

  // 1. Fetch Group Details
  const { data: group, isLoading: isGroupLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load group details");
      return json.data;
    },
  });

  // 2. Fetch Expenses
  const { data: expensesData, isLoading: isExpensesLoading } = useQuery({
    queryKey: ["expenses", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/expenses?groupId=${groupId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load expenses");
      return json.data || [];
    },
  });

  // 3. Fetch Optimized Settlements and Balances
  const { data: settlementsData, isLoading: isSettlementsLoading } = useQuery({
    queryKey: ["settlements", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/settlements?groupId=${groupId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load settlements");
      return json.data;
    },
  });

  // Settle Mutation
  const recordSettlementMutation = useMutation({
    mutationFn: async (settlement: { payer: string; payerName: string; receiver: string; receiverName: string; amount: number }) => {
      const res = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settlement, groupId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to record settlement");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements", groupId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
      toast.success("Settlement recorded successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to record settlement.");
    },
  });

  if (isGroupLoading || isExpensesLoading || isSettlementsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
        <p className="text-[#64748b] text-sm">Loading group data...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12 text-[#f87171] glass rounded-3xl border border-white/8">
        Group not found or you don't have access.
      </div>
    );
  }

  const expenses = expensesData || [];
  const optimizedSettlements = settlementsData?.settlements || [];
  const recordedSettlements = settlementsData?.recordedSettlements || [];
  const balancesObj = settlementsData?.balances || {};
  const totalExpenses = expenses.reduce((s: number, e: any) => s + e.amount, 0);

  // Dynamic layout for React Flow nodes
  const flowNodes = group.members.map((m: any, index: number) => {
    const bal = balancesObj[m.userId]?.net ?? 0;
    const isPos = bal > 0;
    const angle = (index / group.members.length) * 2 * Math.PI;
    const radius = 130;
    const x = 250 + radius * Math.cos(angle);
    const y = 200 + radius * Math.sin(angle);

    return {
      id: m.userId,
      position: { x, y },
      data: { label: `${m.name}\n${bal > 0 ? "+" : ""}${formatCurrency(bal, group.currency)}` },
      style: {
        background: isPos
          ? "linear-gradient(135deg, #22c55e, #14b8a6)"
          : bal < 0
            ? "linear-gradient(135deg, #ef4444, #f97316)"
            : "#1e293b",
        border: "none",
        borderRadius: "12px",
        width: 100,
        height: 50,
        color: "#fff",
        fontWeight: 700,
        fontSize: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center" as const,
        lineHeight: 1.3,
        boxShadow: isPos ? "0 0 20px rgba(34,197,94,0.3)" : bal < 0 ? "0 0 20px rgba(239,68,68,0.2)" : "none",
      },
    };
  });

  const flowEdges = optimizedSettlements.map((s: any, idx: number) => ({
    id: `e-${idx}`,
    source: s.payer,
    target: s.receiver,
    label: formatCurrency(s.amount, group.currency),
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    labelStyle: { fill: "#818cf8", fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 },
  }));

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link href="/groups">
          <Button variant="ghost" size="sm" className="mb-4 text-[#475569]">
            <ArrowLeft className="w-4 h-4" />
            Back to Groups
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#334155] border border-white/10 flex items-center justify-center text-3xl">
              {group.emoji || "🏖️"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f8fafc]">{group.name}</h1>
              <p className="text-[#64748b] text-sm mt-0.5">{group.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <AvatarGroup users={group.members} max={5} size="xs" />
                <span className="text-xs text-[#475569]">{group.members.length} members</span>
                <Badge variant="brand">Active</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
            <Button variant="secondary" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="gradient" size="sm" onClick={() => setIsExpenseModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Expenses", value: formatCurrency(totalExpenses, group.currency), color: "text-[#f8fafc]" },
          { label: "Optimized Settlements", value: `${optimizedSettlements.length} payments`, color: "text-[#818cf8]" },
          { label: "Original Inefficiencies", value: `${settlementsData?.originalCount || 0} direct paths`, color: "text-[#64748b]" },
          { label: "Net Settle Path Savings", value: `${settlementsData?.reduction || 0} saved`, color: "text-[#4ade80]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0f172a] border border-white/8 rounded-2xl p-4">
            <div className="text-xs text-[#475569] mb-1">{s.label}</div>
            <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px ${
              activeTab === tab.id
                ? "border-[#6366f1] text-[#818cf8]"
                : "border-transparent text-[#475569] hover:text-[#94a3b8]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="default" padding="lg">
              <CardHeader className="mb-4">
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {expenses.slice(0, 4).map((e: any) => (
                  <div key={e._id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base">
                      {getCategoryIcon(e.category)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-[#f8fafc]">{e.title}</div>
                      <div className="text-xs text-[#475569]">
                        Paid by {e.paidByName} · {formatRelativeTime(e.createdAt)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#f8fafc]">
                      {formatCurrency(e.amount, group.currency)}
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <p className="text-xs text-[#475569] text-center py-4">No expenses created yet.</p>
                )}
              </CardContent>
            </Card>

            <Card variant="brand" padding="lg">
              <CardHeader className="mb-4">
                <CardTitle>Settlement Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center mb-4">
                  <div className="text-3xl font-black gradient-text-brand">{optimizedSettlements.length}</div>
                  <div className="text-xs text-[#64748b]">payments needed to settle</div>
                </div>
                {optimizedSettlements.slice(0, 3).map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-xl bg-white/3">
                    <Avatar name={s.payerName} size="xs" />
                    <span className="text-[#475569]">→</span>
                    <Avatar name={s.receiverName} size="xs" />
                    <span className="flex-1 text-[#64748b] text-xs truncate">{s.payerName} → {s.receiverName}</span>
                    <span className="text-[#818cf8] font-semibold text-xs">{formatCurrency(s.amount, group.currency)}</span>
                  </div>
                ))}
                {optimizedSettlements.length === 0 && (
                  <p className="text-xs text-[#475569] text-center py-4">All settled! No payments pending.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* EXPENSES */}
        {activeTab === "expenses" && (
          <Card variant="default" padding="lg">
            <CardHeader className="mb-4">
              <div className="flex items-center justify-between">
                <CardTitle>All Expenses ({expenses.length})</CardTitle>
                <Button variant="gradient" size="sm" onClick={() => setIsExpenseModalOpen(true)}>
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {expenses.map((e: any) => (
                <div
                  key={e._id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/3 border border-transparent hover:border-white/8 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                    {getCategoryIcon(e.category)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#f8fafc]">{e.title}</div>
                    <div className="text-xs text-[#475569] mt-0.5">
                      Paid by {e.paidByName} · {e.participants.length} participants · {formatRelativeTime(e.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#f8fafc]">{formatCurrency(e.amount, group.currency)}</div>
                    <div className="text-xs text-[#475569]">
                      {formatCurrency(e.amount / e.participants.length, group.currency)} each
                    </div>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center py-10 text-[#475569] text-xs">
                  This group has no expenses. Click "Add" to upload a receipt!
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* BALANCES */}
        {activeTab === "balances" && (
          <Card variant="default" padding="lg">
            <CardHeader className="mb-4">
              <CardTitle>Balance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {group.members.map((m: any) => {
                  const balance = balancesObj[m.userId]?.net ?? 0;
                  const paid = balancesObj[m.userId]?.paid ?? 0;
                  const owed = balancesObj[m.userId]?.owed ?? 0;
                  const isPos = balance > 0;
                  const isNeg = balance < 0;
                  return (
                    <div key={m.userId} className="flex items-center gap-4 p-4 rounded-xl bg-white/3">
                      <Avatar name={m.name} size="md" />
                      <div className="flex-1">
                        <div className="font-medium text-[#f8fafc] text-sm mb-1">{m.name}</div>
                        <div className="flex gap-4 text-xs text-[#64748b]">
                          <span>Paid: {formatCurrency(paid, group.currency)}</span>
                          <span>Owed: {formatCurrency(owed, group.currency)}</span>
                        </div>
                        {/* Balance bar */}
                        <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPos ? "bg-[#22c55e]" : "bg-[#ef4444]"}`}
                            style={{ width: `${Math.min(100, (Math.abs(balance) / Math.max(1, totalExpenses)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${isPos ? "text-[#4ade80]" : isNeg ? "text-[#f87171]" : "text-[#64748b]"}`}>
                        {isPos ? "+" : ""}{formatCurrency(balance, group.currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* GRAPH */}
        {activeTab === "graph" && mounted && (
          <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: 500 }}>
            {flowNodes.length > 0 ? (
              <ReactFlowComponent
                nodes={flowNodes}
                edges={flowEdges}
                fitView
                style={{ background: "#0a0f1e" }}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#1e293b" gap={24} />
                <Controls style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <MiniMap
                  style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }}
                  maskColor="rgba(0,0,0,0.5)"
                />
              </ReactFlowComponent>
            ) : (
              <div className="h-full flex items-center justify-center text-[#475569] text-xs">
                No members found to render the graph.
              </div>
            )}
          </div>
        )}

        {/* SETTLEMENTS */}
        {activeTab === "settlements" && (
          <div className="space-y-4">
            <Card variant="default" padding="lg">
              <CardHeader className="mb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Optimized Settlements</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">{optimizedSettlements.length} transactions</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {optimizedSettlements.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8">
                    <Avatar name={s.payerName} size="sm" />
                    <div className="flex-1">
                      <div className="text-sm text-[#f8fafc] font-medium">
                        {s.payerName} <span className="text-[#475569]">→</span> {s.receiverName}
                      </div>
                      <div className="text-xs text-[#475569] mt-0.5">Settle balance debt</div>
                    </div>
                    <Avatar name={s.receiverName} size="sm" />
                    <div className="text-sm font-bold text-[#818cf8] mr-2">{formatCurrency(s.amount, group.currency)}</div>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        recordSettlementMutation.mutate({
                          payer: s.payer,
                          payerName: s.payerName,
                          receiver: s.receiver,
                          receiverName: s.receiverName,
                          amount: s.amount,
                        })
                      }
                      loading={recordSettlementMutation.isPending}
                    >
                      Mark Paid
                    </Button>
                  </div>
                ))}
                {optimizedSettlements.length === 0 && (
                  <p className="text-xs text-[#475569] text-center py-4">All debts are cleared! Well done.</p>
                )}
              </CardContent>
            </Card>

            {/* Settle History */}
            {recordedSettlements.length > 0 && (
              <Card variant="default" padding="lg">
                <CardHeader className="mb-4">
                  <CardTitle>Settle History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recordedSettlements.map((r: any) => (
                    <div key={r._id} className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0">
                      <span className="text-[#94a3b8]">
                        {r.payerName} paid {r.receiverName}
                      </span>
                      <span className="text-[#4ade80] font-semibold">
                        {formatCurrency(r.amount, r.currency)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <Card variant="default" padding="lg">
            <CardHeader className="mb-4">
              <CardTitle>Group Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/3 text-center">
                  <div className="text-3xl font-black gradient-text-brand mb-1">
                    {formatCurrency(totalExpenses, group.currency)}
                  </div>
                  <div className="text-xs text-[#64748b]">Total Group Spend</div>
                </div>
                <div className="p-4 rounded-xl bg-white/3 text-center">
                  <div className="text-3xl font-black text-[#4ade80] mb-1">{expenses.length}</div>
                  <div className="text-xs text-[#64748b]">Total Expenses</div>
                </div>
                <div className="p-4 rounded-xl bg-white/3 text-center">
                  <div className="text-3xl font-black text-[#818cf8] mb-1">
                    {formatCurrency(totalExpenses / Math.max(1, group.members.length), group.currency)}
                  </div>
                  <div className="text-xs text-[#64748b]">Average Cost Per Person</div>
                </div>
                <div className="p-4 rounded-xl bg-white/3 text-center">
                  <div className="text-3xl font-black text-[#fbbf24] mb-1">🍕</div>
                  <div className="text-xs text-[#64748b]">Quick settlements active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={groupId}
        groupName={group.name}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        group={group}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
          queryClient.invalidateQueries({ queryKey: ["settlements", groupId] });
          setIsExpenseModalOpen(false);
        }}
      />
    </div>
  );
}

// Sub-Component: AddExpenseModal
function AddExpenseModal({
  isOpen,
  onClose,
  group,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  group: any;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [paidBy, setPaidBy] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  // Set default paidBy on open
  if (group.members?.[0] && !paidBy) {
    setPaidBy(group.members[0].userId);
  }

  // Split calculations (Simplified to equal splits)
  const handleScanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch("/api/receipts/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to scan receipt");

        const parsed = json.data?.extractedData || {};
        if (parsed.vendor) setTitle(parsed.vendor);
        if (parsed.amount) setAmount(String(parsed.amount));
        if (json.data?._id) setReceiptId(json.data._id);

        toast.success("Receipt parsed successfully! Autofilled vendor & amount.");
      } catch (err: any) {
        toast.error(err.message || "Scanning failed, please fill manually.");
      } finally {
        setIsScanning(false);
      }
    };
  };

  const createExpenseMutation = useMutation({
    mutationFn: async (expense: any) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create expense");
      return json.data;
    },
    onSuccess: () => {
      onSuccess();
      setTitle("");
      setAmount("");
      setCategory("other");
      setReceiptId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add expense.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return toast.error("Please fill in title and amount");

    const parsedAmount = Number(amount);
    const selectedPayer = group.members.find((m: any) => m.userId === paidBy);
    if (!selectedPayer) return toast.error("Select a payer");

    // Equal split math: everyone in the group splits equally
    const shareAmount = parsedAmount / group.members.length;
    const participants = group.members.map((m: any) => ({
      userId: m.userId,
      name: m.name,
      share: shareAmount,
    }));

    createExpenseMutation.mutate({
      groupId: group._id,
      title: title.trim(),
      amount: parsedAmount,
      currency: group.currency,
      paidBy,
      paidByName: selectedPayer.name,
      participants,
      splitType: "equal",
      category,
      receiptId: receiptId || undefined,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#64748b] hover:text-[#f8fafc] hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#f8fafc]">Add Group Expense</h2>
            </div>

            {/* OCR Scanner */}
            <div className="mb-4 bg-white/3 border border-dashed border-white/10 rounded-2xl p-4 text-center relative hover:border-[#6366f1]/40 transition-colors">
              {isScanning ? (
                <div className="flex flex-col items-center justify-center py-2 gap-2">
                  <Loader2 className="w-6 h-6 text-[#818cf8] animate-spin" />
                  <span className="text-xs text-[#94a3b8] font-medium animate-pulse">Running AI OCR Receipt Scan...</span>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center py-2 gap-1.5">
                  <Upload className="w-5 h-5 text-[#818cf8]" />
                  <span className="text-xs text-[#94a3b8] font-medium">Scan Receipt to Autofill</span>
                  <span className="text-[10px] text-[#475569]">Supports PNG, JPG, WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScanUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                    Expense Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dinner, Cab"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full h-10 rounded-xl bg-[#1e293b] border border-white/10 text-[#f8fafc] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                    Amount ({group.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full h-10 rounded-xl bg-[#1e293b] border border-white/10 text-[#f8fafc] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                    Paid By
                  </label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#1e293b] border border-white/10 text-[#f8fafc] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
                  >
                    {group.members.map((m: any) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#1e293b] border border-white/10 text-[#f8fafc] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
                  >
                    <option value="food">🍕 Food & Drinks</option>
                    <option value="transport">🚕 Transport</option>
                    <option value="accommodation">🏠 Accommodation</option>
                    <option value="entertainment">🎬 Entertainment</option>
                    <option value="utilities">⚡ Utilities</option>
                    <option value="other">📁 Other</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-white/3 border border-white/8 rounded-2xl text-xs space-y-1">
                <span className="text-[#64748b] block font-semibold mb-1 uppercase tracking-wider">Split Details</span>
                <p className="text-[#94a3b8]">
                  Splitting **Equally** among all {group.members.length} members.
                </p>
                {amount && (
                  <p className="text-[#818cf8] font-bold">
                    Each person owes: {formatCurrency(Number(amount) / group.members.length, group.currency)}
                  </p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1 shadow-lg shadow-[#6366f1]/20"
                  loading={createExpenseMutation.isPending}
                >
                  Add Expense
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Sub-Component: InviteModal
function InviteModal({
  isOpen,
  onClose,
  groupId,
  groupName,
}: {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}) {
  const [copied, setCopied] = useState(false);

  const { data: inviteData, isLoading, refetch } = useQuery({
    queryKey: ["invite", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/invite`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to get invite link");
      return json.data;
    },
    enabled: isOpen,
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/invite`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to regenerate invite link");
      return json.data;
    },
    onSuccess: () => {
      refetch();
      toast.success("Invite link regenerated!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to regenerate invite link.");
    },
  });

  const handleCopy = async () => {
    if (!inviteData?.inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteData.inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#64748b] hover:text-[#f8fafc] hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                <Link2 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[#f8fafc]">Invite to {groupName}</h2>
            </div>

            <p className="text-[#64748b] text-sm mb-5">
              Share this link with anyone you want to invite. They&apos;ll be able to join the group after signing in.
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 text-[#6366f1] animate-spin" />
              </div>
            ) : inviteData?.inviteUrl ? (
              <div className="space-y-4">
                {/* Invite link display */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#94a3b8] font-mono truncate">
                    {inviteData.inviteUrl}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] flex items-center justify-center transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>

                {/* Regenerate */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#475569]">
                    Code: <code className="text-[#818cf8]">{inviteData.inviteCode}</code>
                  </span>
                  <button
                    onClick={() => regenerateMutation.mutate()}
                    disabled={regenerateMutation.isPending}
                    className="flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#94a3b8] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${regenerateMutation.isPending ? "animate-spin" : ""}`} />
                    Regenerate link
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-[#64748b] text-sm">
                Failed to generate invite link. Please try again.
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

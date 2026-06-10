"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  GitMerge,
  TrendingDown,
  Calculator,
  Loader2,
} from "lucide-react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Group } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactFlowComponent = ReactFlow as any;
import "@xyflow/react/dist/style.css";

export default function SettlementsPage() {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [simulateFrom, setSimulateFrom] = useState("");
  const [simulateTo, setSimulateTo] = useState("");
  const [simulateAmount, setSimulateAmount] = useState("2000");
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch User's Groups
  const { data: groups = [], isLoading: isGroupsLoading } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await fetch("/api/groups");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch groups");
      return json.data || [];
    },
  });

  const activeGroupId = selectedGroupId || groups[0]?._id || "";
  const activeGroup = groups.find((g) => g._id === activeGroupId);
  const currency = activeGroup?.currency || "INR";
  const members = activeGroup?.members || [];

  // 2. Fetch Balances & Optimized Settlements
  const { data: settlementsData, isLoading: isSettlementsLoading } = useQuery({
    queryKey: ["settlements", activeGroupId],
    queryFn: async () => {
      if (!activeGroupId) return null;
      const res = await fetch(`/api/settlements?groupId=${activeGroupId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load settlements");
      return json.data;
    },
    enabled: !!activeGroupId,
  });

  const optimizedSettlements = settlementsData?.settlements || [];
  const balancesObj = settlementsData?.balances || {};
  const originalCount = settlementsData?.originalCount || 0;
  const optimizedCount = settlementsData?.optimizedCount || 0;
  const reduction = settlementsData?.reduction || 0;
  const reductionPercentage = settlementsData?.reductionPercentage || 0;

  // Derive group balances list
  const groupBalances = members.map((m) => {
    const balInfo = balancesObj[m.userId] || { net: 0, paid: 0, owed: 0 };
    return {
      userId: m.userId,
      name: m.name,
      avatar: m.avatar,
      netBalance: balInfo.net,
      totalPaid: balInfo.paid,
      totalOwed: balInfo.owed,
    };
  });

  const debtors = groupBalances.filter((b) => b.netBalance < 0);
  const creditors = groupBalances.filter((b) => b.netBalance > 0);

  // Set default values for simulator payer/receiver when group changes or loads
  useEffect(() => {
    if (debtors.length > 0) {
      setSimulateFrom(debtors[0].userId);
    } else {
      setSimulateFrom("");
    }
    if (creditors.length > 0) {
      setSimulateTo(creditors[0].userId);
    } else {
      setSimulateTo("");
    }
    setSimulationResult(null);
  }, [activeGroupId, settlementsData]);

  // Settle Debt Mutation
  const recordSettlementMutation = useMutation({
    mutationFn: async (settlement: { payer: string; payerName: string; receiver: string; receiverName: string; amount: number }) => {
      const res = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settlement, groupId: activeGroupId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to record settlement");
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements", activeGroupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Settlement recorded successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to record settlement.");
    },
  });

  // Simulator Mutation
  const simulateMutation = useMutation({
    mutationFn: async (payload: { groupId: string; payerId: string; receiverId: string; amount: number }) => {
      const res = await fetch("/api/settlements/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Simulation failed");
      return json.data;
    },
    onSuccess: (data) => {
      setSimulationResult(data);
      toast.success("Simulation computed successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to run simulation.");
    },
  });

  const handleSimulate = () => {
    if (!activeGroupId) return toast.error("Select a group first");
    if (!simulateFrom || !simulateTo) return toast.error("Payer and receiver are required");
    const parsedAmount = Number(simulateAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return toast.error("Enter a valid amount");

    simulateMutation.mutate({
      groupId: activeGroupId,
      payerId: simulateFrom,
      receiverId: simulateTo,
      amount: parsedAmount,
    });
  };

  // Derive simulated values for display
  const projectedCount = simulationResult
    ? simulationResult.projected.count
    : optimizedSettlements.length;

  const projectedTotalAmount = simulationResult
    ? simulationResult.projected.settlements.reduce((sum: number, s: any) => sum + s.amount, 0)
    : optimizedSettlements.reduce((sum: number, s: any) => sum + s.amount, 0);

  const rawPayerBalance = groupBalances.find((b) => b.userId === simulateFrom)?.netBalance ?? 0;
  const simAmount = Number(simulateAmount) || 0;
  const projectedPayerBalance = simulationResult
    ? simulationResult.projected.balances.find((b: any) => b.userId === simulateFrom)?.netBalance ?? 0
    : rawPayerBalance + simAmount;

  // React Flow circular layout
  const flowNodes = members.map((m, index) => {
    const bal = balancesObj[m.userId]?.net ?? 0;
    const isPos = bal > 0;
    const angle = (index / Math.max(1, members.length)) * 2 * Math.PI;
    const radius = 90;
    const x = 150 + radius * Math.cos(angle);
    const y = 130 + radius * Math.sin(angle);

    return {
      id: m.userId,
      position: { x, y },
      data: { label: `${m.name}\n${bal > 0 ? "+" : ""}${formatCurrency(bal, currency)}` },
      style: {
        background: isPos
          ? "linear-gradient(135deg, #22c55e, #14b8a6)"
          : bal < 0
            ? "linear-gradient(135deg, #ef4444, #f97316)"
            : "#1e293b",
        border: "none",
        borderRadius: "12px",
        width: 90,
        height: 50,
        color: "#fff",
        fontWeight: 700,
        fontSize: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center" as const,
        lineHeight: 1.3,
        boxShadow: isPos ? "0 0 15px rgba(34,197,94,0.2)" : bal < 0 ? "0 0 15px rgba(239,68,68,0.15)" : "none",
      },
    };
  });

  const flowEdges = optimizedSettlements.map((s: any, idx: number) => ({
    id: `e-${idx}`,
    source: s.payer,
    target: s.receiver,
    label: formatCurrency(s.amount, currency),
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    labelStyle: { fill: "#818cf8", fontSize: 9, fontWeight: 600 },
    labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 },
  }));

  if (isGroupsLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
        <p className="text-[#64748b] text-sm">Loading settlements dashboard...</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 glass border border-white/8 rounded-3xl">
        <GitMerge className="w-12 h-12 text-[#64748b] mb-4" />
        <h2 className="text-[#f8fafc] text-lg font-bold">No Active Groups Found</h2>
        <p className="text-[#64748b] text-sm mt-1 max-w-sm">
          Please create a group and log some expenses to optimize settlements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#f8fafc]">Settlement Optimizer</h1>
        <p className="text-[#64748b] text-sm mt-1">
          Minimize transactions with our graph-based algorithm.
        </p>
      </motion.div>

      {/* Group selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {groups.map((g) => (
          <button
            key={g._id}
            onClick={() => {
              setSelectedGroupId(g._id);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap ${
              activeGroupId === g._id
                ? "bg-[#6366f1]/15 border-[#6366f1]/30 text-[#818cf8]"
                : "bg-[#0f172a] border-white/8 text-[#475569] hover:text-[#94a3b8]"
            }`}
          >
            {g.emoji || "🏖️"} {g.name}
          </button>
        ))}
      </div>

      {isSettlementsLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-[#6366f1] animate-spin" />
          <p className="text-[#64748b] text-xs">Computing group optimization graph...</p>
        </div>
      ) : (
        <>
          {/* Optimization stats banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-[#6366f1]/10 via-[#8b5cf6]/10 to-[#ec4899]/5 border border-[#6366f1]/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#6366f1]/20 flex items-center justify-center">
                <GitMerge className="w-5 h-5 text-[#818cf8]" />
              </div>
              <div>
                <h2 className="text-[#f8fafc] font-semibold">Optimization Result</h2>
                <p className="text-[#64748b] text-xs">Graph-based net balance algorithm</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Original Transactions", value: String(originalCount), icon: TrendingDown, color: "text-[#f87171]" },
                { label: "After Optimization", value: String(optimizedCount), icon: CheckCircle2, color: "text-[#4ade80]" },
                { label: "Transactions Saved", value: String(reduction), icon: Zap, color: "text-[#818cf8]" },
                { label: "Reduction", value: `${reductionPercentage}%`, icon: Calculator, color: "text-[#fbbf24]" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-2xl font-black ${s.color} mb-1`}>{s.value}</div>
                  <div className="text-xs text-[#475569]">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Settlements list */}
            <div className="lg:col-span-3 space-y-4">
              <Card variant="default" padding="lg">
                <CardHeader className="mb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Optimized Settlements</CardTitle>
                    <Badge variant="success">{optimizedSettlements.length} payments</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {optimizedSettlements.map((s: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 group hover:border-[#6366f1]/30 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar name={s.payerName} size="sm" />
                        <div>
                          <div className="text-sm font-medium text-[#f8fafc]">{s.payerName}</div>
                          <div className="text-xs text-[#475569]">Payer</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <ArrowRight className="w-4 h-4 text-[#6366f1]" />
                        <span className="text-xs font-bold text-[#818cf8]">
                          {formatCurrency(s.amount, currency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="text-right">
                          <div className="text-sm font-medium text-[#f8fafc]">{s.receiverName}</div>
                          <div className="text-xs text-[#475569]">Receiver</div>
                        </div>
                        <Avatar name={s.receiverName} size="sm" />
                      </div>
                      <Button
                        variant="success"
                        size="sm"
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        loading={recordSettlementMutation.isPending}
                        onClick={() =>
                          recordSettlementMutation.mutate({
                            payer: s.payer,
                            payerName: s.payerName,
                            receiver: s.receiver,
                            receiverName: s.receiverName,
                            amount: s.amount,
                          })
                        }
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Paid
                      </Button>
                    </motion.div>
                  ))}
                  {optimizedSettlements.length === 0 && (
                    <div className="text-center py-6 text-xs text-[#475569]">
                      Everything is settled! No transactions pending.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Balance breakdown */}
              <Card variant="default" padding="lg">
                <CardHeader className="mb-4">
                  <CardTitle>Net Balances</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {groupBalances.map((b) => (
                    <div key={b.userId} className="flex items-center gap-3">
                      <Avatar name={b.name} size="sm" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[#f8fafc]">{b.name}</span>
                          <span className={`text-sm font-bold ${b.netBalance > 0 ? "text-[#4ade80]" : b.netBalance < 0 ? "text-[#f87171]" : "text-[#64748b]"}`}>
                            {b.netBalance > 0 ? "+" : ""}{formatCurrency(b.netBalance, currency)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${b.netBalance > 0 ? "bg-[#22c55e]" : "bg-[#ef4444]"}`}
                            style={{ width: `${Math.min(100, (Math.abs(b.netBalance) / Math.max(1, activeGroup?.totalExpenses || 10000)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right panel: Graph + Simulator */}
            <div className="lg:col-span-2 space-y-4">
              {/* Graph */}
              <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: 320 }}>
                {mounted && members.length > 0 ? (
                  <ReactFlowComponent
                    nodes={flowNodes}
                    edges={flowEdges}
                    fitView
                    style={{ background: "#0a0f1e" }}
                    proOptions={{ hideAttribution: true }}
                  >
                    <Background color="#1e293b" gap={24} />
                    <Controls style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  </ReactFlowComponent>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[#475569] bg-[#0a0f1e]">
                    {members.length > 0 ? "Loading settlements graph..." : "No members to build node network."}
                  </div>
                )}
              </div>

              {/* Smart Simulator */}
              <Card variant="brand" padding="lg">
                <CardHeader className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#6366f1]/20 flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-[#818cf8]" />
                    </div>
                    <div>
                      <CardTitle>Smart Simulator</CardTitle>
                      <p className="text-[#64748b] text-xs mt-0.5">
                        What if I settle {currency === "INR" ? "₹" : "$"}X today?
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#64748b] mb-1 block">From</label>
                      <select
                        value={simulateFrom}
                        onChange={(e) => setSimulateFrom(e.target.value)}
                        className="w-full h-9 rounded-xl bg-[#1e293b] border border-white/10 text-[#f8fafc] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
                      >
                        {debtors.length === 0 ? (
                          <option value="">No debtors</option>
                        ) : (
                          debtors.map((b) => (
                            <option key={b.userId} value={b.userId}>{b.name}</option>
                          ))
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#64748b] mb-1 block">To</label>
                      <select
                        value={simulateTo}
                        onChange={(e) => setSimulateTo(e.target.value)}
                        className="w-full h-9 rounded-xl bg-[#1e293b] border border-white/10 text-[#f8fafc] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
                      >
                        {creditors.length === 0 ? (
                          <option value="">No creditors</option>
                        ) : (
                          creditors.map((b) => (
                            <option key={b.userId} value={b.userId}>{b.name}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <Input
                    label={`Amount (${currency})`}
                    type="number"
                    value={simulateAmount}
                    onChange={(e) => setSimulateAmount(e.target.value)}
                    placeholder="e.g. 2000"
                    id="simulate-amount"
                  />

                  <Button
                    variant="gradient"
                    size="sm"
                    className="w-full"
                    onClick={handleSimulate}
                    loading={simulateMutation.isPending}
                    id="simulate-btn"
                  >
                    <Zap className="w-4 h-4" />
                    Simulate Settlement
                  </Button>

                  {/* Result preview */}
                  <div className="p-3 rounded-xl bg-white/3 border border-white/8">
                    <div className="text-xs text-[#64748b] mb-2 font-medium">After this payment:</div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#94a3b8]">Remaining settlements</span>
                        <span className="text-[#f8fafc] font-semibold">{projectedCount}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#94a3b8]">Total remaining</span>
                        <span className="text-[#f8fafc] font-semibold">
                          {formatCurrency(projectedTotalAmount, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#94a3b8]">Payer balance after</span>
                        <span className={`${projectedPayerBalance > 0 ? "text-[#4ade80]" : projectedPayerBalance < 0 ? "text-[#f87171]" : "text-[#94a3b8]"} font-semibold`}>
                          {projectedPayerBalance > 0 ? "+" : ""}{formatCurrency(projectedPayerBalance, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

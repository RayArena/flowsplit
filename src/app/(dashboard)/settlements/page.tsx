"use client";

import { motion } from "framer-motion";
import { useState } from "react";
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
} from "lucide-react";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from "@xyflow/react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactFlowComponent = ReactFlow as any;
import "@xyflow/react/dist/style.css";

const GROUPS = [
  { id: "1", name: "Goa Trip 2026" },
  { id: "2", name: "Office Lunches" },
  { id: "3", name: "Flat 4B" },
];

const BASE_BALANCES = [
  { userId: "u1", name: "Alice", netBalance: 7250 },
  { userId: "u2", name: "Bob", netBalance: -4250 },
  { userId: "u3", name: "Charlie", netBalance: -6100 },
  { userId: "u4", name: "Diana", netBalance: 3100 },
];

const BASE_SETTLEMENTS = [
  { from: "Bob", fromId: "u2", to: "Alice", toId: "u1", amount: 4250 },
  { from: "Charlie", fromId: "u3", to: "Alice", toId: "u1", amount: 4100 },
  { from: "Charlie", fromId: "u3", to: "Diana", toId: "u4", amount: 2000 },
];

const BASE_NODES = [
  { id: "u1", position: { x: 200, y: 60 }, data: { label: "Alice\n+₹7,250" }, style: { background: "linear-gradient(135deg,#22c55e,#14b8a6)", border: "none", borderRadius: "12px", width: 80, height: 50, color: "#fff", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" as const, lineHeight: 1.3 } },
  { id: "u2", position: { x: 50, y: 240 }, data: { label: "Bob\n-₹4,250" }, style: { background: "linear-gradient(135deg,#ef4444,#f97316)", border: "none", borderRadius: "12px", width: 80, height: 50, color: "#fff", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" as const } },
  { id: "u3", position: { x: 360, y: 240 }, data: { label: "Charlie\n-₹6,100" }, style: { background: "linear-gradient(135deg,#ef4444,#f97316)", border: "none", borderRadius: "12px", width: 80, height: 50, color: "#fff", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" as const } },
  { id: "u4", position: { x: 200, y: 400 }, data: { label: "Diana\n+₹3,100" }, style: { background: "linear-gradient(135deg,#22c55e,#14b8a6)", border: "none", borderRadius: "12px", width: 80, height: 50, color: "#fff", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" as const } },
];

const BASE_EDGES = [
  { id: "e1", source: "u2", target: "u1", label: "₹4,250", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 }, labelStyle: { fill: "#818cf8", fontSize: 11 }, labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 } },
  { id: "e2", source: "u3", target: "u1", label: "₹4,100", animated: true, style: { stroke: "#8b5cf6", strokeWidth: 2 }, labelStyle: { fill: "#a78bfa", fontSize: 11 }, labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 } },
  { id: "e3", source: "u3", target: "u4", label: "₹2,000", animated: true, style: { stroke: "#ec4899", strokeWidth: 2 }, labelStyle: { fill: "#f9a8d4", fontSize: 11 }, labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 } },
];

export default function SettlementsPage() {
  const [selectedGroup, setSelectedGroup] = useState("1");
  const [simulateFrom, setSimulateFrom] = useState("u2");
  const [simulateTo, setSimulateTo] = useState("u1");
  const [simulateAmount, setSimulateAmount] = useState("2000");
  const [isSimulating, setIsSimulating] = useState(false);

  const [nodes, , onNodesChange] = useNodesState(BASE_NODES);
  const [edges, , onEdgesChange] = useEdgesState(BASE_EDGES);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 500);
  };

  const simAmount = Number(simulateAmount) || 0;
  const projectedSettlements = BASE_SETTLEMENTS.filter(
    (s) => !(s.fromId === simulateFrom && s.toId === simulateTo && simAmount >= s.amount)
  );

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
      <div className="flex gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              selectedGroup === g.id
                ? "bg-[#6366f1]/15 border-[#6366f1]/30 text-[#818cf8]"
                : "bg-[#0f172a] border-white/8 text-[#475569] hover:text-[#94a3b8]"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

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
            { label: "Original Transactions", value: "8", icon: TrendingDown, color: "text-[#f87171]" },
            { label: "After Optimization", value: "3", icon: CheckCircle2, color: "text-[#4ade80]" },
            { label: "Transactions Saved", value: "5", icon: Zap, color: "text-[#818cf8]" },
            { label: "Reduction", value: "62.5%", icon: Calculator, color: "text-[#fbbf24]" },
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
                <Badge variant="success">3 payments</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {BASE_SETTLEMENTS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 group hover:border-[#6366f1]/30 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar name={s.from} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-[#f8fafc]">{s.from}</div>
                      <div className="text-xs text-[#475569]">Payer</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ArrowRight className="w-4 h-4 text-[#6366f1]" />
                    <span className="text-xs font-bold text-[#818cf8]">
                      {formatCurrency(s.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#f8fafc]">{s.to}</div>
                      <div className="text-xs text-[#475569]">Receiver</div>
                    </div>
                    <Avatar name={s.to} size="sm" />
                  </div>
                  <Button variant="success" size="sm" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paid
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Balance breakdown */}
          <Card variant="default" padding="lg">
            <CardHeader className="mb-4">
              <CardTitle>Net Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {BASE_BALANCES.map((b) => (
                <div key={b.userId} className="flex items-center gap-3">
                  <Avatar name={b.name} size="sm" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-[#f8fafc]">{b.name}</span>
                      <span className={`text-sm font-bold ${b.netBalance > 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                        {b.netBalance > 0 ? "+" : ""}{formatCurrency(b.netBalance)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${b.netBalance > 0 ? "bg-[#22c55e]" : "bg-[#ef4444]"}`}
                        style={{ width: `${Math.min(100, (Math.abs(b.netBalance) / 8000) * 100)}%` }}
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
            <ReactFlowComponent
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              style={{ background: "#0a0f1e" }}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#1e293b" gap={24} />
              <Controls style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            </ReactFlowComponent>
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
                    What if I settle ₹X today?
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
                    {BASE_BALANCES.filter(b => b.netBalance < 0).map(b => (
                      <option key={b.userId} value={b.userId}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#64748b] mb-1 block">To</label>
                  <select
                    value={simulateTo}
                    onChange={(e) => setSimulateTo(e.target.value)}
                    className="w-full h-9 rounded-xl bg-[#1e293b] border border-white/10 text-[#f8fafc] text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#6366f1]/40"
                  >
                    {BASE_BALANCES.filter(b => b.netBalance > 0).map(b => (
                      <option key={b.userId} value={b.userId}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Amount (₹)"
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
                loading={isSimulating}
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
                    <span className="text-[#f8fafc] font-semibold">{projectedSettlements.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94a3b8]">Total remaining</span>
                    <span className="text-[#f8fafc] font-semibold">
                      {formatCurrency(projectedSettlements.reduce((s, p) => s + p.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94a3b8]">Your balance after</span>
                    <span className="text-[#4ade80] font-semibold">
                      {formatCurrency(Math.abs((BASE_BALANCES.find(b => b.userId === simulateFrom)?.netBalance ?? 0) + simAmount))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

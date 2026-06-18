"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

const ReactFlowComponent = ReactFlow as any;
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime, getCategoryIcon } from "@/lib/utils";

// Mock data
const GROUP = {
  _id: "1",
  name: "Goa Trip 2026",
  description: "Annual beach trip with the squad",
  emoji: "🏖️",
  currency: "INR",
  members: [
    { userId: "u1", name: "Alice", email: "a@ex.com", avatar: null, role: "admin" as const, joinedAt: "" },
    { userId: "u2", name: "Bob", email: "b@ex.com", avatar: null, role: "member" as const, joinedAt: "" },
    { userId: "u3", name: "Charlie", email: "c@ex.com", avatar: null, role: "member" as const, joinedAt: "" },
    { userId: "u4", name: "Diana", email: "d@ex.com", avatar: null, role: "member" as const, joinedAt: "" },
  ],
};

const EXPENSES = [
  { _id: "e1", title: "Hotel Booking", amount: 12000, paidByName: "Alice", category: "accommodation", createdAt: "2026-06-10T10:00:00Z", participants: 4 },
  { _id: "e2", title: "Dinner at Thalassa", amount: 4800, paidByName: "Bob", category: "food", createdAt: "2026-06-11T20:00:00Z", participants: 4 },
  { _id: "e3", title: "Scuba Diving", amount: 6000, paidByName: "Alice", category: "entertainment", createdAt: "2026-06-12T09:00:00Z", participants: 3 },
  { _id: "e4", title: "Airport Cab", amount: 1200, paidByName: "Charlie", category: "transport", createdAt: "2026-06-09T06:30:00Z", participants: 4 },
  { _id: "e5", title: "Breakfast", amount: 1400, paidByName: "Diana", category: "food", createdAt: "2026-06-12T08:00:00Z", participants: 4 },
];

const BALANCES = [
  { userId: "u1", name: "Alice", totalPaid: 18000, totalOwed: 10750, netBalance: 7250 },
  { userId: "u2", name: "Bob", totalPaid: 4800, totalOwed: 9050, netBalance: -4250 },
  { userId: "u3", name: "Charlie", totalPaid: 1200, totalOwed: 7300, netBalance: -6100 },
  { userId: "u4", name: "Diana", totalPaid: 1400, totalOwed: 10300, netBalance: -8900 }, // wait, just demo data
];

const OPTIMIZED = [
  { from: "u3", fromName: "Charlie", to: "u1", toName: "Alice", amount: 6100 },
  { from: "u4", fromName: "Diana", to: "u1", toName: "Alice", amount: 1150 },
  { from: "u2", fromName: "Bob", to: "u1", toName: "Alice", amount: 4250 },
  { from: "u4", fromName: "Diana", to: "u1", toName: "Alice", amount: 2300 },  // demo
];

// React Flow nodes/edges for debt graph
const FLOW_NODES = [
  {
    id: "u1",
    position: { x: 200, y: 50 },
    data: { label: "Alice" },
    style: { background: "linear-gradient(135deg,#22c55e,#14b8a6)", border: "none", borderRadius: "50%", width: 60, height: 60, color: "#fff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(34,197,94,0.4)" },
  },
  {
    id: "u2",
    position: { x: 50, y: 220 },
    data: { label: "Bob" },
    style: { background: "linear-gradient(135deg,#ef4444,#f97316)", border: "none", borderRadius: "50%", width: 60, height: 60, color: "#fff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(239,68,68,0.3)" },
  },
  {
    id: "u3",
    position: { x: 350, y: 220 },
    data: { label: "Charlie" },
    style: { background: "linear-gradient(135deg,#ef4444,#f97316)", border: "none", borderRadius: "50%", width: 60, height: 60, color: "#fff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(239,68,68,0.3)" },
  },
  {
    id: "u4",
    position: { x: 200, y: 390 },
    data: { label: "Diana" },
    style: { background: "linear-gradient(135deg,#ef4444,#f97316)", border: "none", borderRadius: "50%", width: 60, height: 60, color: "#fff", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(239,68,68,0.3)" },
  },
];

const FLOW_EDGES = [
  { id: "e1", source: "u2", target: "u1", label: "₹4,250", animated: true, style: { stroke: "#6366f1", strokeWidth: 2 }, labelStyle: { fill: "#818cf8", fontSize: 11, fontWeight: 600 }, labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 } },
  { id: "e2", source: "u3", target: "u1", label: "₹6,100", animated: true, style: { stroke: "#8b5cf6", strokeWidth: 2 }, labelStyle: { fill: "#a78bfa", fontSize: 11, fontWeight: 600 }, labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 } },
  { id: "e3", source: "u4", target: "u1", label: "₹3,450", animated: true, style: { stroke: "#ec4899", strokeWidth: 2 }, labelStyle: { fill: "#f9a8d4", fontSize: 11, fontWeight: 600 }, labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 } },
];

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "balances", label: "Balances", icon: ArrowLeftRight },
  { id: "graph", label: "Graph", icon: GitBranch },
  { id: "settlements", label: "Settlements", icon: ArrowLeftRight },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function GroupDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [nodes, , onNodesChange] = useNodesState(FLOW_NODES);
  const [edges, , onEdgesChange] = useEdgesState(FLOW_EDGES);

  const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0);

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
              {GROUP.emoji}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f8fafc]">{GROUP.name}</h1>
              <p className="text-[#64748b] text-sm mt-0.5">{GROUP.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <AvatarGroup users={GROUP.members} max={5} size="xs" />
                <span className="text-xs text-[#475569]">{GROUP.members.length} members</span>
                <Badge variant="brand">Active</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
            <Button variant="secondary" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="gradient" size="sm">
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
        className="grid grid-cols-4 gap-4"
      >
        {[
          { label: "Total Expenses", value: formatCurrency(totalExpenses), color: "text-[#f8fafc]" },
          { label: "Your Share", value: formatCurrency(totalExpenses / 4), color: "text-[#818cf8]" },
          { label: "You Paid", value: formatCurrency(18000), color: "text-[#4ade80]" },
          { label: "Net Balance", value: formatCurrency(7250), color: "text-[#4ade80]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#0f172a] border border-white/8 rounded-2xl p-4">
            <div className="text-xs text-[#475569] mb-1">{s.label}</div>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
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
          <div className="grid grid-cols-2 gap-6">
            <Card variant="default" padding="lg">
              <CardHeader className="mb-4">
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {EXPENSES.slice(0, 4).map((e) => (
                  <div key={e._id} className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base">
                      {getCategoryIcon(e.category)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-[#f8fafc]">{e.title}</div>
                      <div className="text-xs text-[#475569]">
                        {e.paidByName} · {formatRelativeTime(e.createdAt)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#f8fafc]">
                      {formatCurrency(e.amount)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card variant="brand" padding="lg">
              <CardHeader className="mb-4">
                <CardTitle>Settlement Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center mb-4">
                  <div className="text-3xl font-black gradient-text-brand">3</div>
                  <div className="text-xs text-[#64748b]">payments needed to settle</div>
                </div>
                {OPTIMIZED.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-xl bg-white/3">
                    <Avatar name={s.fromName} size="xs" />
                    <span className="text-[#475569]">→</span>
                    <Avatar name={s.toName} size="xs" />
                    <span className="flex-1 text-[#64748b] text-xs">{s.fromName} → {s.toName}</span>
                    <span className="text-[#818cf8] font-semibold text-xs">{formatCurrency(s.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* EXPENSES */}
        {activeTab === "expenses" && (
          <Card variant="default" padding="lg">
            <CardHeader className="mb-4">
              <div className="flex items-center justify-between">
                <CardTitle>All Expenses ({EXPENSES.length})</CardTitle>
                <Button variant="gradient" size="sm">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {EXPENSES.map((e) => (
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
                      Paid by {e.paidByName} · {e.participants} participants · {formatRelativeTime(e.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#f8fafc]">{formatCurrency(e.amount)}</div>
                    <div className="text-xs text-[#475569]">
                      {formatCurrency(e.amount / e.participants)} each
                    </div>
                  </div>
                </div>
              ))}
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
                {BALANCES.map((b) => {
                  const isPos = b.netBalance > 0;
                  const isNeg = b.netBalance < 0;
                  return (
                    <div key={b.userId} className="flex items-center gap-4 p-4 rounded-xl bg-white/3">
                      <Avatar name={b.name} size="md" />
                      <div className="flex-1">
                        <div className="font-medium text-[#f8fafc] text-sm mb-1">{b.name}</div>
                        <div className="flex gap-4 text-xs text-[#64748b]">
                          <span>Paid: {formatCurrency(b.totalPaid)}</span>
                          <span>Owes: {formatCurrency(b.totalOwed)}</span>
                        </div>
                        {/* Balance bar */}
                        <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPos ? "bg-[#22c55e]" : "bg-[#ef4444]"}`}
                            style={{ width: `${Math.min(100, Math.abs(b.netBalance) / 200)}%` }}
                          />
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${isPos ? "text-[#4ade80]" : isNeg ? "text-[#f87171]" : "text-[#64748b]"}`}>
                        {isPos ? "+" : ""}{formatCurrency(b.netBalance)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* GRAPH */}
        {activeTab === "graph" && (
          <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: 500 }}>
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
              <Controls style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <MiniMap
                style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)" }}
                maskColor="rgba(0,0,0,0.5)"
              />
            </ReactFlowComponent>
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
                    <Badge variant="success">3 transactions</Badge>
                    <Badge variant="default">vs 8 raw</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {OPTIMIZED.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8">
                    <Avatar name={s.fromName} size="sm" />
                    <div className="flex-1">
                      <div className="text-sm text-[#f8fafc] font-medium">
                        {s.fromName} <span className="text-[#475569]">→</span> {s.toName}
                      </div>
                      <div className="text-xs text-[#475569] mt-0.5">Settlement payment</div>
                    </div>
                    <Avatar name={s.toName} size="sm" />
                    <div className="text-sm font-bold text-[#818cf8]">{formatCurrency(s.amount)}</div>
                    <Button variant="success" size="sm">Mark Paid</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
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
                  <div className="text-3xl font-black gradient-text-brand mb-1">₹{(totalExpenses / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-[#64748b]">Total Group Spend</div>
                </div>
                <div className="p-4 rounded-xl bg-white/3 text-center">
                  <div className="text-3xl font-black text-[#4ade80] mb-1">{EXPENSES.length}</div>
                  <div className="text-xs text-[#64748b]">Total Expenses</div>
                </div>
                <div className="p-4 rounded-xl bg-white/3 text-center">
                  <div className="text-3xl font-black text-[#818cf8] mb-1">
                    {formatCurrency(totalExpenses / GROUP.members.length)}
                  </div>
                  <div className="text-xs text-[#64748b]">Average Per Person</div>
                </div>
                <div className="p-4 rounded-xl bg-white/3 text-center">
                  <div className="text-3xl font-black text-[#fbbf24] mb-1">🍕</div>
                  <div className="text-xs text-[#64748b]">Top Category: Food</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

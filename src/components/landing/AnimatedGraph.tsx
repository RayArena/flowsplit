"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactFlowComponent = ReactFlow as any;
import "@xyflow/react/dist/style.css";

const DEMO_NODES: Node[] = [
  {
    id: "alice",
    position: { x: 250, y: 80 },
    data: { label: "Alice" },
    type: "default",
    style: {
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      border: "1px solid rgba(99,102,241,0.4)",
      borderRadius: "50%",
      width: 60,
      height: 60,
      color: "#fff",
      fontWeight: 600,
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 20px rgba(99,102,241,0.4)",
    },
  },
  {
    id: "bob",
    position: { x: 80, y: 260 },
    data: { label: "Bob" },
    type: "default",
    style: {
      background: "linear-gradient(135deg, #ec4899, #f43f5e)",
      border: "1px solid rgba(236,72,153,0.4)",
      borderRadius: "50%",
      width: 60,
      height: 60,
      color: "#fff",
      fontWeight: 600,
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 20px rgba(236,72,153,0.3)",
    },
  },
  {
    id: "charlie",
    position: { x: 420, y: 260 },
    data: { label: "Charlie" },
    type: "default",
    style: {
      background: "linear-gradient(135deg, #22c55e, #14b8a6)",
      border: "1px solid rgba(34,197,94,0.4)",
      borderRadius: "50%",
      width: 60,
      height: 60,
      color: "#fff",
      fontWeight: 600,
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 20px rgba(34,197,94,0.3)",
    },
  },
  {
    id: "diana",
    position: { x: 250, y: 420 },
    data: { label: "Diana" },
    type: "default",
    style: {
      background: "linear-gradient(135deg, #f59e0b, #f97316)",
      border: "1px solid rgba(245,158,11,0.4)",
      borderRadius: "50%",
      width: 60,
      height: 60,
      color: "#fff",
      fontWeight: 600,
      fontSize: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 20px rgba(245,158,11,0.3)",
    },
  },
];

const DEMO_EDGES: Edge[] = [
  {
    id: "e1",
    source: "bob",
    target: "alice",
    label: "₹3,000",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    labelStyle: { fill: "#818cf8", fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 },
  },
  {
    id: "e2",
    source: "charlie",
    target: "alice",
    label: "₹1,500",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
    labelStyle: { fill: "#a78bfa", fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 },
  },
  {
    id: "e3",
    source: "diana",
    target: "bob",
    label: "₹800",
    animated: true,
    style: { stroke: "#ec4899", strokeWidth: 2 },
    labelStyle: { fill: "#f9a8d4", fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 },
  },
  {
    id: "e4",
    source: "diana",
    target: "charlie",
    label: "₹2,200",
    animated: true,
    style: { stroke: "#22c55e", strokeWidth: 2 },
    labelStyle: { fill: "#86efac", fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 },
  },
];

export function AnimatedGraph() {
  const [nodes, , onNodesChange] = useNodesState(DEMO_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEMO_EDGES);

  const onConnect = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/25 text-sm text-[#818cf8] mb-6">
            <span>⬡</span> Debt visualization
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#f8fafc] mb-4">
            See money flow in{" "}
            <span className="gradient-text">real time</span>
          </h2>
          <p className="text-[#64748b] text-lg max-w-xl mx-auto">
            FlowSplit generates a live directed graph of all debts. Interactive, zoomable, and always up to date.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-white/10"
          style={{ height: 520 }}
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 to-[#8b5cf6]/5 pointer-events-none" />

          <ReactFlowComponent
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            style={{ background: "#0a0f1e" }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#1e293b" gap={24} size={1} />
            <Controls
              style={{
                background: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
            />
          </ReactFlowComponent>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-3 text-xs space-y-1.5">
            <div className="text-[#64748b] font-medium mb-2">Legend</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }} />
              <span className="text-[#94a3b8]">Node = User</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-[#6366f1]" />
              <span className="text-[#94a3b8]">Edge = Debt</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#818cf8] font-medium">₹</span>
              <span className="text-[#94a3b8]">Amount owed</span>
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              step: "01",
              title: "Add Expenses",
              desc: "Log expenses in seconds. Scan receipts or enter manually. Choose your split type.",
              color: "#6366f1",
            },
            {
              step: "02",
              title: "View the Graph",
              desc: "FlowSplit builds a live debt graph showing exactly who owes what to whom.",
              color: "#8b5cf6",
            },
            {
              step: "03",
              title: "Settle Optimally",
              desc: "One click to see the minimum number of payments needed to clear all debts.",
              color: "#ec4899",
            },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-[#0f172a] border border-white/8 rounded-2xl p-6"
            >
              <div
                className="text-3xl font-black mb-3 opacity-30"
                style={{ color: s.color }}
              >
                {s.step}
              </div>
              <h3 className="text-[#f8fafc] font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

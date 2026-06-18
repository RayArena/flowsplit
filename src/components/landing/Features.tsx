"use client";

import { motion } from "framer-motion";
import { Scan, Zap, GitFork, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "OCR Receipt Scanning",
    description:
      "Snap a photo of any receipt. FlowSplit automatically extracts vendor, date, and total amount using AI-powered OCR — no manual entry needed.",
    color: "#6366f1",
    gradient: "from-[#6366f1]/20 to-transparent",
    badge: "Powered by Tesseract.js",
  },
  {
    icon: Zap,
    title: "Real-Time Sync",
    description:
      "Every expense, settlement, and balance update propagates instantly to all group members. No refresh. No delays. True real-time via Pusher.",
    color: "#f59e0b",
    gradient: "from-[#f59e0b]/15 to-transparent",
    badge: "< 100ms latency",
  },
  {
    icon: GitFork,
    title: "Settlement Optimization",
    description:
      "Our graph-based algorithm minimizes the number of transactions needed. Turn 12 payments into 4 settlements automatically.",
    color: "#22c55e",
    gradient: "from-[#22c55e]/15 to-transparent",
    badge: "Up to 80% fewer transactions",
  },
  {
    icon: BarChart3,
    title: "Debt Graph Visualization",
    description:
      "Interactive React Flow graph showing who owes what to whom. Zoom, pan, and drag to explore your group's financial network.",
    color: "#ec4899",
    gradient: "from-[#ec4899]/15 to-transparent",
    badge: "Interactive & Live",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/25 text-sm text-[#818cf8] mb-6">
            <span>✦</span> Everything you need
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#f8fafc] mb-4">
            Built for modern{" "}
            <span className="gradient-text">group finances</span>
          </h2>
          <p className="text-[#64748b] text-lg max-w-xl mx-auto">
            Every feature is designed to make expense sharing frictionless and transparent.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl bg-[#0f172a] border border-white/8 p-8 card-hover"
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}20`, border: `1px solid ${feature.color}30` }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: feature.color }}
                  />
                </div>

                {/* Badge */}
                <div
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4"
                  style={{
                    backgroundColor: `${feature.color}15`,
                    color: feature.color,
                    border: `1px solid ${feature.color}25`,
                  }}
                >
                  {feature.badge}
                </div>

                <h3 className="text-xl font-semibold text-[#f8fafc] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#64748b] leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{ backgroundColor: feature.color, transform: "translate(50%, -50%)" }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

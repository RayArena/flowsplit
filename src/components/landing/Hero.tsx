"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

function AnimatedCounter({ end, prefix = "", suffix = "" }: { end: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, end);
      setCount(Math.floor(current));
      if (current >= end) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [end]);

  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  { label: "Transactions Optimized", value: 24800, suffix: "+" },
  { label: "Groups Created", value: 6200, suffix: "+" },
  { label: "Money Saved", prefix: "₹", value: 1800000, suffix: "+" },
  { label: "Active Users", value: 3400, suffix: "+" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0533]/20 via-transparent to-[#030712]" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#8b5cf6]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-[#ec4899]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/25 text-sm text-[#818cf8] mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Graph-based settlement optimization</span>
          <span className="w-1 h-1 rounded-full bg-[#818cf8]" />
          <span>Powered by AI</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-[#f8fafc]">Understand Every</span>
          <br />
          <span className="gradient-text">Expense.</span>
          <br />
          <span className="text-[#f8fafc]">Settle </span>
          <span className="gradient-text">Smarter.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Track expenses, optimize settlements, and visualize money flow in real time.
          <br className="hidden sm:block" />
          FlowSplit minimizes transactions so you spend less time settling up.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/sign-up">
            <Button
              variant="gradient"
              size="xl"
              className="shadow-2xl shadow-[#6366f1]/30 text-base"
              id="hero-get-started"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/#features">
            <Button variant="secondary" size="xl" className="text-base" id="hero-learn-more">
              See How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-20"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-[#f8fafc] mb-1">
                <AnimatedCounter
                  end={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>
              <div className="text-xs text-[#64748b]">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Glow under preview */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#6366f1]/20 via-[#8b5cf6]/15 to-[#ec4899]/10 rounded-3xl blur-2xl" />

          <div className="relative glass rounded-3xl p-1 border border-white/10">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b border-white/8">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ef4444]/60" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#f59e0b]/60" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#22c55e]/60" />
              </div>
              <div className="flex-1 mx-2 sm:mx-4 h-5 sm:h-6 rounded-lg bg-white/5 flex items-center px-2 sm:px-3">
                <span className="text-[10px] sm:text-xs text-[#475569]">flowsplit.app/dashboard</span>
              </div>
            </div>

            {/* Mock dashboard — full layout on md+, stacked cards on mobile */}
            <div className="p-3 sm:p-6">
              {/* Mobile: stacked stat cards */}
              <div className="grid grid-cols-2 gap-2 sm:hidden mb-3">
                {[
                  { label: "Net Balance", value: "+₹2,400", color: "text-[#4ade80]" },
                  { label: "Owed to you", value: "₹5,200", color: "text-[#818cf8]" },
                  { label: "You owe", value: "₹2,800", color: "text-[#f87171]" },
                  { label: "Active Groups", value: "6", color: "text-[#fbbf24]" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/3 rounded-xl p-2.5">
                    <div className="text-[9px] text-[#475569] mb-1">{s.label}</div>
                    <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="sm:hidden bg-white/3 rounded-xl p-3">
                <div className="text-[9px] text-[#475569] mb-2">Spending Trend</div>
                <div className="flex items-end gap-1 h-14">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 5 ? "#6366f1" : "rgba(99,102,241,0.2)" }} />
                  ))}
                </div>
              </div>

              {/* Desktop: full sidebar + content layout */}
              <div className="hidden sm:grid grid-cols-12 gap-4 min-h-[320px]">
                {/* Sidebar */}
                <div className="col-span-2 space-y-2">
                  {["Dashboard", "Groups", "Expenses", "Analytics", "Settle"].map((item, i) => (
                    <div
                      key={item}
                      className={`h-8 rounded-lg flex items-center px-2 ${i === 0 ? "bg-[#6366f1]/20 border border-[#6366f1]/30" : "bg-white/3"}`}
                    >
                      <div className={`text-xs ${i === 0 ? "text-[#818cf8]" : "text-[#475569]"}`}>{item}</div>
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="col-span-10 space-y-4">
                  {/* Stat row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Net Balance", value: "+₹2,400", color: "text-[#4ade80]" },
                      { label: "Owed to you", value: "₹5,200", color: "text-[#818cf8]" },
                      { label: "You owe", value: "₹2,800", color: "text-[#f87171]" },
                      { label: "Active Groups", value: "6", color: "text-[#fbbf24]" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/3 rounded-xl p-3">
                        <div className="text-[10px] text-[#475569] mb-1">{s.label}</div>
                        <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart + activity row */}
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3 bg-white/3 rounded-xl p-3 h-32 flex flex-col gap-2">
                      <div className="text-[10px] text-[#475569]">Spending Trend</div>
                      <div className="flex-1 flex items-end gap-1">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t"
                            style={{
                              height: `${h}%`,
                              background: i === 5 ? "#6366f1" : "rgba(99,102,241,0.2)",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2 bg-white/3 rounded-xl p-3 space-y-2">
                      <div className="text-[10px] text-[#475569]">Recent Activity</div>
                      {["Trip to Goa", "Team Lunch", "Uber Share"].map((a) => (
                        <div key={a} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-md bg-[#6366f1]/30" />
                          <div className="text-[10px] text-[#64748b]">{a}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

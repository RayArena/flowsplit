"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the settlement optimization work?",
    answer:
      "FlowSplit uses a greedy net-balance algorithm. It computes each person's net balance (money received minus money owed), then greedily matches the largest debtor with the largest creditor. This results in at most N-1 transactions for N people — the theoretical minimum for any set of debts.",
  },
  {
    question: "What split types are supported?",
    answer:
      "FlowSplit supports 4 split types: Equal (divide total equally), Percentage (each person pays a set %), Exact (specify exact amounts for each person), and Shares (assign relative weights like 2:1:1).",
  },
  {
    question: "How does OCR receipt scanning work?",
    answer:
      "Upload a photo of any receipt (PNG, JPG, or PDF). FlowSplit runs it through Tesseract.js OCR engine to extract text, then applies smart regex patterns to identify the vendor name, date, and total amount. You can review and edit before saving.",
  },
  {
    question: "What is the Smart Settlement Simulator?",
    answer:
      "The simulator lets you ask \"What happens if I pay ₹500 today?\" and instantly see how that payment would affect all balances, the debt graph, and remaining settlements. Great for planning partial payments.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Authentication is handled by Clerk (enterprise-grade security with Google OAuth). All data is stored in MongoDB Atlas with encryption at rest. Receipt images are stored securely on Cloudinary.",
  },
  {
    question: "Can I use FlowSplit for international groups?",
    answer:
      "Yes! FlowSplit supports multiple currencies (INR, USD, EUR, GBP, JPY, CAD, AUD, SGD). Each group can have its own base currency.",
  },
  {
    question: "How does real-time sync work?",
    answer:
      "FlowSplit uses Pusher WebSocket channels. Whenever a group member adds or deletes an expense, or records a settlement, all other connected members see the update instantly — no page refresh needed.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/25 text-sm text-[#818cf8] mb-6">
            <span>?</span> Common questions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#f8fafc] mb-4">
            Frequently Asked{" "}
            <span className="gradient-text">Questions</span>
          </h2>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  openIndex === i
                    ? "bg-[#6366f1]/8 border-[#6366f1]/25"
                    : "bg-[#0f172a] border-white/8 hover:border-white/15"
                }`}
              >
                <button
                  id={`faq-${i}`}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span className="text-[#f8fafc] font-medium text-sm leading-relaxed pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#94a3b8] flex-shrink-0 transition-transform duration-300 ${
                      openIndex === i ? "rotate-180 text-[#818cf8]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5">
                        <div className="w-full h-px bg-white/8 mb-4" />
                        <p className="text-[#64748b] text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

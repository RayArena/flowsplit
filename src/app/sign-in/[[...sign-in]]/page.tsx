import { isClerkConfigured } from "@/lib/clerk-config";
import { Zap, AlertTriangle, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — FlowSplit",
};

// Dynamically import the Clerk SignIn component only when keys are set
async function SignInContent() {
  if (!isClerkConfigured()) {
    return <SetupRequired />;
  }
  const { SignIn } = await import("@clerk/nextjs");
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "bg-[#0f172a] border border-white/10 shadow-2xl rounded-3xl",
          headerTitle: "text-[#f8fafc] font-bold text-2xl",
          headerSubtitle: "text-[#64748b]",
          socialButtonsBlockButton:
            "bg-[#1e293b] border border-white/10 hover:bg-[#334155] text-[#f8fafc] rounded-xl transition-all",
          socialButtonsBlockButtonText: "text-[#f8fafc] font-medium",
          dividerLine: "bg-white/10",
          dividerText: "text-[#475569]",
          formFieldLabel: "text-[#cbd5e1] text-sm font-medium",
          formFieldInput:
            "bg-[#1e293b] border border-white/10 rounded-xl text-[#f8fafc] focus:border-[#6366f1]/50 focus:ring-2 focus:ring-[#6366f1]/20",
          formButtonPrimary:
            "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] rounded-xl font-medium shadow-lg shadow-[#6366f1]/20",
          footerActionText: "text-[#64748b]",
          footerActionLink: "text-[#818cf8] hover:text-[#6366f1]",
          alert:
            "bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#f87171] rounded-xl",
        },
        layout: {
          logoPlacement: "none",
          socialButtonsPlacement: "top",
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any}
    />
  );
}

function SetupRequired() {
  return (
    <div className="w-full bg-[#0f172a] border border-white/10 rounded-3xl p-8 text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/25 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-7 h-7 text-[#fbbf24]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#f8fafc] mb-2">Clerk Not Configured</h2>
        <p className="text-[#64748b] text-sm leading-relaxed">
          Authentication requires a Clerk publishable key. Open{" "}
          <code className="bg-white/5 px-1.5 py-0.5 rounded text-[#fbbf24] font-mono text-xs">
            .env.local
          </code>{" "}
          and fill in your Clerk API keys.
        </p>
      </div>
      <div className="bg-[#1e293b] border border-white/8 rounded-2xl p-4 text-left space-y-2">
        <p className="text-xs text-[#475569] font-medium uppercase tracking-widest">Steps</p>
        {[
          "Go to dashboard.clerk.com",
          "Create a new application",
          "Enable Email + Google sign-in",
          "Copy your Publishable Key + Secret Key",
          "Paste into .env.local and restart dev server",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-[#94a3b8]">
            <span className="w-5 h-5 rounded-full bg-[#6366f1]/20 text-[#818cf8] text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            {step}
          </div>
        ))}
      </div>
      <a
        href="https://dashboard.clerk.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-sm font-medium shadow-lg shadow-[#6366f1]/20 hover:shadow-[#6366f1]/40 transition-shadow"
      >
        Open Clerk Dashboard
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-[#030712] via-[#0f172a] to-[#1a0533] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6366f1]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#8b5cf6]/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#f8fafc] font-semibold text-lg">
              Flow<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]">Split</span>
            </span>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-[#f8fafc] leading-tight mb-4">
            Understand Every Expense.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#ec4899]">
              Settle Smarter.
            </span>
          </h2>
          <p className="text-[#64748b] text-lg leading-relaxed max-w-md">
            Track shared expenses, visualize debt flows, and optimize settlements with our graph-based algorithm.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: "⚡", text: "Real-time sync across all devices" },
            { icon: "🧠", text: "AI-powered receipt scanning" },
            { icon: "📊", text: "Transaction-minimizing settlements" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base">
                {item.icon}
              </div>
              <span className="text-[#94a3b8] text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#030712]">
        <div className="w-full max-w-md">
          <SignInContent />
        </div>
      </div>
    </div>
  );
}

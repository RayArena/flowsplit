import { isClerkConfigured } from "@/lib/clerk-config";
import { Zap, AlertTriangle, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — FlowSplit",
  description: "Create your FlowSplit account and start managing group expenses intelligently.",
};

async function SignUpContent() {
  if (!isClerkConfigured()) {
    return <SetupRequired />;
  }
  const { SignUp } = await import("@clerk/nextjs");
  return (
    <SignUp
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
          alert: "bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#f87171] rounded-xl",
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

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-[#030712] via-[#0f172a] to-[#1a0533] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[#6366f1]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#ec4899]/8 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#f8fafc] font-semibold text-lg">
              Flow<span className="gradient-text-brand">Split</span>
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-[#f8fafc] leading-tight mb-4">
            Join thousands of
            <br />
            <span className="gradient-text">smart spenders.</span>
          </h2>
          <p className="text-[#64748b] text-lg leading-relaxed max-w-md">
            Create groups, add expenses, and let FlowSplit calculate the optimal settlement path automatically.
          </p>
        </div>

        {/* Testimonial card */}
        <div className="relative z-10 glass rounded-2xl p-5 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-semibold text-sm">
              RS
            </div>
            <div>
              <div className="text-[#f8fafc] text-sm font-medium">Rahul S.</div>
              <div className="text-[#475569] text-xs">Bangalore, India</div>
            </div>
          </div>
          <p className="text-[#94a3b8] text-sm leading-relaxed">
            &ldquo;FlowSplit saved our Goa trip — reduced 18 payments to just 5. The graph visualization made it crystal clear who owed what.&rdquo;
          </p>
          <div className="flex gap-1 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-[#fbbf24] text-sm">★</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#030712]">
        <div className="w-full max-w-md">
          <SignUpContent />
        </div>
      </div>
    </div>
  );
}

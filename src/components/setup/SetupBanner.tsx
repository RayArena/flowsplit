"use client";

import { useState } from "react";
import { X, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const SERVICES = [
  {
    name: "Clerk (Auth)",
    url: "https://dashboard.clerk.com",
    envVars: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"],
    steps: "Create app → API Keys tab → copy Publishable Key + Secret Key",
    required: true,
  },
  {
    name: "MongoDB Atlas",
    url: "https://cloud.mongodb.com",
    envVars: ["MONGODB_URI"],
    steps: "Create M0 cluster → Database Access (add user) → Connect → Drivers → copy URI",
    required: true,
  },
  {
    name: "Pusher",
    url: "https://dashboard.pusher.com",
    envVars: ["PUSHER_APP_ID", "NEXT_PUBLIC_PUSHER_KEY", "PUSHER_SECRET"],
    steps: "Create Channels app → App Keys tab → copy ID, Key, Secret",
    required: false,
  },
];

export function SetupBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[999] bg-[#1a0a00] border-b border-[#f59e0b]/30 shadow-lg shadow-[#f59e0b]/5">
      {/* Main banner row */}
      <div className="flex items-center gap-3 px-4 py-2.5 max-w-7xl mx-auto">
        <AlertTriangle className="w-4 h-4 text-[#fbbf24] flex-shrink-0" />
        <span className="text-[#fbbf24] text-sm font-medium flex-1">
          <strong>Setup required:</strong>{" "}
          <span className="text-[#f59e0b] font-normal">
            Clerk publishable key not configured — fill in{" "}
            <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code>{" "}
            to enable authentication.
          </span>
        </span>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/25 text-[#fbbf24] text-xs font-medium hover:bg-[#f59e0b]/25 transition-colors"
        >
          How to fix
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          aria-label="Dismiss setup banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded setup guide */}
      {expanded && (
        <div className="border-t border-[#f59e0b]/15 bg-[#0f0a00] px-4 py-5 max-w-7xl mx-auto">
          <p className="text-[#94a3b8] text-xs mb-4">
            Open{" "}
            <code className="bg-black/40 px-1.5 py-0.5 rounded text-[#fbbf24] font-mono">.env.local</code>{" "}
            in the project root and replace the placeholder values:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SERVICES.map((service) => (
              <div
                key={service.name}
                className="rounded-xl bg-white/3 border border-white/8 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-[#f8fafc]">{service.name}</span>
                  {service.required && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/20 text-[10px] text-[#f87171] font-medium">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-[#64748b] text-xs mb-3 leading-relaxed">{service.steps}</p>
                <div className="space-y-1 mb-3">
                  {service.envVars.map((v) => (
                    <code
                      key={v}
                      className="block text-[10px] bg-black/30 px-2 py-1 rounded text-[#94a3b8] font-mono"
                    >
                      {v}
                    </code>
                  ))}
                </div>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#818cf8] hover:text-[#6366f1] transition-colors"
                >
                  Open dashboard
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
          <p className="text-[#475569] text-xs mt-4">
            After saving{" "}
            <code className="bg-black/30 px-1 py-0.5 rounded font-mono">.env.local</code>,
            restart the dev server with{" "}
            <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-[#fbbf24]">
              npm run dev
            </code>
          </p>
        </div>
      )}
    </div>
  );
}

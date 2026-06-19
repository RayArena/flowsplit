"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, ArrowRight, Loader2, AlertTriangle, CheckCircle2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface GroupInfo {
  groupId: string;
  groupName: string;
  description?: string;
  memberCount: number;
  currency: string;
  members: Array<{ name: string; avatar?: string }>;
}

export default function InvitePage() {
  const { code } = useParams() as { code: string };
  const router = useRouter();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function fetchGroupInfo() {
      try {
        const res = await fetch(`/api/invite/${code}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || "Invalid invite link");
          return;
        }
        setGroupInfo(json.data);
      } catch {
        setError("Failed to load invite details");
      } finally {
        setIsLoading(false);
      }
    }

    if (code) fetchGroupInfo();
  }, [code]);

  const handleJoin = async () => {
    if (!groupInfo) return;
    setIsJoining(true);
    try {
      const res = await fetch(`/api/groups/${groupInfo.groupId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Not logged in — redirect to sign-in with return URL
          router.push(`/sign-in?redirect_url=/invite/${code}`);
          return;
        }
        throw new Error(json.error || "Failed to join group");
      }

      if (json.data?.alreadyMember) {
        toast.info("You're already a member of this group!");
        router.push(`/groups/${json.data.groupId}`);
        return;
      }

      setJoined(true);
      toast.success("Successfully joined the group!");
      setTimeout(() => {
        router.push(`/groups/${json.data.groupId}`);
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to join group");
    } finally {
      setIsJoining(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const avatarColors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin" />
          <p className="text-[#64748b] text-sm">Loading invite details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !groupInfo) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0f172a] border border-white/10 rounded-3xl p-8 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-[#f87171]" />
          </div>
          <h1 className="text-xl font-bold text-[#f8fafc] mb-2">Invalid Invite Link</h1>
          <p className="text-[#64748b] text-sm mb-6">
            {error || "This invite link is invalid or has expired. Please ask for a new one."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-xl bg-[#6366f1] text-white text-sm font-medium hover:bg-[#4f46e5] transition-colors"
          >
            Go to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0f172a] border border-[#22c55e]/20 rounded-3xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-8 h-8 text-[#4ade80]" />
          </motion.div>
          <h1 className="text-xl font-bold text-[#f8fafc] mb-2">Welcome to the group!</h1>
          <p className="text-[#64748b] text-sm">
            Redirecting you to <span className="text-[#818cf8] font-medium">{groupInfo.groupName}</span>...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#6366f1]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#8b5cf6]/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative max-w-md w-full"
      >
        {/* Card */}
        <div className="bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-[#6366f1]/5">
          {/* Top gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899]" />

          <div className="p-8">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 border border-[#6366f1]/20 flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-8 h-8 text-[#818cf8]" />
            </div>

            {/* Text */}
            <h1 className="text-2xl font-bold text-[#f8fafc] text-center mb-2">
              You&apos;re invited to join
            </h1>
            <div className="text-center mb-6">
              <span className="text-2xl font-black bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                {groupInfo.groupName}
              </span>
              {groupInfo.description && (
                <p className="text-[#64748b] text-sm mt-2">{groupInfo.description}</p>
              )}
            </div>

            {/* Members preview */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#818cf8]" />
                <span className="text-xs text-[#64748b] font-medium">
                  {groupInfo.memberCount} {groupInfo.memberCount === 1 ? "member" : "members"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {groupInfo.members.slice(0, 8).map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/8"
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                    >
                      {getInitials(m.name)}
                    </div>
                    <span className="text-xs text-[#94a3b8]">{m.name}</span>
                  </div>
                ))}
                {groupInfo.memberCount > 8 && (
                  <div className="flex items-center px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/8">
                    <span className="text-xs text-[#475569]">+{groupInfo.memberCount - 8} more</span>
                  </div>
                )}
              </div>
            </div>

            {/* Currency info */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-xs text-[#475569]">Currency:</span>
              <span className="text-xs text-[#94a3b8] font-medium px-2 py-0.5 rounded-lg bg-white/5 border border-white/8">
                {groupInfo.currency}
              </span>
            </div>

            {/* Join button */}
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#6366f1]/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Group
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-[#475569] mt-4">
              You&apos;ll need to sign in or create an account to join.
            </p>
          </div>
        </div>

        {/* FlowSplit branding */}
        <div className="text-center mt-6">
          <span className="text-xs text-[#334155]">
            Powered by{" "}
            <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent font-semibold">
              FlowSplit
            </span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}

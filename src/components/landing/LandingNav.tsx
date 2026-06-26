"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Menu, X } from "lucide-react";
import { isClerkConfigured } from "@/lib/clerk-config";
import { useState } from "react";

import { useAuth, UserButton as ClerkUserButton } from "@clerk/nextjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UserButton(props: any) {
  if (!isClerkConfigured()) return null;
  return <ClerkUserButton {...props} />;
}

function LandingNavCTA() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <>
        <Link href="/dashboard">
          <Button variant="secondary" size="sm">
            Dashboard
          </Button>
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8 rounded-xl",
            },
          }}
        />
      </>
    );
  }

  return <DefaultCTA />;
}

function DefaultCTA() {
  return (
    <>
      <Link href="/sign-in">
        <Button variant="ghost" size="sm">
          Sign in
        </Button>
      </Link>
      <Link href="/sign-up">
        <Button variant="gradient" size="sm">
          Get Started
        </Button>
      </Link>
    </>
  );
}

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
];

export function LandingNav() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const clerkReady = isClerkConfigured();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
      style={{ top: !clerkReady ? "44px" : "0" }}
    >
      <div className="max-w-7xl mx-auto">
        <nav className="glass rounded-2xl px-5 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-[#6366f1]/30 group-hover:shadow-[#6366f1]/50 transition-shadow">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#f8fafc] font-semibold text-base tracking-tight">
                Flow<span className="gradient-text-brand">Split</span>
              </span>
            </Link>

            {/* Nav links — desktop only */}
            {isLanding && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-3 py-1.5 text-sm text-[#94a3b8] hover:text-[#f8fafc] rounded-lg hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Desktop CTA */}
            <div className="hidden sm:flex items-center gap-3">
              {clerkReady ? <LandingNavCTA /> : <DefaultCTA />}
            </div>

            {/* Mobile: hamburger */}
            <button
              className="sm:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#94a3b8] hover:text-[#f8fafc] transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden sm:hidden"
              >
                <div className="pt-3 pb-1 space-y-1 border-t border-white/8 mt-3">
                  {isLanding && navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2.5 text-sm text-[#94a3b8] hover:text-[#f8fafc] rounded-xl hover:bg-white/5 transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="flex flex-col gap-2 pt-2">
                    <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="secondary" size="sm" className="w-full">Sign in</Button>
                    </Link>
                    <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="gradient" size="sm" className="w-full">Get Started Free</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </motion.header>
  );
}

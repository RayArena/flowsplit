import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { AnimatedGraph } from "@/components/landing/AnimatedGraph";
import { Features } from "@/components/landing/Features";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlowSplit — Intelligent Group Expense Management",
  description:
    "Track expenses, optimize settlements, and visualize money flow in real time. The smartest way to manage shared group finances.",
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <LandingNav />
      <main>
        <Hero />
        <AnimatedGraph />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

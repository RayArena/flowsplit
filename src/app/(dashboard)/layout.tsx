import { Sidebar } from "@/components/layout/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | FlowSplit",
    default: "Dashboard | FlowSplit",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030712] flex">
      <Sidebar />

      {/* Main content — push right on desktop, add top/bottom padding for mobile bars */}
      <div className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0 pb-16 lg:pb-0">
        <main className="p-4 sm:p-6 md:p-8 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}

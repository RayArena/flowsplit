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
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 ml-60 min-h-screen">
        <main className="p-6 md:p-8 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "sonner";
import { isClerkConfigured } from "@/lib/clerk-config";
import { SetupBanner } from "@/components/setup/SetupBanner";

import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FlowSplit — Intelligent Group Expense Management",
    template: "%s | FlowSplit",
  },
  description:
    "Track expenses, optimize settlements, and visualize money flow in real time. The smartest way to manage shared group finances.",
  keywords: [
    "expense tracking",
    "split bills",
    "group expenses",
    "settlements",
    "money management",
  ],
  authors: [{ name: "FlowSplit" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head />
      <body className="min-h-screen antialiased">
        <Providers>
          {!isClerkConfigured() && <SetupBanner />}
          {children}
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );

  if (isClerkConfigured()) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}

"use client";

import { useUser } from "@clerk/nextjs";

/**
 * Only rendered when Clerk IS configured.
 * Reads the current user's first name from Clerk.
 */
export function DashboardGreeting() {
  const { user } = useUser();
  const firstName = user?.firstName ?? "there";

  return (
    <span>
      Good evening, <span className="text-[#818cf8]">{firstName}</span> 👋
    </span>
  );
}

/**
 * Checks if Clerk is properly configured with real keys.
 * Returns false when still using placeholder values from .env.local.
 */
export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return (
    (key.startsWith("pk_test_") || key.startsWith("pk_live_")) &&
    !key.includes("REPLACE")
  );
}

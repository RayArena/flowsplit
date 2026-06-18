import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Check if Clerk is configured with real keys
const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const isClerkConfigured =
  (CLERK_PUBLISHABLE_KEY.startsWith("pk_test_") ||
    CLERK_PUBLISHABLE_KEY.startsWith("pk_live_")) &&
  !CLERK_PUBLISHABLE_KEY.includes("REPLACE");

// Only apply Clerk middleware when keys are present
let clerkMiddlewareExport: typeof import("next/server").NextResponse | unknown;

if (isClerkConfigured) {
  const { clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server");

  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/api/pusher/auth",
  ]);

  clerkMiddlewareExport = clerkMiddleware(async (auth: { protect: () => Promise<void> }, request: NextRequest) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  });
} else {
  // When Clerk is not configured, redirect any dashboard/protected access to /sign-in
  clerkMiddlewareExport = (request: NextRequest) => {
    const { pathname } = request.nextUrl;
    
    const isPublic =
      pathname === "/" ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/api/webhooks") ||
      pathname.startsWith("/api/pusher/auth");

    if (!isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  };
}

export default clerkMiddlewareExport;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

// This route syncs Clerk users to MongoDB on sign-up
// Set up in Clerk Dashboard → Webhooks → Add endpoint:
// URL: https://yourdomain.com/api/webhooks/clerk
// Events: user.created, user.updated

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("CLERK_WEBHOOK_SECRET env var is missing");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  const payload = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: { type: string; data: { id: string; first_name?: string; last_name?: string; email_addresses: Array<{ email_address: string }>; image_url?: string } };

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as typeof evt;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  const { type, data } = evt;
  const clerkId = data.id;
  const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || "User";
  const email = data.email_addresses[0]?.email_address ?? "";
  const avatar = data.image_url;

  if (type === "user.created") {
    await User.create({ clerkId, name, email, avatar });
  } else if (type === "user.updated") {
    await User.findOneAndUpdate(
      { clerkId },
      { name, email, avatar },
      { upsert: true }
    );
  }

  return NextResponse.json({ success: true });
}

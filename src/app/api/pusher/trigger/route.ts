import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { channel, event, data } = body;

    if (!channel || !event) {
      return NextResponse.json({ error: "channel and event are required" }, { status: 400 });
    }

    await pusherServer.trigger(channel, event, {
      ...data,
      triggeredBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/pusher/trigger", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

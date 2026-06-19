import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/models/Group";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/groups/[id]/invite — Get invite code for a group
export async function GET(_req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const group = await Group.findOne({ _id: id, "members.userId": userId });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Generate invite code if it doesn't exist
    if (!group.inviteCode) {
      await group.save(); // pre-save hook generates the code
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://flowsplit-sand.vercel.app"}/invite/${group.inviteCode}`;

    return NextResponse.json({
      data: {
        inviteCode: group.inviteCode,
        inviteUrl,
        groupName: group.name,
      },
    });
  } catch (error) {
    console.error("GET /api/groups/[id]/invite", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/groups/[id]/invite — Regenerate invite code
export async function POST(_req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const group = await Group.findOne({ _id: id, "members.userId": userId });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Only admin can regenerate invite code
    const member = group.members.find((m: { userId: string }) => m.userId === userId);
    if (member?.role !== "admin") {
      return NextResponse.json({ error: "Only admins can regenerate invite links" }, { status: 403 });
    }

    // Force regenerate by clearing and saving
    const crypto = await import("crypto");
    group.inviteCode = crypto.randomBytes(4).toString("hex");
    await group.save();

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://flowsplit-sand.vercel.app"}/invite/${group.inviteCode}`;

    return NextResponse.json({
      data: {
        inviteCode: group.inviteCode,
        inviteUrl,
        groupName: group.name,
      },
    });
  } catch (error) {
    console.error("POST /api/groups/[id]/invite", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

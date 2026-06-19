import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/models/Group";

interface Params {
  params: Promise<{ code: string }>;
}

// GET /api/invite/[code] — Validate invite code and return group info
export async function GET(_req: Request, { params }: Params) {
  try {
    await connectDB();
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const group = await Group.findOne({ inviteCode: code, isArchived: false }).lean();
    if (!group) {
      return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        groupId: group._id,
        groupName: group.name,
        description: group.description,
        memberCount: group.members.length,
        currency: group.currency,
        members: group.members.map((m: { name: string; avatar?: string }) => ({
          name: m.name,
          avatar: m.avatar,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/invite/[code]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

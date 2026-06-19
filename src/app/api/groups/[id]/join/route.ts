import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/models/Group";
import User from "@/models/User";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/groups/[id]/join — Join a group using invite code
export async function POST(req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const body = await req.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    // Find group by ID and verify invite code
    const group = await Group.findOne({ _id: id, inviteCode, isArchived: false });
    if (!group) {
      return NextResponse.json({ error: "Invalid invite link or group not found" }, { status: 404 });
    }

    // Check if already a member
    const existingMember = group.members.find(
      (m: { userId: string }) => m.userId === userId
    );
    if (existingMember) {
      return NextResponse.json({
        data: { alreadyMember: true, groupId: group._id },
        message: "You are already a member of this group",
      });
    }

    // Get user info
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found. Please complete setup." }, { status: 404 });
    }

    // Add user to the group
    group.members.push({
      userId,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: "member",
      joinedAt: new Date(),
    });

    await group.save();

    return NextResponse.json({
      data: { groupId: group._id, groupName: group.name },
      message: "Successfully joined the group!",
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/groups/[id]/join", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

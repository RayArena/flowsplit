import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/models/Group";
import User from "@/models/User";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const groups = await Group.find({
      "members.userId": userId,
      isArchived: false,
    }).sort({ updatedAt: -1 }).lean();

    return NextResponse.json({ data: groups });
  } catch (error) {
    console.error("GET /api/groups", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await req.json();
    const { name, description, currency = "INR" } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    // Get the creator's user info from our DB (synced via Clerk webhook)
    const creator = await User.findOne({ clerkId: userId }).lean();
    if (!creator) {
      return NextResponse.json({ error: "User not found. Please complete setup." }, { status: 404 });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim(),
      currency,
      createdBy: userId,
      members: [
        {
          userId,
          name: creator.name,
          email: creator.email,
          avatar: creator.avatar,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    });

    return NextResponse.json({ data: group }, { status: 201 });
  } catch (error) {
    console.error("POST /api/groups", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

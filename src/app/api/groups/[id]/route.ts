import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/models/Group";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const group = await Group.findOne({
      _id: id,
      "members.userId": userId,
    }).lean();

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ data: group });
  } catch (error) {
    console.error("GET /api/groups/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const group = await Group.findOne({ _id: id, "members.userId": userId });
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const member = group.members.find((m: { userId: string }) => m.userId === userId);
    if (member?.role !== "admin") {
      return NextResponse.json({ error: "Only admins can edit groups" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, currency, isArchived } = body;

    if (name !== undefined) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();
    if (currency !== undefined) group.currency = currency;
    if (isArchived !== undefined) group.isArchived = isArchived;

    await group.save();

    return NextResponse.json({ data: group });
  } catch (error) {
    console.error("PATCH /api/groups/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const group = await Group.findOne({ _id: id, createdBy: userId });
    if (!group) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

    // Archive instead of delete
    group.isArchived = true;
    await group.save();

    return NextResponse.json({ message: "Group archived" });
  } catch (error) {
    console.error("DELETE /api/groups/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

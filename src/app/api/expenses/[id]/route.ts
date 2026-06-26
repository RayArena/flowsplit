import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const expense = await Expense.findById(id);
    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    // Verify user is a member of the expense's group
    const group = await Group.findOne({ _id: expense.groupId, "members.userId": userId });
    if (!group) return NextResponse.json({ error: "Group not found or unauthorized" }, { status: 403 });

    const body = await req.json();
    const { title, description, amount, paidBy, paidByName, participants, splitType, category } = body;

    if (title !== undefined) expense.title = title.trim();
    if (description !== undefined) expense.description = description?.trim();
    if (amount !== undefined) expense.amount = Number(amount);
    if (paidBy !== undefined) expense.paidBy = paidBy;
    if (paidByName !== undefined) expense.paidByName = paidByName;
    if (participants !== undefined) expense.participants = participants;
    if (splitType !== undefined) expense.splitType = splitType;
    if (category !== undefined) expense.category = category;

    await expense.save();

    return NextResponse.json({ data: expense });
  } catch (error) {
    console.error("PATCH /api/expenses/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const expense = await Expense.findById(id);
    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    // Verify user is a member of the expense's group
    const group = await Group.findOne({ _id: expense.groupId, "members.userId": userId });
    if (!group) return NextResponse.json({ error: "Group not found or unauthorized" }, { status: 403 });

    await expense.deleteOne();

    return NextResponse.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("DELETE /api/expenses/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

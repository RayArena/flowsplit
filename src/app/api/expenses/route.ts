import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import { pusherServer, getPusherChannel, PUSHER_EVENTS } from "@/lib/pusher";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const url = new URL(req.url);
    const groupId = url.searchParams.get("groupId");
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "20");

    const query: any = {};

    if (groupId) {
      // Verify user is a member of the group
      const group = await Group.findOne({ _id: groupId, "members.userId": userId });
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }
      query.groupId = groupId;
    } else {
      // Fetch all groups user is in
      const userGroups = await Group.find({ "members.userId": userId, isArchived: false }).lean();
      const userGroupIds = userGroups.map((g) => g._id);
      query.groupId = { $in: userGroupIds };
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Expense.countDocuments(query),
    ]);

    // Populate groupName for frontend display convenience
    const uniqueGroupIds = [...new Set(expenses.map((e) => String(e.groupId)))];
    const groupsList = await Group.find({ _id: { $in: uniqueGroupIds } }).lean();
    const groupNameMap = Object.fromEntries(groupsList.map((g) => [String(g._id), g.name]));

    const expensesWithGroupName = expenses.map((e) => ({
      ...e,
      groupName: groupNameMap[String(e.groupId)] || "Group",
    }));

    return NextResponse.json({
      data: expensesWithGroupName,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("GET /api/expenses", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await req.json();
    const {
      groupId,
      title,
      description,
      amount,
      currency,
      paidBy,
      paidByName,
      participants,
      splitType,
      receiptId,
      category,
    } = body;

    // Validate required fields
    if (!groupId || !title || !amount || !paidBy || !participants?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user is a group member
    const group = await Group.findOne({ _id: groupId, "members.userId": userId });
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const expense = await Expense.create({
      groupId,
      title: title.trim(),
      description: description?.trim(),
      amount: Number(amount),
      currency: currency ?? group.currency,
      paidBy,
      paidByName,
      participants,
      splitType: splitType ?? "equal",
      receiptId,
      category: category ?? "other",
    });

    // Trigger real-time update
    await pusherServer.trigger(
      getPusherChannel.group(groupId),
      PUSHER_EVENTS.EXPENSE_CREATED,
      {
        expense,
        triggeredBy: userId,
      }
    );

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

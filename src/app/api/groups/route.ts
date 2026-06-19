import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Group from "@/models/Group";
import User from "@/models/User";
import Expense from "@/models/Expense";
import Settlement from "@/models/Settlement";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const groups = await Group.find({
      "members.userId": userId,
      isArchived: false,
    }).sort({ updatedAt: -1 }).lean();

    if (groups.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const groupIds = groups.map((g) => g._id);

    // Fetch all expenses across user's groups in one query
    const expenses = await Expense.find({ groupId: { $in: groupIds } }).lean();

    // Fetch completed settlements across user's groups
    const settlements = await Settlement.find({
      groupId: { $in: groupIds },
      status: "completed",
    }).lean();

    // Compute per-group totals and user balance
    const groupExpenseMap: Record<string, number> = {};
    const groupBalanceMap: Record<string, number> = {};

    for (const g of groups) {
      const gid = String(g._id);
      groupExpenseMap[gid] = 0;
      groupBalanceMap[gid] = 0;
    }

    for (const e of expenses) {
      const gid = String(e.groupId);
      groupExpenseMap[gid] = (groupExpenseMap[gid] || 0) + e.amount;

      // If user paid, they're owed by others (positive balance contribution)
      if (e.paidBy === userId) {
        // User paid the full amount, but owes their own share
        const userShare = e.participants.find(
          (p: { userId: string }) => p.userId === userId
        );
        groupBalanceMap[gid] =
          (groupBalanceMap[gid] || 0) + e.amount - (userShare?.share || 0);
      } else {
        // User is a participant — they owe their share
        const userShare = e.participants.find(
          (p: { userId: string }) => p.userId === userId
        );
        if (userShare) {
          groupBalanceMap[gid] = (groupBalanceMap[gid] || 0) - userShare.share;
        }
      }
    }

    // Factor in completed settlements
    for (const s of settlements) {
      const gid = String(s.groupId);
      if (s.payer === userId) {
        // User paid settlement — reduces what they owe (increases balance)
        groupBalanceMap[gid] = (groupBalanceMap[gid] || 0) + s.amount;
      }
      if (s.receiver === userId) {
        // User received settlement — reduces what's owed to them (decreases balance)
        groupBalanceMap[gid] = (groupBalanceMap[gid] || 0) - s.amount;
      }
    }

    // Enrich groups with computed data
    const enrichedGroups = groups.map((g) => {
      const gid = String(g._id);
      return {
        ...g,
        totalExpenses: Math.round((groupExpenseMap[gid] || 0) * 100) / 100,
        myBalance: Math.round((groupBalanceMap[gid] || 0) * 100) / 100,
      };
    });

    return NextResponse.json({ data: enrichedGroups });
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
    const { name, description, currency = "INR", emoji } = body;

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

    // Re-fetch to get the auto-generated inviteCode from pre-save hook
    const created = await Group.findById(group._id).lean();

    return NextResponse.json({
      data: { ...created, totalExpenses: 0, myBalance: 0, emoji: emoji || "📁" },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/groups", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

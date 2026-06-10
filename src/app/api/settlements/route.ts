import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Settlement from "@/models/Settlement";
import Group from "@/models/Group";
import {
  generateOptimizationResult,
  calculateBalances,
} from "@/features/settlements/balanceEngine";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const url = new URL(req.url);
    const groupId = url.searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "groupId is required" }, { status: 400 });
    }

    const group = await Group.findOne({ _id: groupId, "members.userId": userId }).lean();
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const expenses = await Expense.find({ groupId }).lean();

    const members = group.members.map((m: { userId: string; name: string; avatar?: string }) => ({
      userId: m.userId,
      name: m.name,
      avatar: m.avatar,
    }));

    const parsedExpenses = expenses.map((e) => ({
      ...e,
      _id: String(e._id),
      groupId: String(e.groupId),
      receiptId: e.receiptId ? String(e.receiptId) : undefined,
      createdAt: String(e.createdAt),
      updatedAt: String(e.updatedAt),
      splitType: e.splitType as "equal" | "percentage" | "exact" | "shares",
      category: e.category as import("@/types").ExpenseCategory,
    }));

    const result = generateOptimizationResult(parsedExpenses, members);
    const currentBalances = calculateBalances(parsedExpenses, members);

    const balancesObj: Record<string, { net: number; paid: number; owed: number }> = {};
    for (const b of currentBalances) {
      balancesObj[b.userId] = {
        net: b.netBalance,
        paid: b.totalPaid,
        owed: b.totalOwed,
      };
    }

    // Also return recorded settlements
    const recorded = await Settlement.find({ groupId, status: "completed" }).lean();

    return NextResponse.json({
      data: {
        settlements: result.optimizedSettlements,
        balances: balancesObj,
        originalCount: result.originalCount,
        optimizedCount: result.optimizedCount,
        reduction: result.originalCount - result.optimizedCount,
        reductionPercentage: result.reductionPercentage,
        recordedSettlements: recorded,
      },
    });
  } catch (error) {
    console.error("GET /api/settlements", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await req.json();
    const { groupId, payer, payerName, receiver, receiverName, amount, currency } = body;

    if (!groupId || !payer || !receiver || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const group = await Group.findOne({ _id: groupId, "members.userId": userId });
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const settlement = await Settlement.create({
      groupId,
      payer,
      payerName,
      receiver,
      receiverName,
      amount: Number(amount),
      currency: currency ?? group.currency,
      status: "completed",
      settledAt: new Date(),
    });

    return NextResponse.json({ data: settlement }, { status: 201 });
  } catch (error) {
    console.error("POST /api/settlements", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

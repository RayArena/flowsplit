import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import Settlement from "@/models/Settlement";
import {
  calculateBalances,
  simulateSettlement,
  optimizeSettlements,
} from "@/features/settlements/balanceEngine";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await req.json();
    const { groupId, payerId, receiverId, amount } = body;

    if (!groupId || !payerId || !receiverId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const group = await Group.findOne({ _id: groupId, "members.userId": userId }).lean();
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });

    const expenses = await Expense.find({ groupId }).lean();
    const completedSettlements = await Settlement.find({
      groupId,
      status: "completed",
    }).lean();

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

    const parsedSettlements = completedSettlements.map((s) => ({
      payer: s.payer,
      receiver: s.receiver,
      amount: s.amount,
      status: s.status,
    }));

    const currentBalances = calculateBalances(parsedExpenses, members, parsedSettlements);

    const { projectedBalances, projectedSettlements } = simulateSettlement(
      currentBalances,
      payerId,
      receiverId,
      Number(amount)
    );

    const currentSettlements = optimizeSettlements(currentBalances);

    return NextResponse.json({
      data: {
        current: {
          balances: currentBalances,
          settlements: currentSettlements,
          count: currentSettlements.length,
        },
        projected: {
          balances: projectedBalances,
          settlements: projectedSettlements,
          count: projectedSettlements.length,
        },
        reduction: currentSettlements.length - projectedSettlements.length,
      },
    });
  } catch (error) {
    console.error("POST /api/settlements/simulate", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

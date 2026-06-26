import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import Settlement from "@/models/Settlement";
import { calculateBalances, optimizeSettlements } from "@/features/settlements/balanceEngine";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Get all groups the user belongs to
    const groups = await Group.find({ "members.userId": userId, isArchived: false }).lean();

    if (groups.length === 0) {
      return NextResponse.json({
        data: {
          settlements: [],
          totalOwed: 0,
          totalReceivable: 0,
          groupCount: 0,
        },
      });
    }

    const groupIds = groups.map((g) => g._id);
    const expenses = await Expense.find({ groupId: { $in: groupIds } }).lean();
    const completedSettlements = await Settlement.find({
      groupId: { $in: groupIds },
      status: "completed",
    }).lean();

    // Build a combined per-person balance map across all groups
    const globalNetMap: Record<string, { name: string; net: number }> = {};

    for (const g of groups) {
      const gid = String(g._id);
      const groupExpenses = expenses.filter((e) => String(e.groupId) === gid);
      const groupSettlements = completedSettlements.filter((s) => String(s.groupId) === gid);
      const groupMembers = (g.members || []).map((m: any) => ({
        userId: m.userId,
        name: m.name,
        avatar: m.avatar,
      }));
      const parsedExpenses = groupExpenses.map((e) => ({
        ...e,
        _id: String(e._id),
        groupId: String(e.groupId),
        receiptId: e.receiptId ? String(e.receiptId) : undefined,
        createdAt: String(e.createdAt),
        updatedAt: String(e.updatedAt),
        splitType: e.splitType as "equal" | "percentage" | "exact" | "shares",
        category: e.category as import("@/types").ExpenseCategory,
      }));
      const parsedSettlements = groupSettlements.map((s) => ({
        payer: s.payer,
        receiver: s.receiver,
        amount: s.amount,
        status: s.status,
      }));

      const balances = calculateBalances(parsedExpenses, groupMembers, parsedSettlements);
      for (const b of balances) {
        if (!globalNetMap[b.userId]) {
          globalNetMap[b.userId] = { name: b.name, net: 0 };
        }
        globalNetMap[b.userId].net = Math.round(
          (globalNetMap[b.userId].net + b.netBalance) * 100
        ) / 100;
      }
    }

    // Build UserBalance array for optimizeSettlements
    const globalBalances = Object.entries(globalNetMap).map(([uid, info]) => ({
      userId: uid,
      name: info.name,
      avatar: undefined,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: info.net,
    }));

    const optimized = optimizeSettlements(globalBalances);

    // Compute totals for the current user
    const myGlobal = globalNetMap[userId];
    const totalReceivable = myGlobal && myGlobal.net > 0 ? myGlobal.net : 0;
    const totalOwed = myGlobal && myGlobal.net < 0 ? Math.abs(myGlobal.net) : 0;

    return NextResponse.json({
      data: {
        settlements: optimized,
        balances: globalNetMap,
        totalOwed: Math.round(totalOwed * 100) / 100,
        totalReceivable: Math.round(totalReceivable * 100) / 100,
        groupCount: groups.length,
      },
    });
  } catch (error) {
    console.error("GET /api/settlements/global", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

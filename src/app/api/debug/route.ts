import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import Settlement from "@/models/Settlement";
import { generateOptimizationResult } from "@/features/settlements/balanceEngine";

export async function GET() {
  try {
    await connectDB();
    
    // Pick any user who has groups
    const sampleGroup = await Group.findOne().lean();
    if (!sampleGroup) return NextResponse.json({ error: "No groups found" });
    
    const userId = sampleGroup.members[0].userId;

    // Run the dashboard logic
    const groups = await Group.find({ "members.userId": userId, isArchived: false }).lean();
    const groupIds = groups.map((g) => g._id);
    const expenses = await Expense.find({ groupId: { $in: groupIds } }).lean();
    
    let totalOwed = 0;
    let totalReceivable = 0;

    for (const expense of expenses) {
      if (expense.paidBy === userId) {
        for (const p of expense.participants || []) {
          if (p.userId !== userId) totalReceivable += p.share;
        }
      } else {
        const userParticipant = (expense.participants || []).find((p: any) => p.userId === userId);
        if (userParticipant) totalOwed += userParticipant.share;
      }
    }

    const settlements = await Settlement.find({
      groupId: { $in: groupIds },
      status: "completed",
    }).lean();

    const suggestedSettlements: any[] = [];
    let totalOptimizedPaymentsCount = 0;

    for (const g of groups) {
      const groupExpenses = expenses.filter((e) => String(e.groupId) === String(g._id));
      const groupSettlements = settlements.filter((s) => String(s.groupId) === String(g._id));
      const groupMembers = g.members.map((m: any) => ({
        userId: m.userId,
        name: m.name,
        avatar: m.avatar,
      }));

      const parsedGroupSettlements = groupSettlements.map((s) => ({
        payer: s.payer,
        receiver: s.receiver,
        amount: s.amount,
        status: s.status,
      }));

      const optResult = generateOptimizationResult(
        groupExpenses.map((e) => ({
          ...e,
          _id: String(e._id),
          groupId: String(e.groupId),
          receiptId: e.receiptId ? String(e.receiptId) : undefined,
          createdAt: String(e.createdAt),
          updatedAt: String(e.updatedAt),
          splitType: e.splitType as "equal" | "percentage" | "exact" | "shares",
          category: e.category as import("@/types").ExpenseCategory,
        })),
        groupMembers,
        parsedGroupSettlements
      );

      totalOptimizedPaymentsCount += optResult.optimizedCount;
    }

    return NextResponse.json({ success: true, userId, totalOptimizedPaymentsCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack });
  }
}

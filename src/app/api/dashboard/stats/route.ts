import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import Settlement from "@/models/Settlement";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Get all groups the user belongs to
    const groups = await Group.find({ "members.userId": userId, isArchived: false }).lean();
    const groupIds = groups.map((g) => g._id);

    // Get all expenses across groups
    const expenses = await Expense.find({ groupId: { $in: groupIds } }).lean();

    // Calculate total spending (paid by user)
    const totalSpending = expenses
      .filter((e) => e.paidBy === userId)
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate owed / receivable
    let totalOwed = 0;       // user owes others
    let totalReceivable = 0; // others owe user

    for (const expense of expenses) {
      if (expense.paidBy === userId) {
        // User paid, others owe user
        for (const p of expense.participants) {
          if (p.userId !== userId) {
            totalReceivable += p.share;
          }
        }
      } else {
        // User is a participant, owes payer
        const userParticipant = expense.participants.find((p: { userId: string }) => p.userId === userId);
        if (userParticipant) {
          totalOwed += userParticipant.share;
        }
      }
    }

    // Subtract settled amounts
    const settlements = await Settlement.find({
      groupId: { $in: groupIds },
      status: "completed",
    }).lean();

    for (const s of settlements) {
      if (s.payer === userId) totalOwed -= s.amount;
      if (s.receiver === userId) totalReceivable -= s.amount;
    }

    // Spending trend (last 7 months)
    const now = new Date();
    const spendingTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthExpenses = expenses.filter((e) => {
        const expDate = new Date(e.createdAt);
        return (
          expDate.getFullYear() === d.getFullYear() &&
          expDate.getMonth() === d.getMonth()
        );
      });
      spendingTrend.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        amount: monthExpenses.reduce((s, e) => s + e.amount, 0),
      });
    }

    return NextResponse.json({
      data: {
        totalSpending,
        activeGroups: groups.length,
        totalOwed: Math.max(0, totalOwed),
        totalReceivable: Math.max(0, totalReceivable),
        netBalance: totalReceivable - totalOwed,
        spendingTrend,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

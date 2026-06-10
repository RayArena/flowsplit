import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";
import Settlement from "@/models/Settlement";
import { generateOptimizationResult } from "@/features/settlements/balanceEngine";

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

    // Category Distribution calculation
    const categorySum: Record<string, number> = {};
    let totalAllExpenses = 0;
    for (const e of expenses) {
      const cat = e.category || "other";
      categorySum[cat] = (categorySum[cat] || 0) + e.amount;
      totalAllExpenses += e.amount;
    }

    const categoryColorMap: Record<string, string> = {
      food: "#f97316",
      transport: "#3b82f6",
      accommodation: "#8b5cf6",
      entertainment: "#ec4899",
      utilities: "#fbbf24",
      shopping: "#a855f7",
      health: "#10b981",
      other: "#64748b",
    };

    const categoryNameMap: Record<string, string> = {
      food: "Food & Drinks",
      transport: "Transport",
      accommodation: "Accommodation",
      entertainment: "Entertainment",
      utilities: "Utilities",
      shopping: "Shopping",
      health: "Health",
      other: "Other",
    };

    const categoryDistribution = Object.keys(categoryNameMap).map((cat) => {
      const amount = categorySum[cat] || 0;
      const pct = totalAllExpenses > 0 ? Math.round((amount / totalAllExpenses) * 100) : 0;
      return {
        name: categoryNameMap[cat],
        value: pct,
        color: categoryColorMap[cat] || "#64748b",
      };
    }).filter(c => c.value > 0);

    if (categoryDistribution.length === 0) {
      categoryDistribution.push({ name: "Other", value: 100, color: "#64748b" });
    }

    // Recent Activity calculation (expenses + settlements combined)
    const recentActivity = [];
    const groupMap = Object.fromEntries(groups.map((g) => [String(g._id), g.name]));

    const categoryEmojiMap: Record<string, string> = {
      food: "🍕",
      transport: "🚗",
      accommodation: "🏠",
      entertainment: "🎬",
      utilities: "💡",
      shopping: "🛍️",
      health: "❤️",
      other: "📁",
    };

    for (const e of expenses) {
      recentActivity.push({
        id: String(e._id),
        icon: categoryEmojiMap[e.category] || "📁",
        description: `${e.paidBy === userId ? "You" : e.paidByName} added ${e.title}`,
        group: groupMap[String(e.groupId)] || "Group",
        amount: e.amount,
        time: String(e.createdAt),
        type: "expense" as const,
      });
    }

    for (const s of settlements) {
      recentActivity.push({
        id: String(s._id),
        icon: "✅",
        description: `${s.payer === userId ? "You" : s.payerName} paid ${s.receiver === userId ? "you" : s.receiverName}`,
        group: groupMap[String(s.groupId)] || "Group",
        amount: s.amount,
        time: String(s.settledAt || s.createdAt),
        type: "settlement" as const,
      });
    }

    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const finalRecentActivity = recentActivity.slice(0, 5);

    // Suggested / Smart Settlements (current user's debts/receivables optimized)
    const suggestedSettlements: Array<{ from: string; to: string; amount: number; groupName: string }> = [];
    let totalOptimizedPaymentsCount = 0;
    let totalRawTransactionsCount = 0;

    for (const g of groups) {
      const groupExpenses = expenses.filter((e) => String(e.groupId) === String(g._id));
      const groupMembers = g.members.map((m: any) => ({
        userId: m.userId,
        name: m.name,
        avatar: m.avatar,
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
        groupMembers
      );

      totalOptimizedPaymentsCount += optResult.optimizedCount;
      totalRawTransactionsCount += optResult.originalCount;

      for (const s of optResult.optimizedSettlements) {
        if (s.payer === userId || s.receiver === userId) {
          suggestedSettlements.push({
            from: s.payer === userId ? "You" : s.payerName,
            to: s.receiver === userId ? "You" : s.receiverName,
            amount: s.amount,
            groupName: g.name,
          });
        }
      }
    }

    return NextResponse.json({
      data: {
        totalSpending,
        activeGroups: groups.length,
        totalOwed: Math.max(0, totalOwed),
        totalReceivable: Math.max(0, totalReceivable),
        netBalance: totalReceivable - totalOwed,
        spendingTrend,
        categoryDistribution,
        recentActivity: finalRecentActivity,
        suggestedSettlements: suggestedSettlements.slice(0, 3),
        totalOptimizedPaymentsCount,
        totalRawTransactionsCount,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Group from "@/models/Group";

export async function GET(_req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // const url = new URL(req.url);
    // const range = url.searchParams.get("range") || "last_3_months";
    // Range filtering can be implemented later if needed

    // Get user's groups
    const groups = await Group.find({ "members.userId": userId, isArchived: false }).lean();
    const groupIds = groups.map((g) => g._id);

    if (groupIds.length === 0) {
      return NextResponse.json({
        data: {
          spendingTrend: [],
          categoryDistribution: [],
          memberContributions: [],
          yearComparison: [],
          topMetrics: {
            totalSpent: 0,
            avgMonthly: 0,
            biggestExpense: 0,
            biggestExpenseTitle: "N/A",
            activeGroups: 0,
          },
        },
      });
    }

    // Get all expenses
    const allExpenses = await Expense.find({ groupId: { $in: groupIds } }).lean();

    const now = new Date();

    // ------- SPENDING TREND (last 7 months, personal vs group) -------
    const spendingTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthExpenses = allExpenses.filter((e) => {
        const ed = new Date(e.createdAt);
        return ed >= d && ed < nextMonth;
      });

      // Personal = what user paid
      const personal = monthExpenses
        .filter((e) => e.paidBy === userId)
        .reduce((sum, e) => sum + e.amount, 0);

      // Group = total of all expenses that month
      const group = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      spendingTrend.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        personal: Math.round(personal * 100) / 100,
        group: Math.round(group * 100) / 100,
      });
    }

    // ------- CATEGORY DISTRIBUTION -------
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

    const catSum: Record<string, number> = {};
    let totalExpenseAmount = 0;
    for (const e of allExpenses) {
      const cat = e.category || "other";
      catSum[cat] = (catSum[cat] || 0) + e.amount;
      totalExpenseAmount += e.amount;
    }

    const categoryDistribution = Object.entries(catSum)
      .map(([cat, amount]) => ({
        name: categoryNameMap[cat] || cat,
        value: totalExpenseAmount > 0 ? Math.round((amount / totalExpenseAmount) * 100) : 0,
        color: categoryColorMap[cat] || "#64748b",
        amount: Math.round(amount * 100) / 100,
      }))
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);

    // ------- MEMBER CONTRIBUTIONS -------
    // Aggregate across all groups: how much each member paid vs how much they owe
    const memberPaid: Record<string, { name: string; paid: number; owed: number }> = {};

    for (const g of groups) {
      for (const m of g.members) {
        const key = m.userId as string;
        if (!memberPaid[key]) {
          memberPaid[key] = { name: m.name as string, paid: 0, owed: 0 };
        }
      }
    }

    for (const e of allExpenses) {
      if (memberPaid[e.paidBy]) {
        memberPaid[e.paidBy].paid += e.amount;
      }
      for (const p of e.participants) {
        if (memberPaid[p.userId]) {
          memberPaid[p.userId].owed += p.share;
        }
      }
    }

    const memberContributions = Object.values(memberPaid)
      .map((m) => ({
        name: m.name,
        paid: Math.round(m.paid * 100) / 100,
        owed: Math.round(m.owed * 100) / 100,
      }))
      .sort((a, b) => b.paid - a.paid)
      .slice(0, 10);

    // ------- YEAR-OVER-YEAR COMPARISON -------
    const yearComparison = [];
    const thisYear = now.getFullYear();
    for (let month = 0; month < 7; month++) {
      const d = new Date(thisYear, month, 1);
      const nextMonth = new Date(thisYear, month + 1, 1);
      const lastYearStart = new Date(thisYear - 1, month, 1);
      const lastYearEnd = new Date(thisYear - 1, month + 1, 1);

      const thisYearAmount = allExpenses
        .filter((e) => {
          const ed = new Date(e.createdAt);
          return ed >= d && ed < nextMonth;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const lastYearAmount = allExpenses
        .filter((e) => {
          const ed = new Date(e.createdAt);
          return ed >= lastYearStart && ed < lastYearEnd;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      yearComparison.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        thisYear: Math.round(thisYearAmount * 100) / 100,
        lastYear: Math.round(lastYearAmount * 100) / 100,
      });
    }

    // ------- TOP METRICS -------
    const totalSpent = totalExpenseAmount;
    const monthsWithExpenses = new Set(
      allExpenses.map((e) => {
        const d = new Date(e.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
    ).size;
    const avgMonthly = monthsWithExpenses > 0 ? totalSpent / monthsWithExpenses : 0;

    let biggestExpense = 0;
    let biggestExpenseTitle = "N/A";
    for (const e of allExpenses) {
      if (e.amount > biggestExpense) {
        biggestExpense = e.amount;
        biggestExpenseTitle = e.title;
      }
    }

    // Count groups with expenses this month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthGroups = new Set(
      allExpenses
        .filter((e) => new Date(e.createdAt) >= thisMonthStart)
        .map((e) => String(e.groupId))
    ).size;

    return NextResponse.json({
      data: {
        spendingTrend,
        categoryDistribution,
        memberContributions,
        yearComparison,
        topMetrics: {
          totalSpent: Math.round(totalSpent * 100) / 100,
          avgMonthly: Math.round(avgMonthly * 100) / 100,
          biggestExpense: Math.round(biggestExpense * 100) / 100,
          biggestExpenseTitle,
          activeGroups: groups.length,
          newGroupsThisMonth: thisMonthGroups,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/analytics", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

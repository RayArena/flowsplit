import { Expense, UserBalance, DebtEdge, OptimizedSettlement, OptimizationResult } from "@/types";

// minimum cash flow algorithm to simplify debts

interface SettlementRecord {
  payer: string;
  receiver: string;
  amount: number;
  status: string;
}

/**
 * Calculate net balances for each user in a group.
 * Optionally factors in completed settlements so that
 * "Mark Paid" actually reduces balances.
 */
export function calculateBalances(
  expenses: Expense[],
  members: Array<{ userId: string; name: string; avatar?: string }>,
  completedSettlements: SettlementRecord[] = []
): UserBalance[] {
  const balanceMap: Record<string, { paid: number; owed: number }> = {};

  // Initialize all members
  for (const member of members) {
    balanceMap[member.userId] = { paid: 0, owed: 0 };
  }

  // Process each expense
  for (const expense of expenses) {
    // Credit the payer
    if (balanceMap[expense.paidBy]) {
      balanceMap[expense.paidBy].paid += expense.amount;
    }

    // Debit each participant their share
    for (const participant of expense.participants || []) {
      if (balanceMap[participant.userId]) {
        balanceMap[participant.userId].owed += participant.share;
      }
    }
  }

  // Factor in completed settlements:
  // When payer sends money to receiver, it's like:
  //   - payer has paid more (increase their "paid")
  //   - receiver has owed more (increase their "owed")
  // This effectively adjusts net balances: payer.net += amount, receiver.net -= amount
  for (const settlement of completedSettlements) {
    if (settlement.status !== "completed") continue;
    if (balanceMap[settlement.payer]) {
      balanceMap[settlement.payer].paid += settlement.amount;
    }
    if (balanceMap[settlement.receiver]) {
      balanceMap[settlement.receiver].owed += settlement.amount;
    }
  }

  return members.map((member) => {
    const b = balanceMap[member.userId] ?? { paid: 0, owed: 0 };
    const rawNet = Math.round((b.paid - b.owed) * 100) / 100;
    // Apply near-zero threshold: treat anything within ±0.005 as exactly 0
    const netBalance = Math.abs(rawNet) < 0.005 ? 0 : rawNet;
    return {
      userId: member.userId,
      name: member.name,
      avatar: member.avatar,
      totalPaid: Math.round(b.paid * 100) / 100,
      totalOwed: Math.round(b.owed * 100) / 100,
      netBalance,
    };
  });
}

// build raw debt graph before optimization

export function buildDebtGraph(
  expenses: Expense[],
  members: Array<{ userId: string; name: string }>
): DebtEdge[] {
  const memberMap = Object.fromEntries(members.map((m) => [m.userId, m.name]));
  const edges: DebtEdge[] = [];

  for (const expense of expenses) {
    for (const participant of expense.participants || []) {
      if (participant.userId === expense.paidBy) continue;
      if (participant.share <= 0) continue;

      edges.push({
        from: participant.userId,
        fromName: memberMap[participant.userId] ?? participant.name,
        to: expense.paidBy,
        toName: memberMap[expense.paidBy] ?? expense.paidByName,
        amount: participant.share,
      });
    }
  }

  // Consolidate duplicate edges (same from→to pair)
  const edgeMap: Record<string, DebtEdge> = {};
  for (const edge of edges) {
    const key = `${edge.from}→${edge.to}`;
    if (edgeMap[key]) {
      edgeMap[key].amount += edge.amount;
    } else {
      edgeMap[key] = { ...edge };
    }
  }

  return Object.values(edgeMap);
}

// greedy settlement optimizer that matches max creditor with max debtor

export function optimizeSettlements(balances: UserBalance[]): OptimizedSettlement[] {
  const EPSILON = 0.01; // ignore rounding dust

  // Build mutable net-balance list
  const net = balances.map((b) => ({
    userId: b.userId,
    name: b.name,
    amount: Math.round(b.netBalance * 100) / 100,
  }));

  const settlements: OptimizedSettlement[] = [];

  // Min-Cash-Flow: iteratively match max creditor with max debtor
  // Using array re-sort approach (equivalent to heap for small N)
  while (true) {
    // Find max creditor and max debtor
    let maxCreditor = { userId: "", name: "", amount: 0 };
    let maxDebtor = { userId: "", name: "", amount: 0 };

    for (const n of net) {
      if (n.amount > maxCreditor.amount + EPSILON) {
        maxCreditor = n;
      }
      if (n.amount < maxDebtor.amount - EPSILON) {
        maxDebtor = n;
      }
    }

    // If no significant creditor or debtor remains, we're done
    if (maxCreditor.amount < EPSILON || Math.abs(maxDebtor.amount) < EPSILON) {
      break;
    }

    // Settle the minimum of the two
    const settleAmount = Math.min(maxCreditor.amount, Math.abs(maxDebtor.amount));

    if (settleAmount > EPSILON) {
      settlements.push({
        payer: maxDebtor.userId,
        payerName: maxDebtor.name,
        receiver: maxCreditor.userId,
        receiverName: maxCreditor.name,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    // Update balances — one of them becomes zero
    maxCreditor.amount = Math.round((maxCreditor.amount - settleAmount) * 100) / 100;
    maxDebtor.amount = Math.round((maxDebtor.amount + settleAmount) * 100) / 100;
  }

  return settlements;
}

// helper to generate the final settlement plan

export function generateOptimizationResult(
  expenses: Expense[],
  members: Array<{ userId: string; name: string; avatar?: string }>,
  completedSettlements: SettlementRecord[] = []
): OptimizationResult {
  const balances = calculateBalances(expenses, members, completedSettlements);
  const rawEdges = buildDebtGraph(expenses, members);
  const optimized = optimizeSettlements(balances);

  const reductionPercentage =
    rawEdges.length > 0
      ? Math.round(((rawEdges.length - optimized.length) / rawEdges.length) * 100)
      : 0;

  return {
    originalTransactions: rawEdges,
    optimizedSettlements: optimized,
    originalCount: rawEdges.length,
    optimizedCount: optimized.length,
    reductionPercentage,
  };
}

// simulate what happens if a user pays a debt

export function simulateSettlement(
  currentBalances: UserBalance[],
  payerId: string,
  receiverId: string,
  amount: number
): {
  projectedBalances: UserBalance[];
  projectedSettlements: OptimizedSettlement[];
} {
  const projectedBalances = currentBalances.map((b) => {
    if (b.userId === payerId) {
      return { ...b, netBalance: Math.round((b.netBalance + amount) * 100) / 100 };
    }
    if (b.userId === receiverId) {
      return { ...b, netBalance: Math.round((b.netBalance - amount) * 100) / 100 };
    }
    return b;
  });

  const projectedSettlements = optimizeSettlements(projectedBalances);

  return { projectedBalances, projectedSettlements };
}

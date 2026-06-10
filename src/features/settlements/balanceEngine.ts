import { Expense, UserBalance, DebtEdge, OptimizedSettlement, OptimizationResult } from "@/types";

// ============================================================
// Balance Engine
// Calculates net balances for each user in a group
// ============================================================

export function calculateBalances(
  expenses: Expense[],
  members: Array<{ userId: string; name: string; avatar?: string }>
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
    for (const participant of expense.participants) {
      if (balanceMap[participant.userId]) {
        balanceMap[participant.userId].owed += participant.share;
      }
    }
  }

  return members.map((member) => {
    const b = balanceMap[member.userId] ?? { paid: 0, owed: 0 };
    return {
      userId: member.userId,
      name: member.name,
      avatar: member.avatar,
      totalPaid: b.paid,
      totalOwed: b.owed,
      netBalance: b.paid - b.owed, // positive = owed money, negative = owes money
    };
  });
}

// ============================================================
// Debt Graph
// Generates a directed weighted graph from raw balances
// (before optimization)
// ============================================================

export function buildDebtGraph(
  expenses: Expense[],
  members: Array<{ userId: string; name: string }>
): DebtEdge[] {
  const memberMap = Object.fromEntries(members.map((m) => [m.userId, m.name]));
  const edges: DebtEdge[] = [];

  for (const expense of expenses) {
    for (const participant of expense.participants) {
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

// ============================================================
// Settlement Optimizer
// Greedy algorithm to minimize the number of transactions
// Time complexity: O(n log n) per iteration
//
// Algorithm:
// 1. Compute net balance for each person
// 2. Separate into creditors (net > 0) and debtors (net < 0)
// 3. Greedy: match largest debtor with largest creditor
// 4. Result: at most (n-1) transactions for n people
// ============================================================

export function optimizeSettlements(balances: UserBalance[]): OptimizedSettlement[] {
  const EPSILON = 0.01; // ignore rounding dust

  const net = balances.map((b) => ({
    userId: b.userId,
    name: b.name,
    amount: b.netBalance,
  }));

  const creditors = net.filter((n) => n.amount > EPSILON).sort((a, b) => b.amount - a.amount);
  const debtors = net.filter((n) => n.amount < -EPSILON).sort((a, b) => a.amount - b.amount);

  const settlements: OptimizedSettlement[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    const settleAmount = Math.min(creditor.amount, Math.abs(debtor.amount));

    if (settleAmount > EPSILON) {
      settlements.push({
        payer: debtor.userId,
        payerName: debtor.name,
        receiver: creditor.userId,
        receiverName: creditor.name,
        amount: Math.round(settleAmount * 100) / 100,
      });
    }

    creditor.amount -= settleAmount;
    debtor.amount += settleAmount;

    if (creditor.amount < EPSILON) ci++;
    if (Math.abs(debtor.amount) < EPSILON) di++;
  }

  return settlements;
}

// ============================================================
// Generate full optimization result with metadata
// ============================================================

export function generateOptimizationResult(
  expenses: Expense[],
  members: Array<{ userId: string; name: string; avatar?: string }>
): OptimizationResult {
  const balances = calculateBalances(expenses, members);
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

// ============================================================
// Smart Settlement Simulator
// Projects what happens if a specific settlement is made
// ============================================================

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
      return { ...b, netBalance: b.netBalance + amount };
    }
    if (b.userId === receiverId) {
      return { ...b, netBalance: b.netBalance - amount };
    }
    return b;
  });

  const projectedSettlements = optimizeSettlements(projectedBalances);

  return { projectedBalances, projectedSettlements };
}

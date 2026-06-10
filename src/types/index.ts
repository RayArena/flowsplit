// ============================================================
// FlowSplit — Central TypeScript Types
// ============================================================

export interface User {
  _id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "member";
  joinedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  createdBy: string;
  currency: string;
  avatar?: string;
  emoji?: string;
  isArchived: boolean;
  totalExpenses: number;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export type SplitType = "equal" | "percentage" | "exact" | "shares";

export type ExpenseCategory =
  | "food"
  | "transport"
  | "accommodation"
  | "entertainment"
  | "utilities"
  | "shopping"
  | "health"
  | "other";

export interface ParticipantSplit {
  userId: string;
  name: string;
  share: number;       // actual amount owed
  percentage?: number; // for percentage split
  units?: number;      // for shares split
}

export interface Expense {
  _id: string;
  groupId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidBy: string; // userId
  paidByName: string;
  participants: ParticipantSplit[];
  splitType: SplitType;
  receiptId?: string;
  category: ExpenseCategory;
  createdAt: string;
  updatedAt: string;
}

export type SettlementStatus = "pending" | "completed";

export interface Settlement {
  _id: string;
  groupId: string;
  payer: string;    // userId
  payerName: string;
  receiver: string; // userId
  receiverName: string;
  amount: number;
  currency: string;
  status: SettlementStatus;
  settledAt?: string;
  createdAt: string;
}

export interface ExtractedReceiptData {
  vendor?: string;
  date?: string;
  amount?: number;
  items?: Array<{ name: string; price: number }>;
  rawText: string;
}

export interface Receipt {
  _id: string;
  imageUrl: string;
  publicId?: string;
  extractedData: ExtractedReceiptData;
  createdAt: string;
}

// ============================================================
// Balance Engine Types
// ============================================================

export interface UserBalance {
  userId: string;
  name: string;
  avatar?: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // positive = owed money, negative = owes money
}

export interface DebtEdge {
  from: string;      // userId who owes
  fromName: string;
  to: string;        // userId who is owed
  toName: string;
  amount: number;
}

export interface OptimizedSettlement {
  payer: string;
  payerName: string;
  receiver: string;
  receiverName: string;
  amount: number;
}

export interface OptimizationResult {
  originalTransactions: DebtEdge[];
  optimizedSettlements: OptimizedSettlement[];
  originalCount: number;
  optimizedCount: number;
  reductionPercentage: number;
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardStats {
  totalSpending: number;
  activeGroups: number;
  totalOwed: number;        // money I owe others
  totalReceivable: number;  // money others owe me
  netBalance: number;
}

export interface SpendingTrendPoint {
  month: string;
  amount: number;
}

export interface CategorySpending {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface RecentActivity {
  id: string;
  type: "expense_created" | "expense_deleted" | "settlement_created" | "member_joined";
  description: string;
  groupName: string;
  amount?: number;
  currency?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================
// Form Types
// ============================================================

export interface CreateGroupForm {
  name: string;
  description?: string;
  currency: string;
}

export interface CreateExpenseForm {
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidBy: string;
  participants: string[];
  splitType: SplitType;
  splits?: Record<string, number>; // userId -> amount/percentage/shares
  category: ExpenseCategory;
  receiptId?: string;
}

export interface SimulateSettlementInput {
  groupId: string;
  payerId: string;
  receiverId: string;
  amount: number;
}

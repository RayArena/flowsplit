import mongoose, { Schema, Document, Model } from "mongoose";

interface IParticipantSplit {
  userId: string;
  name: string;
  share: number;
  percentage?: number;
  units?: number;
}

export interface IExpense extends Document {
  groupId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidBy: string;
  paidByName: string;
  participants: IParticipantSplit[];
  splitType: "equal" | "percentage" | "exact" | "shares";
  receiptId?: mongoose.Types.ObjectId;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipantSplit>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    share: { type: Number, required: true, min: 0 },
    percentage: { type: Number },
    units: { type: Number },
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpense>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    paidBy: { type: String, required: true },
    paidByName: { type: String, required: true },
    participants: [ParticipantSchema],
    splitType: {
      type: String,
      enum: ["equal", "percentage", "exact", "shares"],
      default: "equal",
    },
    receiptId: { type: Schema.Types.ObjectId, ref: "Receipt" },
    category: { type: String, default: "other" },
  },
  { timestamps: true }
);

ExpenseSchema.index({ groupId: 1, createdAt: -1 });
ExpenseSchema.index({ paidBy: 1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettlement extends Document {
  groupId: mongoose.Types.ObjectId;
  payer: string;
  payerName: string;
  receiver: string;
  receiverName: string;
  amount: number;
  currency: string;
  status: "pending" | "completed";
  settledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SettlementSchema = new Schema<ISettlement>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    payer: { type: String, required: true },
    payerName: { type: String, required: true },
    receiver: { type: String, required: true },
    receiverName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    settledAt: { type: Date },
  },
  { timestamps: true }
);

SettlementSchema.index({ groupId: 1, status: 1 });
SettlementSchema.index({ payer: 1 });
SettlementSchema.index({ receiver: 1 });

const Settlement: Model<ISettlement> =
  mongoose.models.Settlement ||
  mongoose.model<ISettlement>("Settlement", SettlementSchema);

export default Settlement;

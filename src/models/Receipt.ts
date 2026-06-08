import mongoose, { Schema, Document, Model } from "mongoose";
import { ExtractedReceiptData } from "@/types";

export interface IReceipt extends Document {
  imageUrl: string;
  publicId?: string;
  extractedData: ExtractedReceiptData;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String },
    extractedData: {
      vendor: { type: String },
      date: { type: String },
      amount: { type: Number },
      items: [
        {
          name: { type: String },
          price: { type: Number },
          _id: false,
        },
      ],
      rawText: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const Receipt: Model<IReceipt> =
  mongoose.models.Receipt || mongoose.model<IReceipt>("Receipt", ReceiptSchema);

export default Receipt;

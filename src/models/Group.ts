import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

interface IGroupMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "member";
  joinedAt: Date;
}

export interface IGroup extends Document {
  name: string;
  description?: string;
  members: IGroupMember[];
  createdBy: string;
  currency: string;
  avatar?: string;
  inviteCode: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMember>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString("hex"); // 8-char hex code
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    members: [GroupMemberSchema],
    createdBy: { type: String, required: true, index: true },
    currency: { type: String, default: "INR" },
    avatar: { type: String },
    inviteCode: { type: String, unique: true, sparse: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate invite code before saving if not present
GroupSchema.pre("save", async function () {
  if (!this.inviteCode) {
    this.inviteCode = generateInviteCode();
  }
});

GroupSchema.index({ "members.userId": 1 });
GroupSchema.index({ inviteCode: 1 });

const Group: Model<IGroup> =
  mongoose.models.Group || mongoose.model<IGroup>("Group", GroupSchema);

export default Group;

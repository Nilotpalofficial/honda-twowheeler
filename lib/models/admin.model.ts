import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  role: "admin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Admin =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

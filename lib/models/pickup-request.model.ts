import mongoose, { Schema, Document } from "mongoose";

export interface IPickupRequest extends Omit<Document, "model"> {
  name: string;
  phone: string;
  address: string;
  model: string;
  registrationNumber: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const PickupRequestSchema = new Schema<IPickupRequest>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    preferredDate: {
      type: String,
      default: "",
    },
    preferredTime: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "picked-up", "delivered", "cancelled"],
    },
  },
  { timestamps: true }
);

export const PickupRequest =
  mongoose.models.PickupRequest ||
  mongoose.model<IPickupRequest>("PickupRequest", PickupRequestSchema);

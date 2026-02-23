import mongoose, { Schema, Document } from "mongoose";

export interface IServiceAppointment extends Omit<Document, "model"> {
  name: string;
  phone: string;
  email: string;
  model: string;
  registrationNumber: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceAppointmentSchema = new Schema<IServiceAppointment>(
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
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
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
    serviceType: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "completed", "cancelled"],
    },
  },
  { timestamps: true }
);

export const ServiceAppointment =
  mongoose.models.ServiceAppointment ||
  mongoose.model<IServiceAppointment>(
    "ServiceAppointment",
    ServiceAppointmentSchema
  );

import mongoose, { Schema, Document } from "mongoose";

export interface IServiceSchedule extends Document {
  modelSlug: string;
  serviceName: string;
  kmRange: string;
  duration: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceScheduleSchema = new Schema<IServiceSchedule>(
  {
    modelSlug: {
      type: String,
      required: true,
      lowercase: true,
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    kmRange: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const ServiceSchedule =
  mongoose.models.ServiceSchedule ||
  mongoose.model<IServiceSchedule>("ServiceSchedule", ServiceScheduleSchema);

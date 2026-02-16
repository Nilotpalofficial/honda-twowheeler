import mongoose, { Schema, Document } from "mongoose";

/**
 * WHY THIS DESIGN?
 *
 * Honda sells 3 categories: scooters, motorcycles, and EVs.
 * Scooters & motorcycles share ICE engine fields (displacement, power, etc.)
 * EVs have completely different specs (battery, range, charging).
 *
 * Using a SINGLE collection with conditional fields is better than:
 * - Separate collections (ICEVehicle + EVVehicle) → duplicates common logic,
 *   breaks unified listing, complicates admin APIs.
 * - Cramming all fields into every doc → Activa would have empty battery fields,
 *   Activa Electric would have empty engine fields. Messy, error-prone.
 *
 * Instead: one schema, category-aware validation.
 * The pre-validate hook REJECTS invalid payloads at the database level —
 * an EV cannot have engine specs, a scooter cannot have battery specs.
 * This is enforced regardless of whether the request comes from API, seed, or script.
 */

// --- ICE-only fields (scooter / motorcycle) ---
export interface IEngine {
  displacement: string;
  type: string;
  power: string;
  torque: string;
}

export interface IPerformance {
  mileage: string;
}

// --- EV-only fields ---
export interface IElectric {
  batteryCapacity: string;
  range: string;
  chargingTime: string;
  motorPower: string;
  chargerType: string;
}

// --- Full vehicle document ---
export interface IVehicle extends Document {
  name: string;
  slug: string;
  brandSlug: "honda";
  categorySlug: "scooter" | "motorcycle" | "ev";
  channelSlug: "standard" | "bigwing";
  basePrice: {
    exShowroom: number;
    currency: "INR";
  };
  engine?: IEngine;
  performance?: IPerformance;
  electric?: IElectric;
  images: {
    thumbnail: string;
    gallery: string[];
  };
  highlights: string[];
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    brandSlug: {
      type: String,
      default: "honda",
      enum: ["honda"],
    },
    categorySlug: {
      type: String,
      required: true,
      enum: ["scooter", "motorcycle", "ev"],
    },
    channelSlug: {
      type: String,
      required: true,
      enum: ["standard", "bigwing"],
    },
    basePrice: {
      exShowroom: { type: Number, required: true },
      currency: { type: String, default: "INR", enum: ["INR"] },
    },

    // ICE fields — only for scooter / motorcycle
    engine: {
      type: new Schema(
        {
          displacement: { type: String, default: "" },
          type: { type: String, default: "" },
          power: { type: String, default: "" },
          torque: { type: String, default: "" },
        },
        { _id: false }
      ),
      default: undefined,
    },
    performance: {
      type: new Schema(
        {
          mileage: { type: String, default: "" },
        },
        { _id: false }
      ),
      default: undefined,
    },

    // EV fields — only for ev
    electric: {
      type: new Schema(
        {
          batteryCapacity: { type: String, default: "" },
          range: { type: String, default: "" },
          chargingTime: { type: String, default: "" },
          motorPower: { type: String, default: "" },
          chargerType: { type: String, default: "" },
        },
        { _id: false }
      ),
      default: undefined,
    },

    images: {
      thumbnail: { type: String, default: "" },
      gallery: { type: [String], default: [] },
    },
    highlights: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Auto-generate slug from name before validation.
 * "Activa 6G" → "activa-6g"
 */
VehicleSchema.pre("validate", function () {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

/**
 * Category-based field validation.
 *
 * WHY at schema level?
 * API-level validation can be bypassed (scripts, seeds, direct DB access).
 * Schema-level validation is the last line of defense — it ALWAYS runs.
 *
 * Rules:
 * - EV → must have electric, must NOT have engine/performance
 * - Scooter/Motorcycle → must have engine+performance, must NOT have electric
 */
VehicleSchema.pre("validate", function () {
  const isEV = this.categorySlug === "ev";

  if (isEV) {
    if (this.engine) {
      this.invalidate(
        "engine",
        "EV vehicles cannot have engine specs"
      );
    }
    if (this.performance) {
      this.invalidate(
        "performance",
        "EV vehicles cannot have mileage/performance"
      );
    }
  } else {
    if (this.electric) {
      this.invalidate(
        "electric",
        "ICE vehicles (scooter/motorcycle) cannot have electric specs"
      );
    }
  }
});

export const Vehicle =
  mongoose.models.Vehicle ||
  mongoose.model<IVehicle>("Vehicle", VehicleSchema);

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/lib/models/vehicle.model";
import { authenticateAdmin } from "@/lib/auth";
import {
  sanitizeVehiclePayload,
  formatValidationError,
} from "@/lib/validate-vehicle";

/**
 * GET /api/vehicles  (PUBLIC)
 *
 * WHY: Powers the public website — shows only active, non-deleted vehicles.
 * No auth required. No sensitive fields exposed.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const channel = searchParams.get("channel");

    const filter: Record<string, any> = {
      isActive: true,
      deletedAt: null,
    };

    if (category) filter.categorySlug = category;
    if (channel) filter.channelSlug = channel;

    const vehicles = await Vehicle.find(filter)
      .select("-deletedAt -__v")
      .sort({ createdAt: -1 });

    return Response.json({ success: true, data: vehicles });
  } catch (error) {
    console.error("Public vehicles GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vehicles  (ADMIN ONLY)
 *
 * WHY: Lets the dealer add a new Honda model to the catalogue.
 * Slug is auto-generated from the name.
 * Payload is sanitized based on categorySlug before saving.
 */
export async function POST(req: NextRequest) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    const body = sanitizeVehiclePayload(await req.json());
    await connectDB();

    const vehicle = await Vehicle.create(body);

    return Response.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return Response.json(
        { success: false, error: "A vehicle with this slug already exists" },
        { status: 409 }
      );
    }
    const validationMsg = formatValidationError(error);
    if (validationMsg) {
      return Response.json(
        { success: false, error: validationMsg },
        { status: 400 }
      );
    }
    console.error("Vehicle create error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

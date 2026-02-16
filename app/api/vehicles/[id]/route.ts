import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/lib/models/vehicle.model";
import { authenticateAdmin } from "@/lib/auth";
import {
  sanitizeVehiclePayload,
  formatValidationError,
} from "@/lib/validate-vehicle";

/**
 * PATCH /api/vehicles/[id]  (ADMIN ONLY)
 *
 * WHY: Dealer needs to update vehicle details —
 * price changes, new images, spec corrections, etc.
 * Payload is sanitized based on categorySlug.
 *
 * If admin changes categorySlug (e.g. scooter → ev),
 * old category fields are automatically cleared.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    const { id } = await params;
    const body = sanitizeVehiclePayload(await req.json());
    await connectDB();

    // If category is changing, clear fields from the old category
    if (body.categorySlug) {
      if (body.categorySlug === "ev") {
        body.engine = undefined;
        body.performance = undefined;
      } else {
        body.electric = undefined;
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return Response.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: vehicle });
  } catch (error: any) {
    const validationMsg = formatValidationError(error);
    if (validationMsg) {
      return Response.json(
        { success: false, error: validationMsg },
        { status: 400 }
      );
    }
    console.error("Vehicle update error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vehicles/[id]  (ADMIN ONLY)
 *
 * WHY: Soft delete only — sets deletedAt timestamp.
 * Vehicle is preserved in DB for records but hidden from public.
 * Hard delete is NEVER allowed (core rule).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    const { id } = await params;
    await connectDB();

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { deletedAt: new Date(), isActive: false },
      { new: true }
    );

    if (!vehicle) {
      return Response.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Vehicle soft-deleted",
      data: vehicle,
    });
  } catch (error) {
    console.error("Vehicle delete error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

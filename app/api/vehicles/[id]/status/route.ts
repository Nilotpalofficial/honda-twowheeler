import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/lib/models/vehicle.model";
import { authenticateAdmin } from "@/lib/auth";

/**
 * PATCH /api/vehicles/[id]/status  (ADMIN ONLY)
 *
 * WHY: Toggle vehicle visibility on the public website
 * without deleting it. Useful for seasonal models,
 * out-of-stock vehicles, or upcoming launches.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    const { id } = await params;
    const { isActive } = await req.json();

    if (typeof isActive !== "boolean") {
      return Response.json(
        { success: false, error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    await connectDB();

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { isActive },
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
      message: `Vehicle ${isActive ? "activated" : "deactivated"}`,
      data: vehicle,
    });
  } catch (error) {
    console.error("Vehicle status error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/lib/models/vehicle.model";
import { authenticateAdmin } from "@/lib/auth";

/**
 * GET /api/vehicles/admin  (ADMIN ONLY)
 *
 * WHY: Admin needs to see ALL vehicles — active, inactive, and soft-deleted —
 * to manage the full catalogue. Public API hides these.
 */
export async function GET(req: NextRequest) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    await connectDB();

    const vehicles = await Vehicle.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    return Response.json({ success: true, data: vehicles });
  } catch (error) {
    console.error("Admin vehicles GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

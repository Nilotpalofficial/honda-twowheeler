import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ServiceAppointment } from "@/lib/models/service-appointment.model";
import { PickupRequest } from "@/lib/models/pickup-request.model";
import { authenticateAdmin } from "@/lib/auth";

/**
 * GET /api/admin/dashboard  (ADMIN ONLY)
 *
 * Returns aggregate stats for the admin dashboard.
 * All counts run in parallel for performance.
 */
export async function GET(req: NextRequest) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    await connectDB();

    const [
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      totalPickupRequests,
      pendingPickupRequests,
    ] = await Promise.all([
      ServiceAppointment.countDocuments(),
      ServiceAppointment.countDocuments({ status: "pending" }),
      ServiceAppointment.countDocuments({ status: "completed" }),
      PickupRequest.countDocuments(),
      PickupRequest.countDocuments({ status: "pending" }),
    ]);

    return Response.json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalPickupRequests,
        pendingPickupRequests,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

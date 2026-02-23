import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ServiceAppointment } from "@/lib/models/service-appointment.model";
import { authenticateAdmin } from "@/lib/auth";

/**
 * GET /api/admin/service-appointments  (ADMIN ONLY)
 *
 * Returns all service appointments, sorted newest first.
 */
export async function GET(req: NextRequest) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    await connectDB();

    const appointments = await ServiceAppointment.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    return Response.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Admin appointments GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

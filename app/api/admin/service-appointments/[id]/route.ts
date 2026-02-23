import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ServiceAppointment } from "@/lib/models/service-appointment.model";
import { authenticateAdmin } from "@/lib/auth";

const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

/**
 * GET /api/admin/service-appointments/[id]  (ADMIN ONLY)
 *
 * Returns a single service appointment by ID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return Response.json(
        { success: false, error: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const appointment = await ServiceAppointment.findById(id).select("-__v");

    if (!appointment) {
      return Response.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Admin appointment GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/service-appointments/[id]  (ADMIN ONLY)
 *
 * Updates the status of a service appointment.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return Response.json(
        { success: false, error: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return Response.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const appointment = await ServiceAppointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!appointment) {
      return Response.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: appointment });
  } catch (error) {
    console.error("Admin appointment PATCH error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/service-appointments/[id]  (ADMIN ONLY)
 *
 * Hard-deletes a service appointment.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return Response.json(
        { success: false, error: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const appointment = await ServiceAppointment.findByIdAndDelete(id);

    if (!appointment) {
      return Response.json(
        { success: false, error: "Appointment not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Appointment deleted",
    });
  } catch (error) {
    console.error("Admin appointment DELETE error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

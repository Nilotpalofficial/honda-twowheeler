import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { PickupRequest } from "@/lib/models/pickup-request.model";
import { authenticateAdmin } from "@/lib/auth";

const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

/**
 * GET /api/admin/pickup-requests/[id]  (ADMIN ONLY)
 *
 * Returns a single pickup request by ID.
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
        { success: false, error: "Invalid pickup request ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const pickupRequest = await PickupRequest.findById(id).select("-__v");

    if (!pickupRequest) {
      return Response.json(
        { success: false, error: "Pickup request not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: pickupRequest });
  } catch (error) {
    console.error("Admin pickup request GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/pickup-requests/[id]  (ADMIN ONLY)
 *
 * Updates the status of a pickup request.
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
        { success: false, error: "Invalid pickup request ID" },
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

    const pickupRequest = await PickupRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!pickupRequest) {
      return Response.json(
        { success: false, error: "Pickup request not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: pickupRequest });
  } catch (error) {
    console.error("Admin pickup request PATCH error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pickup-requests/[id]  (ADMIN ONLY)
 *
 * Hard-deletes a pickup request.
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
        { success: false, error: "Invalid pickup request ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const pickupRequest = await PickupRequest.findByIdAndDelete(id);

    if (!pickupRequest) {
      return Response.json(
        { success: false, error: "Pickup request not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Pickup request deleted",
    });
  } catch (error) {
    console.error("Admin pickup request DELETE error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

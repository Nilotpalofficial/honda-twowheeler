import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { PickupRequest } from "@/lib/models/pickup-request.model";
import { authenticateAdmin } from "@/lib/auth";

/**
 * GET /api/admin/pickup-requests  (ADMIN ONLY)
 *
 * Returns all pickup & drop requests, sorted newest first.
 */
export async function GET(req: NextRequest) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    await connectDB();

    const requests = await PickupRequest.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    return Response.json({ success: true, data: requests });
  } catch (error) {
    console.error("Admin pickup requests GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

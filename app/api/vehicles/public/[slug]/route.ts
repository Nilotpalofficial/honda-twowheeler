import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/lib/models/vehicle.model";

/**
 * GET /api/vehicles/public/[slug]  (PUBLIC)
 *
 * WHY: Returns a single vehicle by slug for the public detail page.
 * Only returns active, non-deleted vehicles.
 * Slug-based URLs are SEO-friendly (e.g., /vehicles/public/activa-6g).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const vehicle = await Vehicle.findOne({
      slug,
      isActive: true,
      deletedAt: null,
    }).select("-deletedAt -__v");

    if (!vehicle) {
      return Response.json(
        { success: false, error: "Vehicle not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: vehicle });
  } catch (error) {
    console.error("Public vehicle GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

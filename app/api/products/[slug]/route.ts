import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/lib/models/vehicle.model";

/**
 * GET /api/products/[slug]  (PUBLIC)
 *
 * Returns a single active vehicle by slug.
 * Reads from the existing vehicles collection.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const product = await Vehicle.findOne({
      slug,
      isActive: true,
      deletedAt: null,
    }).select("-deletedAt -__v");

    if (!product) {
      return Response.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: product });
  } catch (error) {
    console.error("Product GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

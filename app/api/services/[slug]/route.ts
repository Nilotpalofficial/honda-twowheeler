import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models/service.model";

/**
 * GET /api/services/[slug]  (PUBLIC)
 *
 * Returns a single service by slug. Only returns active services.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const service = await Service.findOne({
      slug,
      isActive: true,
    }).select("-__v");

    if (!service) {
      return Response.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: service });
  } catch (error) {
    console.error("Service GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

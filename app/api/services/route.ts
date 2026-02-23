import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/lib/models/service.model";

/**
 * GET /api/services  (PUBLIC)
 *
 * Returns all active services.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const services = await Service.find({ isActive: true })
      .select("-__v")
      .sort({ createdAt: -1 });

    return Response.json({ success: true, data: services });
  } catch (error) {
    console.error("Services GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

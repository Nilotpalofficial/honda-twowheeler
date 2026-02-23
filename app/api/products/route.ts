import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Vehicle } from "@/lib/models/vehicle.model";

const VALID_CATEGORIES = ["scooter", "motorcycle", "ev"] as const;
type Category = (typeof VALID_CATEGORIES)[number];

function isValidCategory(value: string): value is Category {
  return (VALID_CATEGORIES as readonly string[]).includes(value);
}

/**
 * GET /api/products?category=scooter|motorcycle|ev  (PUBLIC)
 *
 * Returns active, non-deleted vehicles filtered by categorySlug.
 * Reads from the existing vehicles collection — no separate data store.
 *
 * Query params:
 *   category (required) — one of: scooter, motorcycle, ev
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (!category) {
      return Response.json(
        {
          success: false,
          error: `Missing required query param: category. Valid values: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!isValidCategory(category)) {
      return Response.json(
        {
          success: false,
          error: `Invalid category "${category}". Valid values: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const products = await Vehicle.find({
      categorySlug: category,
      isActive: true,
      deletedAt: null,
    })
      .select("-deletedAt -__v")
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      category,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

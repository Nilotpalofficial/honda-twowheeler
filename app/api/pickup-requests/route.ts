import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { PickupRequest } from "@/lib/models/pickup-request.model";
import { authenticateAdmin } from "@/lib/auth";
import { formatValidationError } from "@/lib/validate-vehicle";

/**
 * GET /api/pickup-requests  (ADMIN ONLY)
 *
 * Returns all pickup requests.
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
    console.error("Pickup requests GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pickup-requests  (PUBLIC)
 *
 * Creates a new pickup request.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const requiredFields = [
      "name",
      "phone",
      "address",
      "model",
      "registrationNumber",
    ];
    const missing = requiredFields.some((field) => !body[field]);
    if (missing) {
      return Response.json(
        {
          success: false,
          error:
            "Missing required fields: name, phone, address, model, registrationNumber",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const pickupRequest = await PickupRequest.create(body);

    return Response.json(
      { success: true, data: pickupRequest },
      { status: 201 }
    );
  } catch (error: any) {
    const validationMsg = formatValidationError(error);
    if (validationMsg) {
      return Response.json(
        { success: false, error: validationMsg },
        { status: 400 }
      );
    }
    console.error("Pickup request create error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

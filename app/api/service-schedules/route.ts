import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ServiceSchedule } from "@/lib/models/service-schedule.model";
import { authenticateAdmin } from "@/lib/auth";
import { formatValidationError } from "@/lib/validate-vehicle";

/**
 * GET /api/service-schedules  (PUBLIC)
 *
 * Returns service schedules. Optionally filter by modelSlug query param.
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const modelSlug = searchParams.get("modelSlug");

    const filter: Record<string, any> = {};
    if (modelSlug) filter.modelSlug = modelSlug;

    const schedules = await ServiceSchedule.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 });

    return Response.json({ success: true, data: schedules });
  } catch (error) {
    console.error("Service schedules GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/service-schedules  (ADMIN ONLY)
 *
 * Creates a new service schedule.
 */
export async function POST(req: NextRequest) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    const body = await req.json();

    const requiredFields = [
      "modelSlug",
      "serviceName",
      "kmRange",
      "duration",
    ];
    const missing = requiredFields.some((field) => !body[field]);
    if (missing) {
      return Response.json(
        {
          success: false,
          error:
            "Missing required fields: modelSlug, serviceName, kmRange, duration",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const schedule = await ServiceSchedule.create(body);

    return Response.json(
      { success: true, data: schedule },
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
    console.error("Service schedule create error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

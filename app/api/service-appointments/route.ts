import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ServiceAppointment } from "@/lib/models/service-appointment.model";
import { authenticateAdmin } from "@/lib/auth";
import { formatValidationError } from "@/lib/validate-vehicle";

/**
 * GET /api/service-appointments  (ADMIN ONLY)
 *
 * Returns all service appointments.
 */
export async function GET(req: NextRequest) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    await connectDB();

    const appointments = await ServiceAppointment.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    return Response.json({ success: true, data: appointments });
  } catch (error) {
    console.error("Service appointments GET error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/service-appointments  (PUBLIC)
 *
 * Creates a new service appointment.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const requiredFields = [
      "name",
      "phone",
      "model",
      "registrationNumber",
      "date",
      "time",
    ];
    const missing = requiredFields.some((field) => !body[field]);
    if (missing) {
      return Response.json(
        {
          success: false,
          error:
            "Missing required fields: name, phone, model, registrationNumber, date, time",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const appointment = await ServiceAppointment.create(body);

    return Response.json(
      { success: true, data: appointment },
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
    console.error("Service appointment create error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

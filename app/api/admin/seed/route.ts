import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/admin.model";

/**
 * POST /api/admin/seed
 *
 * WHY: Creates the first admin account.
 * Only works if zero admins exist in the database —
 * prevents misuse in production.
 *
 * Remove or disable this route after initial setup.
 */
export async function POST() {
  try {
    await connectDB();

    const existing = await Admin.countDocuments();
    if (existing > 0) {
      return Response.json(
        { success: false, error: "Admin already exists. Seed blocked." },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash("admin123", 12);

    const admin = await Admin.create({
      email: "admin@nilhonda.com",
      passwordHash,
      role: "admin",
    });

    return Response.json({
      success: true,
      message: "Admin created. Change the password immediately.",
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

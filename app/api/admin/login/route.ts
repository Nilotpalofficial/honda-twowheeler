import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/admin.model";
import { signToken } from "@/lib/auth";

/**
 * POST /api/admin/login
 *
 * WHY: The only way to authenticate. No signup exists —
 * admin accounts are created via seed script.
 * Returns a JWT for subsequent admin API calls.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return Response.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      return Response.json(
        { success: false, error: "Account is deactivated" },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return Response.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken(admin._id.toString());

    return Response.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

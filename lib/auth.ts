import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Admin, IAdmin } from "@/lib/models/admin.model";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(adminId: string) {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { adminId: string };
}

/**
 * Auth guard for admin API routes.
 * Returns the admin document if valid, or a Response (error) if not.
 */
export async function authenticateAdmin(
  req: NextRequest
): Promise<IAdmin | Response> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return Response.json(
      { success: false, error: "No token provided" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];

  let payload: { adminId: string };
  try {
    payload = verifyToken(token);
  } catch {
    return Response.json(
      { success: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  await connectDB();
  const admin = await Admin.findById(payload.adminId).select("-passwordHash");

  if (!admin) {
    return Response.json(
      { success: false, error: "Admin not found" },
      { status: 401 }
    );
  }

  if (!admin.isActive) {
    return Response.json(
      { success: false, error: "Admin account is deactivated" },
      { status: 403 }
    );
  }

  return admin;
}

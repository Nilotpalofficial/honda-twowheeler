import { NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "vehicle-images";

/**
 * POST /api/upload  (ADMIN ONLY)
 *
 * Accepts multipart form data with image file(s).
 * Uploads to Supabase Storage and returns public URLs.
 *
 * Form fields:
 *   file — single image file
 *   folder — optional subfolder (e.g. "activa-6g")
 *
 * Returns: { success: true, url: "https://..." }
 */
export async function POST(req: NextRequest) {
  const adminOrError = await authenticateAdmin(req);
  if (adminOrError instanceof Response) return adminOrError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return Response.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { success: false, error: "Only JPEG, PNG, WebP, and AVIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { success: false, error: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return Response.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(fileName);

    return Response.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return Response.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { sb, user } = await requireRole(["editor"]);
    const body = await request.json();

    const { bucket, path, mime, size_bytes, alt, title, caption } = body;
    if (!path || !mime || !size_bytes) {
      return NextResponse.json({ error: "Missing required file attributes" }, { status: 400 });
    }

    const adminSb = supabaseAdmin();
    const { error } = await adminSb.from("media_assets").insert({
      bucket: bucket || "media",
      path,
      mime,
      size_bytes,
      alt: alt || null,
      title: title || null,
      caption: caption || null,
      uploaded_by: user.id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await adminSb.from("audit_logs").insert({
      actor: user.id,
      action: "media.upload",
      entity: "media_assets",
      entity_id: path,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

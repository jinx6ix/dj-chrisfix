"use server";
import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const mediaUploadSchema = z.object({
  bucket: z.string().min(1).default("media"),
  path: z.string().min(1),
  mime: z.string().min(1),
  size_bytes: z.coerce.number().positive(),
  alt: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
});

export async function createMediaAsset(fd: FormData) {
  const { user } = await requireRole(["editor"]);
  const sb = supabaseAdmin();

  const p = mediaUploadSchema.safeParse({
    bucket: fd.get("bucket") || "media",
    path: fd.get("path"),
    mime: fd.get("mime"),
    size_bytes: fd.get("size_bytes"),
    alt: fd.get("alt"),
    title: fd.get("title"),
    caption: fd.get("caption"),
  });

  if (!p.success) {
    redirect("/dashboard/media?error=invalid");
  }

  const { error } = await sb.from("media_assets").insert({
    ...p.data,
    uploaded_by: user.id,
  });

  if (error) {
    redirect("/dashboard/media?error=save");
  }

  await sb.from("audit_logs").insert({
    actor: user.id,
    action: "media.upload",
    entity: "media_assets",
    entity_id: p.data.path,
  });

  revalidatePath("/dashboard/media");
  redirect("/dashboard/media?ok=1");
}

export async function deleteMediaAsset(fd: FormData) {
  const { user } = await requireRole(["editor"]);
  const sb = supabaseAdmin();
  const id = z.string().uuid().parse(fd.get("id"));

  const { error } = await sb.from("media_assets").delete().eq("id", id);
  if (error) {
    redirect("/dashboard/media?error=save");
  }

  await sb.from("audit_logs").insert({
    actor: user.id,
    action: "media.delete",
    entity: "media_assets",
    entity_id: id,
  });

  revalidatePath("/dashboard/media");
  redirect("/dashboard/media?ok=1");
}

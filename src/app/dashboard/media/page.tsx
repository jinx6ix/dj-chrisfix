import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import MediaLibraryClient from "./client";

export const metadata = { title: "Media Library" };
export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  await requireRole(["editor"]);
  const sb = supabaseAdmin();

  const { data: assets } = await sb
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return <MediaLibraryClient initialAssets={assets || []} />;
}

import { requireRole } from "@/lib/auth";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { Video, Plus, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const metadata = { title: "Manage Videos" };
export const dynamic = "force-dynamic";

const videoSchema = z.object({
  title: z.string().trim().min(2).max(160),
  youtube_id: z.string().trim().min(5).max(30),
  category: z.string().trim().min(2).max(50),
  featured: z.boolean(),
});

async function createVideo(fd: FormData) {
  "use server";
  const { sb } = await requireRole(["editor"]);
  const p = videoSchema.safeParse({
    title: fd.get("title"),
    youtube_id: fd.get("youtube_id"),
    category: fd.get("category"),
    featured: fd.get("featured") === "on",
  });
  if (!p.success) redirect("/dashboard/videos?error=invalid");
  const { error } = await sb.from("videos").insert(p.data);
  if (error) redirect("/dashboard/videos?error=save");
  revalidatePath("/videos");
  revalidatePath("/dashboard/videos");
  redirect("/dashboard/videos?ok=1");
}

async function deleteVideo(fd: FormData) {
  "use server";
  const { sb } = await requireRole(["editor"]);
  const id = z.string().uuid().parse(fd.get("id"));
  await sb.from("videos").delete().eq("id", id);
  revalidatePath("/videos");
  revalidatePath("/dashboard/videos");
  redirect("/dashboard/videos?ok=1");
}

export default async function VideosDashboard({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { sb } = await requireRole(["editor"]);
  const sp = await searchParams;
  const { data: videos } = await sb.from("videos").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="glass p-8 space-y-2">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Video} variant="violet" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-violet-400">Video Content</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Videos</h1>
        <p className="text-muted text-sm">
          Add and manage YouTube set recordings, live streams, and teaser videos.
        </p>
      </div>

      {sp.ok && <p className="glass p-3 text-sm text-emerald-300">Video updated successfully.</p>}
      {sp.error && <p className="text-red-300 text-sm">Error saving video. Check inputs.</p>}

      <form action={createVideo} className="glass grid gap-4 p-6 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-muted">Video Title *</span>
          <input name="title" required placeholder="Boiler Room London Set" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">YouTube ID or URL *</span>
          <input name="youtube_id" required placeholder="dQw4w9WgXcQ" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Category *</span>
          <input name="category" required defaultValue="Live Set" className="field" />
        </label>
        <label className="flex items-center gap-2 text-sm pt-6">
          <input type="checkbox" name="featured" /> Feature on homepage
        </label>
        <div className="sm:col-span-2">
          <button className="btn">Add Video</button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">Existing Videos</h3>
        {videos?.map((v) => (
          <GlassCard key={v.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{v.title}</p>
              <p className="text-xs text-muted">Category: {v.category} · YouTube ID: {v.youtube_id} {v.featured && "· Featured"}</p>
            </div>
            <form action={deleteVideo}>
              <input type="hidden" name="id" value={v.id} />
              <button className="btn btn-ghost text-xs py-1 text-red-400 hover:text-red-300">Delete</button>
            </form>
          </GlassCard>
        ))}
        {!videos?.length && <p className="text-muted text-sm">No videos added yet.</p>}
      </div>
    </div>
  );
}

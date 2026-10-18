import { requireRole } from "@/lib/auth";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { Image as ImageIcon, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ImagePicker } from "@/components/image-picker";

export const metadata = { title: "Manage Gallery" };
export const dynamic = "force-dynamic";

const gallerySchema = z.object({
  title: z.string().trim().min(2).max(120),
  image_url: z.string().url(),
  category: z.string().trim().min(2).max(50),
});

async function addPhoto(fd: FormData) {
  "use server";
  const { sb } = await requireRole(["editor"]);
  const p = gallerySchema.safeParse({
    title: fd.get("title"),
    image_url: fd.get("image_url"),
    category: fd.get("category"),
  });
  if (!p.success) redirect("/dashboard/gallery?error=invalid");
  const { error } = await sb.from("gallery").insert(p.data);
  if (error) redirect("/dashboard/gallery?error=save");
  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
  redirect("/dashboard/gallery?ok=1");
}

async function deletePhoto(fd: FormData) {
  "use server";
  const { sb } = await requireRole(["editor"]);
  const id = z.string().uuid().parse(fd.get("id"));
  await sb.from("gallery").delete().eq("id", id);
  revalidatePath("/gallery");
  revalidatePath("/dashboard/gallery");
  redirect("/dashboard/gallery?ok=1");
}

export default async function GalleryDashboard({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { sb } = await requireRole(["editor"]);
  const sp = await searchParams;
  const { data: photos } = await sb.from("gallery").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-8 min-w-0 overflow-hidden">
      <div className="glass p-8 space-y-2">
        <div className="flex items-center gap-3">
          <GlassIcon icon={ImageIcon} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Photo Gallery</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Gallery</h1>
        <p className="text-muted text-sm">
          Upload and organize press shots, festival moments, and studio photos.
        </p>
      </div>

      {sp.ok && <p className="glass p-3 text-sm text-emerald-300">Gallery updated successfully.</p>}
      {sp.error && <p className="text-red-300 text-sm">Error saving photo. Check URL and inputs.</p>}

      <form action={addPhoto} className="glass grid gap-4 p-6 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-muted">Photo Title *</span>
          <input name="title" required placeholder="Backstage at Fabric" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Category *</span>
          <input name="category" required defaultValue="Live" className="field" />
        </label>
        <div className="sm:col-span-2">
          <ImagePicker name="image_url" label="Gallery Image File or URL" aspectRatio="video" />
        </div>
        <div className="sm:col-span-2">
          <button className="btn">Add Photo</button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos?.map((p) => (
          <GlassCard key={p.id} className="p-4 space-y-3 flex flex-col justify-between min-w-0">
            <div className="space-y-3 min-w-0">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-white/5 border border-white/10">
                <img src={p.image_url} alt={p.title} className="object-cover w-full h-full" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate" title={p.title}>{p.title}</p>
                <p className="text-xs text-muted truncate">{p.category}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-muted">Photo</span>
              <form action={deletePhoto}>
                <input type="hidden" name="id" value={p.id} />
                <button className="btn btn-ghost text-xs py-1 text-red-400 hover:text-red-300 whitespace-nowrap">Delete</button>
              </form>
            </div>
          </GlassCard>
        ))}
        {!photos?.length && <p className="text-muted text-sm sm:col-span-3">No photos uploaded yet.</p>}
      </div>
    </div>
  );
}

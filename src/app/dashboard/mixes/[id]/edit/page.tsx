import { requireRole } from "@/lib/auth";
import { updateMix } from "../../../actions";
import Link from "next/link";
import { ImagePicker } from "@/components/image-picker";

export const metadata = { title: "Edit Mix" };
export const dynamic = "force-dynamic";

export default async function EditMixPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { sb } = await requireRole(["editor"]);
  const { id } = await params;
  const sp = await searchParams;

  const { data: mix, error } = await sb.from("mixes").select("*").eq("id", id).single();
  if (error || !mix) {
    return <div className="p-8 text-red-300">Mix not found.</div>;
  }

  return (
    <div className="space-y-8 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold truncate">Edit Mix: {mix.title}</h1>
        <Link href="/dashboard/mixes" className="btn btn-ghost text-xs shrink-0">← Back to Mixes</Link>
      </div>

      {sp.error && <p role="alert" className="text-red-300 text-sm">Error saving mix. Check form fields and slug uniqueness.</p>}

      <form action={updateMix} className="glass grid gap-4 p-6 sm:grid-cols-2">
        <input type="hidden" name="id" value={mix.id} />
        <label className="text-sm">
          <span className="mb-1 block text-muted">Title *</span>
          <input name="title" required defaultValue={mix.title} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Slug * (a-z, numbers, dashes)</span>
          <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={mix.slug} className="field" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Audio URL (SoundCloud / Mixcloud / YouTube https://)</span>
          <input name="audio_url" type="url" defaultValue={mix.audio_url || ""} className="field" />
        </label>
        <div className="sm:col-span-2">
          <ImagePicker name="cover_url" defaultValue={mix.cover_url || ""} label="Mix Cover Artwork" aspectRatio="video" />
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Release Date</span>
          <input name="release_date" type="date" defaultValue={mix.release_date || ""} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Status</span>
          <select name="status" defaultValue={mix.status} className="field">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Description</span>
          <textarea name="description" rows={4} defaultValue={mix.description || ""} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">SEO Title</span>
          <input name="seo_title" defaultValue={mix.seo_title || ""} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">SEO Description</span>
          <input name="seo_description" defaultValue={mix.seo_description || ""} className="field" />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2 pt-2 cursor-pointer">
          <input type="checkbox" name="featured" defaultChecked={mix.featured} /> Feature on homepage
        </label>
        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button className="btn">Save Changes</button>
          <Link href="/dashboard/mixes" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

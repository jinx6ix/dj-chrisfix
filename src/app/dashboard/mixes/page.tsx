import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createMix, setMixStatus, deleteMix } from "../actions";
import { ImagePicker } from "@/components/image-picker";

export const metadata = { title: "Mixes" };
export const dynamic = "force-dynamic";

const MSG: Record<string, string> = {
  invalid: "Check the form fields (links must start with https://).",
  slug: "That slug is already used.",
  save: "Could not save the change.",
};

function Act({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setMixStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="btn btn-ghost text-xs py-1 whitespace-nowrap">{label}</button>
    </form>
  );
}

export default async function MixesAdmin({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { sb } = await requireRole(["editor"]);
  const sp = await searchParams;
  const { data: mixes } = await sb.from("mixes").select("id,slug,title,status,featured,release_date,cover_url").order("created_at", { ascending: false }).limit(100);

  return (
    <div className="space-y-8 min-w-0 overflow-hidden">
      <div className="glass p-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Mixes</h1>
        <p className="text-muted text-sm">Create, edit, publish, archive, and manage DJ mix sets, artwork, and audio sources.</p>
      </div>

      {sp.ok && <p role="status" className="glass p-3 text-sm text-emerald-300">Mix saved successfully.</p>}
      {sp.error && <p role="alert" className="text-red-300 text-sm">{MSG[sp.error] ?? "Error saving mix."}</p>}

      <form action={createMix} className="glass grid gap-4 p-6 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-muted">Title *</span>
          <input name="title" required placeholder="Club Residency Vol. 1" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Slug * (a-z, numbers, dashes)</span>
          <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="club-residency-vol-1" className="field" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Audio URL (SoundCloud / Mixcloud / YouTube https://)</span>
          <input name="audio_url" type="url" placeholder="https://soundcloud.com/..." className="field" />
        </label>
        <div className="sm:col-span-2">
          <ImagePicker name="cover_url" label="Mix Cover Artwork" aspectRatio="video" />
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Release Date</span>
          <input name="release_date" type="date" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Status</span>
          <select name="status" className="field">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Description</span>
          <textarea name="description" rows={3} placeholder="Deep house and techno journey..." className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">SEO Title</span>
          <input name="seo_title" placeholder="DJ Mix | DJ ChrisFix" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">SEO Description</span>
          <input name="seo_description" placeholder="Listen to the latest mix set..." className="field" />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2 pt-2 cursor-pointer">
          <input type="checkbox" name="featured" /> Feature on homepage
        </label>
        <div className="sm:col-span-2">
          <button className="btn">Create Mix</button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">Existing Mixes</h3>
        {mixes?.map((m) => (
          <div key={m.id} className="glass flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4 min-w-0">
              {m.cover_url ? (
                <div className="w-14 h-14 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/10">
                  <img src={m.cover_url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-muted shrink-0">No art</div>
              )}
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium text-sm truncate">{m.title} <span className="text-xs font-mono text-muted">({m.slug})</span></p>
                <p className="text-xs text-muted truncate">Status: <span className="uppercase text-amber-400 font-semibold">{m.status}</span> {m.featured && "· Featured"} {m.release_date && `· Released ${m.release_date}`}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
              {m.status === "published" && <Link href={`/mixes/${m.slug}`} className="btn btn-ghost text-xs py-1 whitespace-nowrap">View</Link>}
              <Link href={`/dashboard/mixes/${m.id}/edit`} className="btn btn-ghost text-xs py-1 whitespace-nowrap">Edit</Link>
              {m.status !== "published" ? <Act id={m.id} status="published" label="Publish" /> : <Act id={m.id} status="draft" label="Unpublish" />}
              {m.status !== "archived" && <Act id={m.id} status="archived" label="Archive" />}
              <form action={deleteMix}>
                <input type="hidden" name="id" value={m.id} />
                <button className="btn btn-ghost text-xs py-1 text-red-400 hover:text-red-300 whitespace-nowrap">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {!mixes?.length && <p className="text-muted text-sm">No mixes created yet.</p>}
      </div>
    </div>
  );
}

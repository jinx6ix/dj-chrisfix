import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { saveSettings } from "../actions";

export const metadata = { title: "Artist profile" };
export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  await requireRole(["editor"]);
  const sp = await searchParams;
  const s = await getSettings();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Artist profile</h1>
      {sp.ok && <p role="status" className="glass p-3 text-sm">Saved.</p>}
      {sp.error && <p role="alert" className="text-red-300">Check the fields and try again.</p>}
      <form action={saveSettings} className="glass grid gap-4 p-5">
        <label className="text-sm"><span className="mb-1 block text-muted">Artist name *</span><input name="artist_name" required maxLength={80} defaultValue={s.artist_name} className="field" /></label>
        <label className="text-sm"><span className="mb-1 block text-muted">Tagline</span><input name="tagline" maxLength={200} defaultValue={s.tagline ?? ""} className="field" /></label>
        <label className="text-sm"><span className="mb-1 block text-muted">Bio</span><textarea name="bio" rows={5} maxLength={5000} defaultValue={s.bio ?? ""} className="field" /></label>
        <label className="text-sm"><span className="mb-1 block text-muted">Contact email</span><input name="contact_email" type="email" defaultValue={s.contact_email ?? ""} className="field" /></label>
        <div><button className="btn">Save changes</button></div>
      </form>
    </div>
  );
}

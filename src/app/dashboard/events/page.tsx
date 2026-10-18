import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createEvent, setEventStatus, deleteEvent } from "../actions";
import { ImagePicker } from "@/components/image-picker";

export const metadata = { title: "Manage Events" };
export const dynamic = "force-dynamic";

const MSG: Record<string, string> = {
  invalid: "Check form fields (dates required, URLs must start with https://).",
  slug: "That slug is already used.",
  save: "Could not save event.",
};

function Act({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setEventStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="btn btn-ghost text-xs py-1 whitespace-nowrap">{label}</button>
    </form>
  );
}

export default async function EventsDashboard({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const { sb } = await requireRole(["editor"]);
  const sp = await searchParams;
  const { data: events } = await sb.from("events").select("*").order("starts_at", { ascending: false }).limit(50);

  return (
    <div className="space-y-8 min-w-0 overflow-hidden">
      <div className="glass p-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Events & Tour Dates</h1>
        <p className="text-muted text-sm">Manage tour schedule, venues, posters, timezones, ticket links, and cancellation status.</p>
      </div>

      {sp.ok && <p role="status" className="glass p-3 text-sm text-emerald-300">Event saved successfully.</p>}
      {sp.error && <p role="alert" className="text-red-300 text-sm">{MSG[sp.error] ?? "Error saving event."}</p>}

      <form action={createEvent} className="glass grid gap-4 p-6 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-muted">Event Title *</span>
          <input name="title" required placeholder="Fabric London Residency" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Slug * (a-z, numbers, dashes)</span>
          <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="fabric-london-2026" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Venue Name *</span>
          <input name="venue_name" required placeholder="Fabric" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">City & Country *</span>
          <input name="city" required placeholder="London, UK" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Starts At (Date & Time) *</span>
          <input name="starts_at" type="datetime-local" required className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Timezone</span>
          <input name="timezone" defaultValue="Europe/London" className="field" />
        </label>
        <div className="sm:col-span-2">
          <ImagePicker name="poster_url" label="Event Poster Artwork" aspectRatio="video" />
        </div>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Ticket URL (https://)</span>
          <input name="ticket_url" type="url" placeholder="https://residentadvisor.net" className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Status</span>
          <select name="status" className="field">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Description</span>
          <textarea name="description" rows={3} placeholder="All-night special guest set..." className="field" />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2 pt-2 cursor-pointer">
          <input type="checkbox" name="featured" /> Feature on homepage
        </label>
        <div className="sm:col-span-2">
          <button className="btn">Create Event</button>
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">Existing Events</h3>
        {events?.map((ev) => (
          <div key={ev.id} className="glass flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-4 min-w-0">
              {ev.poster_url ? (
                <div className="w-14 h-14 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/10">
                  <img src={ev.poster_url} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-muted shrink-0">No poster</div>
              )}
              <div className="min-w-0 space-y-0.5">
                <p className="font-medium text-sm truncate">{ev.title}</p>
                <p className="text-xs text-muted truncate">{ev.venue_name}, {ev.city} · {new Date(ev.starts_at).toLocaleString()} ({ev.timezone}) · Status: <span className="uppercase text-amber-400 font-semibold">{ev.status}</span> {ev.featured && "· Featured"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0">
              {ev.status === "published" && <Link href={`/events/${ev.slug}`} className="btn btn-ghost text-xs py-1 whitespace-nowrap">View</Link>}
              <Link href={`/dashboard/events/${ev.id}/edit`} className="btn btn-ghost text-xs py-1 whitespace-nowrap">Edit</Link>
              {ev.status !== "published" && <Act id={ev.id} status="published" label="Publish" />}
              {ev.status !== "draft" && <Act id={ev.id} status="draft" label="Draft" />}
              {ev.status !== "cancelled" && <Act id={ev.id} status="cancelled" label="Cancel" />}
              {ev.status !== "archived" && <Act id={ev.id} status="archived" label="Archive" />}
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={ev.id} />
                <button className="btn btn-ghost text-xs py-1 text-red-400 hover:text-red-300 whitespace-nowrap">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {!events?.length && <p className="text-muted text-sm">No events created yet.</p>}
      </div>
    </div>
  );
}

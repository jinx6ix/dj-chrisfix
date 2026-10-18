import { requireRole } from "@/lib/auth";
import { updateEvent } from "../../../actions";
import Link from "next/link";
import { ImagePicker } from "@/components/image-picker";

export const metadata = { title: "Edit Event" };
export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { sb } = await requireRole(["editor"]);
  const { id } = await params;
  const sp = await searchParams;

  const { data: event, error } = await sb.from("events").select("*").eq("id", id).single();
  if (error || !event) {
    return <div className="p-8 text-red-300">Event not found.</div>;
  }

  const startsAtFormatted = event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : "";

  return (
    <div className="space-y-8 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold truncate">Edit Event: {event.title}</h1>
        <Link href="/dashboard/events" className="btn btn-ghost text-xs shrink-0">← Back to Events</Link>
      </div>

      {sp.error && <p role="alert" className="text-red-300 text-sm">Error saving event. Check form fields and slug uniqueness.</p>}

      <form action={updateEvent} className="glass grid gap-4 p-6 sm:grid-cols-2">
        <input type="hidden" name="id" value={event.id} />
        <label className="text-sm">
          <span className="mb-1 block text-muted">Event Title *</span>
          <input name="title" required defaultValue={event.title} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Slug * (a-z, numbers, dashes)</span>
          <input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={event.slug} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Venue Name *</span>
          <input name="venue_name" required defaultValue={event.venue_name || ""} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">City & Country *</span>
          <input name="city" required defaultValue={event.city || ""} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Starts At (Date & Time) *</span>
          <input name="starts_at" type="datetime-local" required defaultValue={startsAtFormatted} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Timezone</span>
          <input name="timezone" defaultValue={event.timezone || "Europe/London"} className="field" />
        </label>
        <div className="sm:col-span-2">
          <ImagePicker name="poster_url" defaultValue={event.poster_url || ""} label="Event Poster Artwork" aspectRatio="video" />
        </div>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Ticket URL (https://)</span>
          <input name="ticket_url" type="url" defaultValue={event.ticket_url || ""} className="field" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-muted">Status</span>
          <select name="status" defaultValue={event.status} className="field">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-muted">Description</span>
          <textarea name="description" rows={4} defaultValue={event.description || ""} className="field" />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2 pt-2 cursor-pointer">
          <input type="checkbox" name="featured" defaultChecked={event.featured} /> Feature on homepage
        </label>
        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button className="btn">Save Changes</button>
          <Link href="/dashboard/events" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

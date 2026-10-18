import { submitBooking } from "./actions";

export const metadata = { title: "Book the DJ" };

function F({ n, label, type = "text", req, area }: { n: string; label: string; type?: string; req?: boolean; area?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}{req && " *"}</span>
      {area ? <textarea name={n} rows={4} maxLength={4000} className="field" /> : <input name={n} type={type} required={req} className="field" />}
    </label>
  );
}
const ERR: Record<string, string> = { invalid: "Please check your details and try again.", rate: "Too many requests. Please try again later.", save: "We couldn't save your inquiry. Please try again." };

export default async function Bookings({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold">Book the DJ</h1>
      <p className="mb-8 text-muted">Send an inquiry with your event details. It is a request, not a confirmed booking.</p>
      {sp.sent && <p role="status" className="glass mb-6 p-4">Inquiry received. You will get a reply by email.</p>}
      {sp.error && <p role="alert" className="mb-6 text-red-300">{ERR[sp.error] ?? "Something went wrong."}</p>}
      <form action={submitBooking} className="glass grid gap-4 p-6 sm:grid-cols-2">
        <F n="name" label="Your name" req /><F n="email" label="Email" type="email" req />
        <F n="phone" label="Phone or preferred contact" /><F n="organization" label="Organization or event name" />
        <F n="event_type" label="Event type" req /><F n="event_date" label="Event date" type="date" req />
        <F n="venue" label="Venue and location" /><F n="audience_size" label="Expected audience" type="number" />
        <F n="duration_minutes" label="Set length (minutes)" type="number" /><F n="budget_range" label="Budget range (optional)" />
        <div className="sm:col-span-2"><F n="details" label="Anything else we should know" area /></div>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <div className="sm:col-span-2"><button className="btn">Send inquiry</button></div>
      </form>
    </div>
  );
}

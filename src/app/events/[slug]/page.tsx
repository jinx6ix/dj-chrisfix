import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, ArrowLeft, Globe } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { GlassCard } from "@/components/glass-card";
import { AnimatedButton } from "@/components/animated-button";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const sb = await supabaseServer();
  const { data } = await sb.from("events").select("*").eq("slug", slug).in("status", ["published", "postponed"]).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ev = await load((await params).slug);
  if (!ev) return {};
  const dateStr = new Date(ev.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return {
    title: `${ev.title} – Live at ${ev.venue_name || ev.city || "Club"} (${dateStr})`,
    description: ev.description ?? `Join DJ ChrisFix live at ${ev.venue_name}, ${ev.city}.`,
    alternates: { canonical: `/events/${ev.slug}` },
    openGraph: { title: ev.title, images: ev.poster_url ? [ev.poster_url] : undefined },
  };
}

export default async function EventPage({ params }: Props) {
  const slug = (await params).slug;
  const ev = await load(slug);
  if (!ev) notFound();

  const sb = await supabaseServer();
  const { data: relatedEvents } = await sb.from("events")
    .select("slug,title,starts_at,timezone,venue_name,city,poster_url")
    .in("status", ["published", "postponed"])
    .neq("slug", slug)
    .gte("starts_at", new Date().toISOString())
    .limit(2);

  const eventDate = new Date(ev.starts_at);

  return (
    <article className="max-w-4xl mx-auto space-y-12">
      {/* Back Link */}
      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to All Events
      </Link>

      {/* Hero Header */}
      <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 grid gap-8 md:grid-cols-3 items-center">
        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
          {ev.poster_url ? (
            <img src={ev.poster_url} alt={ev.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar size={64} className="text-muted/40" />
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Live Show
            </span>
            {ev.status === "postponed" && (
              <span className="text-xs font-medium px-3 py-1 rounded bg-amber-500/20 text-amber-300">Postponed</span>
            )}
            <span className="text-xs text-muted flex items-center gap-1">
              <Globe size={14} /> {ev.timezone}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{ev.title}</h1>

          <div className="space-y-3 pt-2">
            <p className="text-lg text-white font-medium flex items-center gap-3">
              <Calendar size={20} className="text-[#ff9f43]" />
              {eventDate.toLocaleString("en-US", { timeZone: ev.timezone, dateStyle: "full", timeStyle: "short" })}
            </p>
            <p className="text-base text-muted flex items-center gap-3">
              <MapPin size={20} className="text-violet-400" />
              {[ev.venue_name, ev.city].filter(Boolean).join(", ")}
            </p>
          </div>

          {ev.ticket_url && ev.ticket_url.startsWith("https://") && (
            <div className="pt-4">
              <a href={ev.ticket_url} rel="noopener noreferrer" target="_blank">
                <AnimatedButton variant="primary" className="text-base px-8 py-4">
                  Get Tickets <ExternalLink size={18} aria-hidden />
                </AnimatedButton>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Description Section */}
      {ev.description && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">About This Event</h2>
          <GlassCard hoverEffect={false} className="p-8">
            <p className="text-muted text-base leading-relaxed whitespace-pre-line">{ev.description}</p>
          </GlassCard>
        </section>
      )}

      {/* Related Events */}
      {relatedEvents && relatedEvents.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-2xl font-bold tracking-tight">Other Upcoming Shows</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {relatedEvents.map((re) => (
              <Link key={re.slug} href={`/events/${re.slug}`} className="block group">
                <GlassCard className="flex items-center gap-4 p-4">
                  {re.poster_url ? (
                    <img src={re.poster_url} alt={re.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Calendar size={20} className="text-muted" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-[#ff9f43] font-semibold">{new Date(re.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    <h3 className="font-bold text-white truncate group-hover:text-[#ff9f43] transition-colors">{re.title}</h3>
                    <p className="text-xs text-muted truncate">{[re.venue_name, re.city].filter(Boolean).join(", ")}</p>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

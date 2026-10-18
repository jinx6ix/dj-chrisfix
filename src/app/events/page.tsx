import Link from "next/link";
import { Calendar, MapPin, ExternalLink, Sparkles, Clock, Disc } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { AnimatedButton } from "@/components/animated-button";

export const metadata = { title: "Tour Dates & Events" };
export const dynamic = "force-dynamic";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = "upcoming" } = await searchParams;
  const sb = await supabaseServer();
  const now = new Date().toISOString();

  let query = sb.from("events")
    .select("slug,title,description,poster_url,starts_at,timezone,venue_name,city,ticket_url,status,featured")
    .in("status", ["published", "postponed"]);

  if (filter === "past") {
    query = query.lt("starts_at", now).order("starts_at", { ascending: false });
  } else {
    query = query.gte("starts_at", now).order("starts_at", { ascending: true });
  }

  const { data: events } = await query.limit(50);
  const { data: featuredEvents } = filter === "upcoming" ? await sb.from("events")
    .select("slug,title,poster_url,starts_at,timezone,venue_name,city,ticket_url,status")
    .eq("status", "published")
    .eq("featured", true)
    .gte("starts_at", now)
    .limit(2) : { data: [] };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="glass p-8 md:p-12 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Calendar} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Live Performances</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Tour Dates & Events</h1>
        <p className="text-muted max-w-2xl text-base">
          Catch DJ ChrisFix live at upcoming club nights, warehouse takeovers, and festival stages around the world.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Link
          href="/events?filter=upcoming"
          className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${filter === "upcoming" ? "bg-[#ff9f43] text-black font-semibold" : "glass text-muted hover:text-white"}`}
        >
          Upcoming Events
        </Link>
        <Link
          href="/events?filter=past"
          className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${filter === "past" ? "bg-[#ff9f43] text-black font-semibold" : "glass text-muted hover:text-white"}`}
        >
          Past Events Archive
        </Link>
      </div>

      {/* Featured Events Showcase (Upcoming only) */}
      {filter === "upcoming" && featuredEvents && featuredEvents.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles size={18} className="text-[#ff9f43]" /> Featured Performances
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredEvents.map((fe) => (
              <Link key={fe.slug} href={`/events/${fe.slug}`} className="block group">
                <GlassCard className="relative overflow-hidden p-0 h-full flex flex-col justify-between">
                  {fe.poster_url && (
                    <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url(${fe.poster_url})` }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />

                  <div className="relative z-10 p-8 space-y-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-[#ff9f43] border border-amber-500/30">
                      Featured Show
                    </span>
                    <h3 className="text-2xl font-bold text-white group-hover:text-[#ff9f43] transition-colors">{fe.title}</h3>
                    <p className="text-sm text-muted flex items-center gap-2">
                      <Calendar size={16} className="text-[#ff9f43]" />
                      {new Date(fe.starts_at).toLocaleString("en-US", { timeZone: fe.timezone, dateStyle: "full", timeStyle: "short" })}
                    </p>
                    <p className="text-sm text-muted flex items-center gap-2">
                      <MapPin size={16} className="text-violet-400" />
                      {[fe.venue_name, fe.city].filter(Boolean).join(", ")}
                    </p>
                  </div>

                  <div className="relative z-10 px-8 pb-8 pt-4 flex items-center justify-between border-t border-white/10">
                    <span className="text-xs font-medium text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Event Details &rarr;
                    </span>
                    {fe.ticket_url && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#ff9f43] text-black">Tickets Available</span>
                    )}
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Events List */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">
          {filter === "upcoming" ? "All Upcoming Dates" : "Past Event Archives"}
        </h2>

        {events?.length ? (
          <div className="grid gap-6">
            {events.map((ev) => (
              <GlassCard key={ev.slug} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
                <div className="flex items-center gap-6">
                  {ev.poster_url ? (
                    <img src={ev.poster_url} alt={ev.title} className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Calendar size={24} className="text-muted" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {new Date(ev.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      {ev.status === "postponed" && (
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Postponed</span>
                      )}
                    </div>
                    <Link href={`/events/${ev.slug}`} className="text-xl font-bold text-white hover:text-[#ff9f43] transition-colors block">
                      {ev.title}
                    </Link>
                    <p className="text-sm text-muted flex items-center gap-2">
                      <MapPin size={15} className="text-[#ff9f43]" />
                      {[ev.venue_name, ev.city].filter(Boolean).join(", ")} · {new Date(ev.starts_at).toLocaleTimeString("en-US", { timeZone: ev.timezone, hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                  <Link href={`/events/${ev.slug}`}>
                    <AnimatedButton variant="ghost" className="text-sm">Details</AnimatedButton>
                  </Link>
                  {filter === "upcoming" && ev.ticket_url?.startsWith("https://") && (
                    <a href={ev.ticket_url} rel="noopener noreferrer" target="_blank">
                      <AnimatedButton variant="primary" className="text-sm">
                        Tickets <ExternalLink size={16} aria-hidden />
                      </AnimatedButton>
                    </a>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-16 text-center space-y-4">
            <Calendar size={48} className="mx-auto text-muted/40" />
            <h3 className="text-xl font-semibold">No events found</h3>
            <p className="text-muted text-sm">
              {filter === "upcoming" ? "No upcoming tour dates scheduled at this moment. Check back soon." : "No past events recorded in the archive."}
            </p>
          </GlassCard>
        )}
      </section>
    </div>
  );
}

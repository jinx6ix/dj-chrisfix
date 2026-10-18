import Link from "next/link";
import { Play, Calendar, Disc, Video, Image as ImageIcon, Share2, Mail, ArrowRight, MapPin, ExternalLink, Sparkles } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data";
import { Reveal } from "@/components/reveal";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { AnimatedButton } from "@/components/animated-button";
import { AudioEqualizerLoader } from "@/components/audio-equalizer-loader";
import { LATEST_VIDEOS, GALLERY_ITEMS, SOCIAL_LINKS } from "@/lib/home-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const s = await getSettings();
  const sb = await supabaseServer();

  const { data: mixes } = await sb.from("mixes").select("slug,title,cover_url,genre,duration").eq("status", "published")
    .order("featured", { ascending: false }).order("published_at", { ascending: false }).limit(6);

  const { data: events } = await sb.from("events").select("slug,title,starts_at,timezone,venue_name,city,ticket_url,status")
    .in("status", ["published", "postponed"]).gte("starts_at", new Date().toISOString()).order("starts_at").limit(4);

  const latest = mixes?.[0];

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 p-6 md:p-16 bg-gradient-to-b from-[#12121a]/80 via-[#0a0a0f]/90 to-[#050508]">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Background image overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-xs font-semibold uppercase tracking-widest text-[#ff9f43]">
            <Sparkles size={14} className="text-[#ff9f43]" />
            Official Resident & Producer
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white drop-shadow-lg">
            {s.artist_name}
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-2xl text-muted font-light leading-relaxed">
            {s.tagline || "World-class electronic music producer & club resident"}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href={latest ? `/mixes/${latest.slug}` : "/mixes"}>
              <AnimatedButton variant="primary" className="text-base px-8 py-4">
                <Play size={20} aria-hidden /> Listen to Latest Mix
              </AnimatedButton>
            </Link>
            <Link href="/bookings">
              <AnimatedButton variant="violet" className="text-base px-8 py-4">
                Book the DJ <ArrowRight size={20} aria-hidden />
              </AnimatedButton>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-6 text-sm text-muted">
            <div className="flex items-center gap-2">
              <AudioEqualizerLoader />
              <span>Live Streaming Active</span>
            </div>
            <span>•</span>
            <span>Global Club Resident</span>
          </div>
        </div>
      </section>

      {/* Featured Mixes */}
      <Reveal>
        <section aria-labelledby="mixes-h" className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#ff9f43] text-xs font-semibold uppercase tracking-wider mb-2">
                <GlassIcon icon={Disc} variant="amber" size={16} /> Latest Audio Sessions
              </div>
              <h2 id="mixes-h" className="text-3xl font-bold tracking-tight">Featured Mixes</h2>
            </div>
            <Link href="/mixes" className="text-sm font-medium text-muted hover:text-white flex items-center gap-1 transition-colors">
              View all mixes <ArrowRight size={16} />
            </Link>
          </div>

          {mixes?.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mixes.map((m) => (
                <Link key={m.slug} href={`/mixes/${m.slug}`} className="block group">
                  <GlassCard className="h-full flex flex-col justify-between space-y-4">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                      {m.cover_url ? (
                        <img
                          src={m.cover_url}
                          alt={`${m.title} cover art`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc size={48} className="text-muted/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="btn btn-primary text-xs py-2 px-4">Listen Now</span>
                      </div>
                    </div>
                    <div>
                      {m.genre && (
                        <span className="text-xs font-semibold text-[#ff9f43] uppercase tracking-wider">{m.genre}</span>
                      )}
                      <h3 className="text-lg font-semibold text-white mt-1 group-hover:text-[#ff9f43] transition-colors line-clamp-1">
                        {m.title}
                      </h3>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center text-muted">
              No mixes published yet. Check back soon for new club sets.
            </GlassCard>
          )}
        </section>
      </Reveal>

      {/* Upcoming Events */}
      <Reveal>
        <section aria-labelledby="events-h" className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <GlassIcon icon={Calendar} variant="violet" size={16} /> Tour Dates & Residencies
              </div>
              <h2 id="events-h" className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
            </div>
            <Link href="/bookings" className="text-sm font-medium text-muted hover:text-white flex items-center gap-1 transition-colors">
              Book for an event <ArrowRight size={16} />
            </Link>
          </div>

          {events?.length ? (
            <ul className="grid gap-4">
              {events.map((e) => (
                <li key={e.slug}>
                  <GlassCard hoverEffect={false} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {new Date(e.starts_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {e.status === "postponed" && (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Postponed</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white">{e.title}</h3>
                      <p className="text-sm text-muted flex items-center gap-2">
                        <MapPin size={15} className="text-[#ff9f43]" />
                        {[e.venue_name, e.city].filter(Boolean).join(", ")} · {new Date(e.starts_at).toLocaleTimeString("en-US", { timeZone: e.timezone, hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                    {e.ticket_url?.startsWith("https://") && (
                      <a href={e.ticket_url} rel="noopener noreferrer" target="_blank">
                        <AnimatedButton variant="primary" className="text-sm">
                          Get Tickets <ExternalLink size={16} aria-hidden />
                        </AnimatedButton>
                      </a>
                    )}
                  </GlassCard>
                </li>
              ))}
            </ul>
          ) : (
            <GlassCard className="p-12 text-center text-muted">
              No upcoming public events scheduled at the moment. Stay tuned for tour announcements.
            </GlassCard>
          )}
        </section>
      </Reveal>

      {/* Artist Bio / Introduction */}
      <Reveal>
        <section className="glass p-8 md:p-14 relative overflow-hidden rounded-3xl border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="grid gap-12 lg:grid-cols-2 items-center relative z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#ff9f43]">
                <Sparkles size={14} /> Artist Biography
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Pushing the boundaries of electronic music across global dancefloors.
              </h2>
              <p className="text-muted text-base leading-relaxed">
                {s.bio || "DJ ChrisFix has spent over a decade shaping the underground house and techno landscape. Known for hypnotic basslines, intricate melodic textures, and unrelenting energy behind the decks, ChrisFix commands dancefloors from intimate basement clubs to massive festival main stages."}
              </p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-2xl md:text-3xl font-black text-[#ff9f43]">150+</p>
                  <p className="text-xs text-muted mt-1 uppercase tracking-wider">Global Shows</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-black text-violet-400">12M+</p>
                  <p className="text-xs text-muted mt-1 uppercase tracking-wider">Streams</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-black text-white">10 Yrs</p>
                  <p className="text-xs text-muted mt-1 uppercase tracking-wider">In The Mix</p>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=1200&auto=format&fit=crop"
                alt="DJ ChrisFix performing live"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Latest Videos */}
      <Reveal>
        <section aria-labelledby="videos-h" className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#ff9f43] text-xs font-semibold uppercase tracking-wider mb-2">
                <GlassIcon icon={Video} variant="amber" size={16} /> Visual Performances
              </div>
              <h2 id="videos-h" className="text-3xl font-bold tracking-tight">Latest Videos</h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LATEST_VIDEOS.map((vid) => (
              <GlassCard key={vid.id} className="group overflow-hidden space-y-4">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-white/5 border border-white/5">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-[#ff9f43] border border-white/20 group-hover:scale-110 transition-transform">
                      <Play size={20} fill="currentColor" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 text-xs font-semibold px-2 py-1 rounded bg-black/70 text-white backdrop-blur">
                    {vid.duration}
                  </span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-[#ff9f43] transition-colors line-clamp-2">
                  {vid.title}
                </h3>
              </GlassCard>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Gallery Preview */}
      <Reveal>
        <section aria-labelledby="gallery-h" className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <GlassIcon icon={ImageIcon} variant="violet" size={16} /> Photo Archive
              </div>
              <h2 id="gallery-h" className="text-3xl font-bold tracking-tight">Gallery Preview</h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {GALLERY_ITEMS.map((item) => (
              <GlassCard key={item.id} hoverEffect={false} className="group relative aspect-square overflow-hidden rounded-2xl p-0 border border-white/10">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <span className="text-xs font-semibold text-[#ff9f43] uppercase tracking-wider">{item.category}</span>
                  <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Social Media Links */}
      <Reveal>
        <section className="space-y-8">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 text-[#ff9f43] text-xs font-semibold uppercase tracking-wider">
              <Share2 size={16} /> Connect & Stream
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Official Channels</h2>
            <p className="text-muted text-sm">Follow DJ ChrisFix across platforms for daily updates, unreleased tracks, and live stream notifications.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOCIAL_LINKS.map((soc) => (
              <a key={soc.name} href={soc.url} target="_blank" rel="noopener noreferrer" className="block group">
                <GlassCard className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[#ff9f43] group-hover:bg-[#ff9f43] group-hover:text-black transition-colors">
                      <Share2 size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-[#ff9f43] transition-colors">{soc.name}</h3>
                      <p className="text-xs text-muted">{soc.handle}</p>
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-muted group-hover:text-white transition-colors" />
                </GlassCard>
              </a>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Complete Footer */}
      <footer className="border-t border-white/10 pt-16 pb-8 mt-20 text-muted text-sm space-y-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-xl font-bold text-white">{s.artist_name}</h3>
            <p className="max-w-md text-muted">
              {s.tagline || "World-class electronic music producer & club resident delivering hypnotic soundscapes."}
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Available for Bookings
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/mixes" className="hover:text-white transition-colors">Mixes & Music</Link></li>
              <li><Link href="/bookings" className="hover:text-white transition-colors">Bookings & Tours</Link></li>
              <li><Link href="/design-system" className="hover:text-white transition-colors">Design System</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Direct Contact</h4>
            <p className="text-muted">For bookings, press inquiries, and management:</p>
            <a href={`mailto:${s.contact_email || "booking@djchrisfix.com"}`} className="text-[#ff9f43] hover:underline flex items-center gap-2 font-medium">
              <Mail size={16} /> {s.contact_email || "booking@djchrisfix.com"}
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5 text-xs text-muted">
          <p>© {new Date().getFullYear()} {s.artist_name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Play, Calendar, Clock, Disc, ArrowLeft, ExternalLink, Share2, Music } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { embedSrc } from "@/lib/embed";
import { fmtSeconds } from "@/lib/format";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { AnimatedButton } from "@/components/animated-button";
import { PlayButtonClient } from "@/components/play-button-client";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const sb = await supabaseServer();
  const { data } = await sb.from("mixes")
    .select("*, tracklist_items(position,title,artist,start_seconds)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await load((await params).slug);
  if (!m) return {};
  return {
    title: m.seo_title ?? m.title,
    description: m.seo_description ?? m.description ?? undefined,
    alternates: { canonical: `/mixes/${m.slug}` },
    openGraph: { title: m.title, images: m.cover_url ? [m.cover_url] : undefined },
  };
}

export default async function MixPage({ params }: Props) {
  const slug = (await params).slug;
  const m = await load(slug);
  if (!m) notFound();

  const sb = await supabaseServer();
  // Fetch related mixes (other published mixes)
  const { data: relatedMixes } = await sb.from("mixes")
    .select("slug,title,cover_url,release_date")
    .eq("status", "published")
    .neq("slug", slug)
    .limit(3);

  const src = embedSrc(m.audio_url);
  const tracks = [...(m.tracklist_items ?? [])].sort((a, b) => a.position - b.position);
  const isDirectAudio = m.audio_url && m.audio_url.startsWith("https://") && !src;

  return (
    <article className="max-w-4xl mx-auto space-y-12">
      {/* Back Link */}
      <Link href="/mixes" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to All Mixes
      </Link>

      {/* Hero Header */}
      <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 grid gap-8 md:grid-cols-3 items-center">
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
          {m.cover_url ? (
            <img src={m.cover_url} alt={`${m.title} cover art`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc size={64} className="text-muted/40" />
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#ff9f43]/20 text-[#ff9f43] border border-[#ff9f43]/30">
              Published Mix
            </span>
            {m.release_date && (
              <span className="text-xs text-muted flex items-center gap-1">
                <Calendar size={14} /> {new Date(m.release_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
            {m.duration_seconds && (
              <span className="text-xs text-muted flex items-center gap-1 tabular-nums">
                <Clock size={14} /> {fmtSeconds(m.duration_seconds)}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">{m.title}</h1>

          {m.description && (
            <p className="text-muted text-base leading-relaxed whitespace-pre-line">{m.description}</p>
          )}

          {/* Action Button for direct audio playback */}
          {isDirectAudio && (
            <div className="pt-2">
              <PlayButtonClient
                track={{
                  id: m.id,
                  title: m.title,
                  artist: "DJ ChrisFix",
                  coverUrl: m.cover_url,
                  audioUrl: m.audio_url,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Audio Player / Embed Section */}
      <section aria-label="Audio player" className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <GlassIcon icon={Music} variant="amber" size={20} /> Stream Mix
        </h2>

        {src ? (
          <div className="glass rounded-2xl overflow-hidden p-2 border border-white/10">
            <iframe src={src} title={`${m.title} player`} loading="lazy" className="h-44 w-full rounded-xl border-0" />
          </div>
        ) : m.audio_url?.startsWith("https://") ? (
          <GlassCard className="p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">Direct Audio Stream</p>
              <p className="text-xs text-muted mt-1">Play directly using the persistent player bar below or open the original source.</p>
            </div>
            <a href={m.audio_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost shrink-0 flex items-center gap-2">
              Original Link <ExternalLink size={16} />
            </a>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 text-center text-muted">
            No audio source attached to this mix yet.
          </GlassCard>
        )}
      </section>

      {/* Tracklist Section */}
      {tracks.length > 0 && (
        <section aria-labelledby="tracklist-h" className="space-y-4">
          <h2 id="tracklist-h" className="text-xl font-semibold flex items-center gap-2">
            <GlassIcon icon={Disc} variant="violet" size={20} /> Tracklist ({tracks.length} tracks)
          </h2>
          <GlassCard hoverEffect={false} className="p-0 overflow-hidden divide-y divide-white/5">
            <ol className="divide-y divide-white/5">
              {tracks.map((t) => (
                <li key={t.position} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-sm">
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-xs font-mono text-muted text-right">{t.position}</span>
                    <div>
                      <p className="font-medium text-white">{t.title}</p>
                      {t.artist && <p className="text-xs text-muted">{t.artist}</p>}
                    </div>
                  </div>
                  {t.start_seconds != null && (
                    <span className="text-xs font-mono text-[#ff9f43] bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25 tabular-nums">
                      {fmtSeconds(t.start_seconds)}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </GlassCard>
        </section>
      )}

      {/* Related Mixes */}
      {relatedMixes && relatedMixes.length > 0 && (
        <section aria-labelledby="related-h" className="space-y-6 pt-6">
          <h2 id="related-h" className="text-2xl font-bold tracking-tight">More Mixes</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {relatedMixes.map((rm) => (
              <Link key={rm.slug} href={`/mixes/${rm.slug}`} className="block group">
                <GlassCard className="h-full flex flex-col justify-between space-y-3">
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-white/5 border border-white/5">
                    {rm.cover_url ? (
                      <img src={rm.cover_url} alt={rm.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Disc size={32} className="text-muted/40" /></div>
                    )}
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-[#ff9f43] transition-colors line-clamp-1 text-sm">
                    {rm.title}
                  </h3>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

import Link from "next/link";
import { Search, Disc, Play, Calendar, Clock, Sparkles } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { AnimatedButton } from "@/components/animated-button";
import { fmtSeconds } from "@/lib/format";

export const metadata = { title: "Mixes & Music Library" };
export const dynamic = "force-dynamic";

export default async function MixesPage({ searchParams }: { searchParams: Promise<{ q?: string; genre?: string }> }) {
  const { q, genre } = await searchParams;
  const sb = await supabaseServer();

  // Fetch all genres for filter pills
  const { data: genres } = await sb.from("genres").select("id,name,slug").order("name");

  let query = sb.from("mixes")
    .select("slug,title,description,cover_url,audio_url,duration_seconds,release_date,featured")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(48);

  if (q) {
    query = query.ilike("title", `%${q.replace(/[%_,()]/g, " ").slice(0, 80)}%`);
  }

  const { data: mixes } = await query;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="glass p-8 md:p-12 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Disc} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Music Library</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">DJ Mixes & Sessions</h1>
        <p className="text-muted max-w-2xl text-base">
          Explore studio sessions, underground club residencies, and festival live sets across house, techno, and melodic soundscapes.
        </p>
      </div>

      {/* Search & Filter Form */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form role="search" className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search mixes by title..."
              aria-label="Search mixes"
              className="field pl-10 w-full"
            />
          </div>
          <AnimatedButton variant="primary" className="py-2.5 px-6">Search</AnimatedButton>
        </form>

        {/* Genre Filter Pills */}
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/mixes"
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!genre ? "bg-[#ff9f43] text-black border-[#ff9f43] font-semibold" : "glass text-muted hover:text-white border-white/10"}`}
            >
              All Genres
            </Link>
            {genres.map((g) => (
              <Link
                key={g.id}
                href={`/mixes?genre=${g.slug}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${genre === g.slug ? "bg-[#ff9f43] text-black border-[#ff9f43] font-semibold" : "glass text-muted hover:text-white border-white/10"}`}
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mixes Grid */}
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
                  {m.featured && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#ff9f43] text-black uppercase tracking-wider">
                      Featured
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2">
                      <Play size={14} fill="currentColor" /> View & Listen
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    {m.release_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(m.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    {m.duration_seconds && (
                      <span className="flex items-center gap-1 tabular-nums">
                        <Clock size={12} /> {fmtSeconds(m.duration_seconds)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#ff9f43] transition-colors line-clamp-1">
                    {m.title}
                  </h3>
                  {m.description && (
                    <p className="text-sm text-muted line-clamp-2">{m.description}</p>
                  )}
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <GlassCard className="p-16 text-center space-y-4">
          <Disc size={48} className="mx-auto text-muted/40" />
          <h3 className="text-xl font-semibold">No mixes found</h3>
          <p className="text-muted text-sm">
            {q || genre ? "Try adjusting your search query or genre filter." : "No published mixes are available in the library yet."}
          </p>
          {q || genre && (
            <Link href="/mixes" className="btn btn-ghost inline-flex mt-2">Clear Filters</Link>
          )}
        </GlassCard>
      )}
    </div>
  );
}

import { Metadata } from "next";
import { Disc, Award, Music, Download, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { getSettings } from "@/lib/data";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { AnimatedButton } from "@/components/animated-button";

export const metadata: Metadata = { title: "About DJ ChrisFix" };

export default async function AboutPage() {
  const s = await getSettings();

  const genres = ["Tech House", "Deep Techno", "Melodic House", "Progressive", "Minimal Club"];
  const achievements = [
    "Resident DJ at Terminal Underground & Warehouse 54",
    "Over 10M+ collective streams across Spotify, SoundCloud & Mixcloud",
    "Headlined major electronic music festival stages in Berlin, Ibiza, and London",
    "Featured guest mixes on BBC Radio 1 Residency & Anjunadeep Open Air",
    "Founder of SoundCraft Records & underground immersive audio showcases",
  ];

  const pressPhotos = [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
  ];

  return (
    <div className="space-y-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass p-8 md:p-12 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Disc} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Biography & Profile</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">About {s.artist_name}</h1>
        <p className="text-muted max-w-2xl text-base">{s.tagline}</p>
      </div>

      {/* Main Bio Grid */}
      <div className="grid gap-8 md:grid-cols-3 items-start">
        <div className="aspect-[3/4] rounded-3xl overflow-hidden glass border border-white/10 relative shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop"
            alt={s.artist_name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="md:col-span-2 space-y-6">
          <GlassCard hoverEffect={false} className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-[#ff9f43]" /> The Sound & Vision
            </h2>
            <p className="text-muted leading-relaxed text-base">{s.bio}</p>
            <p className="text-muted leading-relaxed text-base">
              With a career spanning over a decade in global club culture, {s.artist_name} has cemented a reputation for hypnotic basslines, immersive analog soundscapes, and transcendent peak-time energy. Whether commanding an intimate warehouse basement or a massive festival amphitheater, every set is a curated journey through rhythm and emotion.
            </p>
          </GlassCard>

          {/* Genres */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Music size={18} className="text-violet-400" /> Signature Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <span key={g} className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements / Career Milestones */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Award size={22} className="text-[#ff9f43]" /> Career Milestones & Achievements
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((ach, idx) => (
            <GlassCard key={idx} hoverEffect={false} className="p-6 flex items-start gap-4">
              <CheckCircle2 size={20} className="text-[#ff9f43] shrink-0 mt-0.5" />
              <p className="text-sm text-white font-medium leading-relaxed">{ach}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Photographs & Press Kit */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Press Portraits & EPK</h2>
          <div className="flex items-center gap-3">
            <a href="/bookings">
              <AnimatedButton variant="primary" className="text-sm">Book Artist</AnimatedButton>
            </a>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {pressPhotos.map((p, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden glass border border-white/10 relative group">
              <img src={p} alt={`Press portrait ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { Metadata } from "next";
import { Video, Play, Clock, Sparkles } from "lucide-react";
import { LATEST_VIDEOS } from "@/lib/home-data";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";

export const metadata: Metadata = { title: "Live Sets & Videos" };

export default function VideosPage() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass p-8 md:p-12 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Video} variant="violet" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-violet-400">Visual Performances</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Live Sets & Videos</h1>
        <p className="text-muted max-w-2xl text-base">
          Watch official festival sets, intimate rooftop sessions, and analog studio production masterclasses.
        </p>
      </div>

      {/* Videos Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {LATEST_VIDEOS.map((vid) => (
          <GlassCard key={vid.id} className="p-0 overflow-hidden flex flex-col justify-between">
            <div className="aspect-video w-full relative bg-white/5 overflow-hidden group">
              <iframe
                src={vid.embedUrl}
                title={vid.title}
                loading="lazy"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-[#ff9f43] border border-amber-500/20">
                  Featured Stream
                </span>
                <span className="text-xs text-muted flex items-center gap-1 tabular-nums">
                  <Clock size={14} /> {vid.duration}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{vid.title}</h3>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

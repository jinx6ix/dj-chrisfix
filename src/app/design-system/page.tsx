import { Play, Disc, Sliders, Calendar, Mail, Shield, Sparkles, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { AnimatedButton } from "@/components/animated-button";
import { SkeletonCard } from "@/components/skeleton-card";
import { AudioEqualizerLoader } from "@/components/audio-equalizer-loader";
import { LoadingSpinner } from "@/components/loading-spinner";

export const metadata = { title: "Design System Preview", robots: { index: false } };

export default function DesignSystemPreview() {
  return (
    <div className="space-y-12 py-6">
      {/* Header */}
      <div className="glass p-8 md:p-12 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Sparkles} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Design System Preview</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Midnight Graphite & Amber Theme</h1>
        <p className="text-muted max-w-2xl text-base md:text-lg">
          A premium DJ platform aesthetic featuring translucent glassmorphism cards, ambient violet-orange lighting, subtle borders, tactile button feedback, and fluid audio indicators.
        </p>
      </div>

      {/* Buttons & Indicators */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Buttons & Interactive States</h2>
        <div className="glass p-6 flex flex-wrap items-center gap-4">
          <AnimatedButton variant="primary">
            <Play size={16} aria-hidden /> Primary Action
          </AnimatedButton>
          <AnimatedButton variant="violet">
            <Disc size={16} aria-hidden /> Violet Accent
          </AnimatedButton>
          <AnimatedButton variant="ghost">
            Ghost Action <ArrowRight size={16} aria-hidden />
          </AnimatedButton>
          <AnimatedButton disabled>Disabled State</AnimatedButton>
        </div>
      </section>

      {/* Glass Icons & Loaders */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Icons & Loaders</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard hoverEffect={false} className="space-y-4">
            <h3 className="font-medium text-muted">Glass Icons</h3>
            <div className="flex items-center gap-4">
              <GlassIcon icon={Disc} variant="amber" />
              <GlassIcon icon={Sliders} variant="violet" />
              <GlassIcon icon={Shield} variant="default" />
              <GlassIcon icon={Calendar} variant="amber" />
            </div>
          </GlassCard>

          <GlassCard hoverEffect={false} className="space-y-4">
            <h3 className="font-medium text-muted">Dynamic Loaders</h3>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <AudioEqualizerLoader />
                <span className="text-sm text-muted">Equalizer</span>
              </div>
              <div className="flex items-center gap-3">
                <LoadingSpinner size={24} />
                <span className="text-sm text-muted">Loading Spinner</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Glass Cards & Hover Effects */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Glass Cards with Hover Lift & Border Illumination</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i}>
              <div className="aspect-square w-full rounded-xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 mb-4 flex items-center justify-center border border-white/5">
                <Disc size={48} className="text-[#ff9f43]/60" />
              </div>
              <h3 className="font-semibold text-lg">Underground Session #{i}</h3>
              <p className="text-sm text-muted mt-1">Deep house & minimal techno live stream recorded in studio.</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Skeletons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading Skeletons</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    </div>
  );
}

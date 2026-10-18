import { Metadata } from "next";
import { Camera, Sparkles } from "lucide-react";
import { GALLERY_ITEMS } from "@/lib/home-data";
import { GalleryClient } from "@/components/gallery-client";
import { GlassIcon } from "@/components/glass-icon";

export const metadata: Metadata = { title: "Photo Gallery" };

export default function GalleryPage() {
  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass p-8 md:p-12 space-y-4">
        <div className="flex items-center gap-3">
          <GlassIcon icon={Camera} variant="amber" size={24} />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Visual Archive</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Photo Gallery</h1>
        <p className="text-muted max-w-2xl text-base">
          Explore moments from club residencies, underground warehouse sessions, and festival main stages.
        </p>
      </div>

      <GalleryClient items={GALLERY_ITEMS} />
    </div>
  );
}

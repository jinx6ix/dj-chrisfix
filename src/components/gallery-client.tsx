"use client";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { GlassCard } from "@/components/glass-card";

export interface GalleryImage {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export function GalleryClient({ items }: { items: GalleryImage[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const categories = ["All", "Live", "Studio", "Festival", "Club"];
  const filtered = activeCategory === "All" ? items : items.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-8">
      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors ${activeCategory === cat ? "bg-[#ff9f43] text-black font-semibold" : "glass text-muted hover:text-white"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className="group block text-left w-full aspect-square relative rounded-2xl overflow-hidden glass border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff9f43]"
          >
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <span className="text-xs font-bold text-[#ff9f43] uppercase tracking-wider">{item.category}</span>
              <h3 className="text-lg font-bold text-white mt-1 flex items-center justify-between">
                {item.title}
                <ZoomIn size={18} className="text-white/80" />
              </h3>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              aria-label="Close image modal"
              className="absolute -top-12 right-0 text-white hover:text-[#ff9f43] p-2 transition-colors"
            >
              <X size={28} />
            </button>
            <img src={selectedImage.imageUrl} alt={selectedImage.title} className="max-h-[75vh] w-auto object-contain rounded-xl border border-white/10 shadow-2xl" />
            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-[#ff9f43] uppercase tracking-wider">{selectedImage.category}</span>
              <h3 className="text-xl font-bold text-white mt-1">{selectedImage.title}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

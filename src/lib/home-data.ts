export interface VideoItem {
  id: string;
  title: string;
  embedUrl: string;
  thumbnailUrl: string;
  duration: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export const LATEST_VIDEOS: VideoItem[] = [
  {
    id: "v1",
    title: "Live at Terminal Underground (Main Stage Set)",
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
    duration: "1:15:40",
  },
  {
    id: "v2",
    title: "Sunset Rooftop Session (Anjunadeep Vibes)",
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop",
    duration: "58:20",
  },
  {
    id: "v3",
    title: "Studio Masterclass: Analog Synth Jam & Live Mixing",
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop",
    duration: "32:10",
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    title: "Warehouse Residency",
    imageUrl: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=1000&auto=format&fit=crop",
    category: "Live",
  },
  {
    id: "g2",
    title: "Modular Setup",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop",
    category: "Studio",
  },
  {
    id: "g3",
    title: "Festival Crowd",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
    category: "Festival",
  },
  {
    id: "g4",
    title: "Night Vibes",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop",
    category: "Club",
  },
];

export const SOCIAL_LINKS = [
  { name: "SoundCloud", url: "https://soundcloud.com", handle: "@djchrisfix" },
  { name: "Mixcloud", url: "https://mixcloud.com", handle: "@djchrisfix" },
  { name: "YouTube", url: "https://youtube.com", handle: "@djchrisfix" },
  { name: "Instagram", url: "https://instagram.com", handle: "@djchrisfix" },
  { name: "TikTok", url: "https://tiktok.com", handle: "@djchrisfix" },
  { name: "Spotify", url: "https://spotify.com", handle: "DJ ChrisFix" },
];

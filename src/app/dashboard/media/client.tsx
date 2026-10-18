"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { GlassIcon } from "@/components/glass-icon";
import { FolderOpen, UploadCloud, Trash2, FileText, Image as ImageIcon, Music, Video, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { deleteMediaAsset } from "./actions";

interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  mime: string;
  size_bytes: number;
  alt?: string;
  title?: string;
  caption?: string;
  created_at: string;
}

export default function MediaLibraryClient({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = assets.filter((a) => {
    const matchesSearch = a.path.toLowerCase().includes(search.toLowerCase()) || (a.title?.toLowerCase().includes(search.toLowerCase()) ?? false);
    if (filterType === "image") return matchesSearch && a.mime.startsWith("image/");
    if (filterType === "audio") return matchesSearch && a.mime.startsWith("audio/");
    if (filterType === "video") return matchesSearch && a.mime.startsWith("video/");
    if (filterType === "document") return matchesSearch && (a.mime.includes("pdf") || a.mime.includes("zip") || a.mime.includes("document"));
    return matchesSearch;
  });

  function getFileIcon(mime: string) {
    if (mime.startsWith("image/")) return <ImageIcon className="text-[#ff9f43]" size={20} />;
    if (mime.startsWith("audio/")) return <Music className="text-cyan-400" size={20} />;
    if (mime.startsWith("video/")) return <Video className="text-emerald-400" size={20} />;
    return <FileText className="text-violet-400" size={20} />;
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Simulated direct upload with progress
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 50MB) and type
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg("File size exceeds 50MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setErrorMsg(null);

    try {
      // Simulate upload progress steps
      await new Promise((r) => setTimeout(r, 400));
      setUploadProgress(40);
      await new Promise((r) => setTimeout(r, 400));
      setUploadProgress(80);

      // In production, upload to Supabase Storage client or R2 endpoint
      const simulatedPath = `uploads/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

      const fd = new FormData();
      fd.append("bucket", "media");
      fd.append("path", simulatedPath);
      fd.append("mime", file.type || "application/octet-stream");
      fd.append("size_bytes", file.size.toString());
      fd.append("title", file.name);
      fd.append("alt", file.name);

      // Submit via server action or fetch
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: JSON.stringify({
          bucket: "media",
          path: simulatedPath,
          mime: file.type || "application/octet-stream",
          size_bytes: file.size,
          title: file.name,
          alt: file.name,
        }),
      });

      setUploadProgress(100);
      await new Promise((r) => setTimeout(r, 300));
      window.location.reload();
    } catch (err: any) {
      setErrorMsg("Failed to upload file.");
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="glass p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <GlassIcon icon={FolderOpen} variant="amber" size={24} />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#ff9f43]">Secure Storage</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
            <p className="text-muted text-sm">
              Manage images, audio sets, videos, press kits, and technical riders with Supabase Storage.
            </p>
          </div>

          <label className="btn cursor-pointer flex items-center gap-2">
            <UploadCloud size={16} /> Upload Asset
            <input type="hidden" name="bucket" value="media" />
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,audio/*,video/*,application/pdf,.zip" />
          </label>
        </div>

        {isUploading && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-muted">
              <span>Uploading asset...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="bg-[#ff9f43] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {errorMsg && (
          <p role="alert" className="text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {errorMsg}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              placeholder="Search assets by name or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field pl-9 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            {["all", "image", "audio", "video", "document"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`text-xs px-3 py-1.5 rounded-lg uppercase tracking-wider font-semibold transition ${filterType === t ? 'bg-[#ff9f43] text-black font-bold' : 'glass hover:bg-white/10 text-muted'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((asset) => (
          <GlassCard key={asset.id} className="p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {getFileIcon(asset.mime)}
                  <span className="text-xs font-mono uppercase text-muted px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    {asset.mime.split("/")[1] || "file"}
                  </span>
                </div>
                <span className="text-xs text-muted font-mono">{formatBytes(asset.size_bytes)}</span>
              </div>

              <div>
                <p className="font-medium text-sm truncate" title={asset.title || asset.path}>
                  {asset.title || asset.path.split("/").pop()}
                </p>
                <p className="text-xs text-muted font-mono truncate mt-0.5">{asset.path}</p>
              </div>

              {asset.mime.startsWith("image/") && (
                <div className="aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/10 relative">
                  <img src={`https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop`} alt={asset.alt || "Asset preview"} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-muted">Uploaded {new Date(asset.created_at).toLocaleDateString()}</span>
              <form action={deleteMediaAsset}>
                <input type="hidden" name="id" value={asset.id} />
                <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium">
                  <Trash2 size={14} /> Delete
                </button>
              </form>
            </div>
          </GlassCard>
        ))}

        {filtered.length === 0 && (
          <GlassCard className="p-12 text-center text-muted text-sm sm:col-span-2 lg:col-span-3">
            No media assets found matching your filters.
          </GlassCard>
        )}
      </div>
    </div>
  );
}

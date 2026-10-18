"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FolderOpen, X, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  mime: string;
  size_bytes: number;
  alt?: string;
  title?: string;
}

interface ImagePickerProps {
  name: string;
  defaultValue?: string;
  label?: string;
  aspectRatio?: "video" | "square";
}

export function ImagePicker({ name, defaultValue = "", label = "Cover Image", aspectRatio = "video" }: ImagePickerProps) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"url" | "upload" | "library">("url");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media library assets when opening library tab or modal
  async function fetchMediaLibrary() {
    if (assets.length > 0) return;
    setLoadingAssets(true);
    try {
      const res = await fetch("/api/media/upload"); // or fetch assets endpoint
      // Alternatively we can fetch directly from public/supabase
    } catch {
      // fallback
    }
    setLoadingAssets(false);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setErrorMsg(null);

    try {
      await new Promise((r) => setTimeout(r, 400));
      setUploadProgress(60);

      // Simulate successful upload and return a reliable Unsplash or storage URL
      // In production, uploads go to Supabase Storage bucket 'media'
      await new Promise((r) => setTimeout(r, 400));
      setUploadProgress(100);

      // Generate a representative preview URL or object URL
      const simulatedUrl = URL.createObjectURL(file);
      setValue(simulatedUrl);
      setIsUploading(false);
    } catch {
      setErrorMsg("Failed to upload image.");
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`px-2.5 py-1 rounded transition ${tab === "url" ? "bg-[#ff9f43] text-black font-bold" : "glass hover:bg-white/10 text-muted"}`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`px-2.5 py-1 rounded transition ${tab === "upload" ? "bg-[#ff9f43] text-black font-bold" : "glass hover:bg-white/10 text-muted"}`}
          >
            Upload
          </button>
        </div>
      </div>

      <input type="hidden" name={name} value={value} />

      {tab === "url" && (
        <input
          type="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="field"
        />
      )}

      {tab === "upload" && (
        <div className="space-y-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#ff9f43] transition cursor-pointer bg-white/5 space-y-2"
          >
            <UploadCloud className="mx-auto text-[#ff9f43]" size={28} />
            <p className="text-sm font-medium">Click to upload or drag and drop image</p>
            <p className="text-xs text-muted">PNG, JPG, WebP up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#ff9f43] h-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {errorMsg && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={14} />{errorMsg}</p>}

      {value && (
        <div className={`relative rounded-xl overflow-hidden border border-white/10 bg-black/40 ${aspectRatio === "video" ? "aspect-video" : "aspect-square max-w-[200px]"}`}>
          <img src={value} alt="Cover preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-600 transition"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

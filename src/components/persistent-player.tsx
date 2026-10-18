"use client";
import React from "react";
import { Play, Pause, Volume2, X, Disc } from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { fmtSeconds } from "@/lib/format";

export function PersistentPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, volume, togglePlay, seek, changeVolume, stop } = useAudio();

  if (!currentTrack) return null;

  return (
    <aside aria-label="Persistent Audio Player" className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 bg-[#09090e]/95 backdrop-blur-xl px-4 py-3">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
            {currentTrack.coverUrl ? (
              <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Disc size={20} className="text-muted" /></div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{currentTrack.title}</p>
            <p className="text-xs text-muted truncate">{currentTrack.artist || "DJ ChrisFix"}</p>
          </div>
        </div>

        {/* Playback Controls & Progress */}
        <div className="flex flex-col items-center gap-2 w-full md:w-2/4">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-10 h-10 rounded-full bg-[#ff9f43] text-black flex items-center justify-center hover:scale-105 transition-transform font-bold"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
          </div>

          <div className="w-full flex items-center gap-3 text-xs text-muted tabular-nums">
            <span>{fmtSeconds(Math.floor(currentTime))}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full accent-[#ff9f43] cursor-pointer h-1.5 bg-white/10 rounded-lg"
              aria-label="Seek track position"
            />
            <span>{fmtSeconds(Math.floor(duration))}</span>
          </div>
        </div>

        {/* Volume & Close */}
        <div className="flex items-center justify-end gap-4 w-full md:w-1/4">
          <div className="hidden sm:flex items-center gap-2">
            <Volume2 size={16} className="text-muted" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-20 accent-[#ff9f43] cursor-pointer h-1.5 bg-white/10 rounded-lg"
              aria-label="Volume control"
            />
          </div>
          <button
            onClick={stop}
            className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Close player"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

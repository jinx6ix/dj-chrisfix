"use client";
import React from "react";
import { Play, Pause } from "lucide-react";
import { useAudio } from "@/context/audio-context";
import { AnimatedButton } from "@/components/animated-button";

type Track = {
  id: string;
  title: string;
  artist?: string;
  coverUrl?: string | null;
  audioUrl?: string | null;
};

export function PlayButtonClient({ track }: { track: Track }) {
  const { currentTrack, isPlaying, playTrack } = useAudio();
  const isThisPlaying = currentTrack?.id === track.id && isPlaying;

  return (
    <AnimatedButton
      variant="primary"
      onClick={() => playTrack(track)}
      className="text-base px-8 py-4 flex items-center gap-2"
    >
      {isThisPlaying ? (
        <>
          <Pause size={20} fill="currentColor" /> Pause Mix
        </>
      ) : (
        <>
          <Play size={20} fill="currentColor" /> Play Mix
        </>
      )}
    </AnimatedButton>
  );
}

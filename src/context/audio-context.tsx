"use client";
import React, { createContext, useContext, useState, useRef, useEffect } from "react";

type Track = {
  id: string;
  title: string;
  artist?: string;
  coverUrl?: string | null;
  audioUrl?: string | null;
};

type AudioContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  changeVolume: (vol: number) => void;
  stop: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, []);

  const playTrack = (track: Track) => {
    if (!audioRef.current) return;
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }
    setCurrentTrack(track);
    if (track.audioUrl) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Audio playback error:", err);
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Audio playback error:", err);
      });
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const changeVolume = (vol: number) => {
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, currentTime, duration, volume, playTrack, togglePlay, seek, changeVolume, stop }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within an AudioProvider");
  return context;
}

// useAudioPlayer.ts
import { AudioContext } from "@/app/public/components/AudioProvider";
import { useContext } from "react";

export const useAudioPlayer = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("Must be used within <AudioProvider>");
  const { play, pause, seek, setVolume, isPlaying, audioRef, currentTrack, playbackPosition } = ctx;
  return { play, pause, seek, setVolume, isPlaying, audioRef, currentTrack, playbackPosition };
};

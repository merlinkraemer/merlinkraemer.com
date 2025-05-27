import { AudioContext } from "@/app/public/components/AudioProvider";
import { useContext } from "react";

export const useAudioQueue = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("Must be used within <AudioProvider>");
  const { queue, addToQueue, skipToNext, playTrack } = ctx;
  return { queue, addToQueue, skipToNext, playTrack };
};

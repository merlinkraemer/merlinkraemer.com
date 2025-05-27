"use client";

import { Track } from "@/generated/prisma";
import React, {
    createContext,
    useRef,
    useState,
    useEffect,
    ReactNode,
} from "react";

interface AudioContextType {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    play: () => void;
    pause: () => void;
    seek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setVolume: (vol: number) => void;
    isPlaying: boolean;
    currentTrack: Track | null;
    queue: Track[];
    addToQueue: (track: Track) => void;
    skipToNext: () => void;
    playTrack: (track: Track) => void;
    playbackPosition: number | null;
}

export const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [playbackPosition, setPlaybackPosition] = useState<number>(0)
    const [queue, setQueue] = useState<Track[]>([]);

    // Initialize the audio on client only
    useEffect(() => {
        if (typeof window !== "undefined") {
            audioRef.current = new Audio();

            const handleEnded = () => {
                skipToNext();
            };

            const handleTimeUpdate = () => {
                setPlaybackPosition(audioRef.current?.currentTime!)
            }

            audioRef.current.addEventListener("ended", handleEnded);
            audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
            return () => {
                audioRef.current?.removeEventListener("ended", handleEnded);
                audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate)
            };
        }
    }, []);

    const play = () => {
        audioRef.current?.play();
        setIsPlaying(true);
    };

    const pause = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const load = (track: Track) => {
        if (!audioRef.current) return;
        audioRef.current.src = process.env.NEXT_PUBLIC_R2_URL + track.trackBucketKey;
        audioRef.current.load();
        setCurrentTrack(track);
        setIsPlaying(false);
    };

    const playTrack = (track: Track) => {
        load(track);
        setTimeout(() => play(), 0);
    };

    const addToQueue = (track: Track) => {
        if (queue.length === 0) {
            load(track)
            play()
            return
        }
        setQueue((prev) => [...prev, track]);
    };

    const skipToNext = () => {
        if (queue.length === 0) {
            pause();
            setCurrentTrack(null);
            return;
        }
        const [next, ...rest] = queue;
        setQueue(rest);
        playTrack(next);
    };

    const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setPlaybackPosition(newTime); // Update state immediately
        }
    };

    const setVolume = (vol: number) => {
        if (audioRef.current) audioRef.current.volume = vol;
    };

    return (
        <AudioContext.Provider
            value={{
                audioRef,
                play,
                pause,
                seek,
                setVolume,
                isPlaying,
                currentTrack,
                queue,
                addToQueue,
                skipToNext,
                playTrack,
                playbackPosition
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

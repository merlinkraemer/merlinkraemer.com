'use client'
import React from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useAudioQueue } from "@/hooks/useAudioQueue";
import { formatDuration } from "@/lib/utils";

const PlayerUI = () => {
    const { play, pause, isPlaying, currentTrack, playbackPosition, seek, audioRef } = useAudioPlayer();
    const { skipToNext, queue } = useAudioQueue()

    return (
        <div className="border-t p-3 w-full h-full flex flex-col justify-between">
            <div className="truncate overflow-ellipsis whitespace-nowrap">
                <p className="inline-block animate-marquee">{currentTrack ? currentTrack.title : "None"}</p>
            </div>
            <div className="flex">
                <button onClick={isPlaying ? pause : play}>
                    {isPlaying ? "pause" : "play"}
                </button>
                <button onClick={skipToNext}>next</button>
                <p>({queue.length > 0 ? queue.length+ 1 : queue.length})</p>
            </div>
            <div className="flex gap-x-3">
                <p>{currentTrack && formatDuration(playbackPosition ?? 0)}</p>
                <input className="flex-1" type="range" max={audioRef.current?.duration ?? 0} value={playbackPosition ?? 0} onChange={seek} disabled={!currentTrack} />
                <p>{(currentTrack?.duration)}</p>
            </div>
        </div>
    );
};

export default PlayerUI;

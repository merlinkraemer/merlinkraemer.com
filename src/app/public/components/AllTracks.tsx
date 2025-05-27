'use client'
import { AlbumWithTracks } from "@/actions/db-tracks-actions";
import { Track } from "@/generated/prisma";
import { useAudioQueue } from "@/hooks/useAudioQueue";

export default function AllTracks({ albums }: { albums: AlbumWithTracks[] }) {
    const { addToQueue } = useAudioQueue();

    function handlePlay(track: Track) {
        addToQueue(track)

    }

    return (
        <div>
            {albums.map((album) => {
                return album.tracks.map((track) => {
                    return <div className="underline text-blue-700 cursor-pointer" key={track.id} onClick={() => handlePlay(track)}>{track.title}</div>
                })
            })}
        </div>
    )
};

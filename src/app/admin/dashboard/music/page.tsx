import { getAllAlbums } from "@/actions/db-tracks-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image'

const albumResult = await getAllAlbums()

export default function MusicPage() {

    if (!albumResult.success) return <div>{albumResult.error}</div>

    return (
        <div className="h-full w-full flex flex-col gap-y-5">
            <div className="w-full flex justify-end">
                <Link href="/admin/dashboard/music/tracks-upload"><Button>Upload Tracks</Button></Link>
            </div>
            <div className="flex flex-col gap-4">
                {albumResult.data.map((album) => {
                    return (
                        <div className="flex flex-col" >
                            <Link className="flex items-center justify-between gap-y-2 py-4 hover:bg-gray-500" href={`admin/dashboard/album/${album.id}`}>
                                <div className="h-32 aspect-square"><Image src={process.env.R2_PUBLIC_URL + album.albumArtBucketKey} alt={album.name} width={300} height={300}></Image></div>
                                <div className="text-4xl"> {album.name}</div>
                                <div></div>
                            </Link>
                            <div className="px-5 flex flex-col  p-3">{album.tracks.map((track, index) => {
                                return <div key={track.id} className="flex gap-x-3 p-3 items-between justify-between">
                                    <div>{index + 1}</div>
                                    <div className="text-start flex-1">{track.title}</div>
                                    <div>{track.duration}</div>
                                </div>
                            })}</div>
                        </div>
                    )
                })}

            </div>

        </div>
    )
};

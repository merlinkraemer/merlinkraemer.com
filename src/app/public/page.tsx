import { getAllImages } from "@/actions/db-images-actions"
import { getAllAlbums } from "@/actions/db-tracks-actions";
import Image from "next/image";
import AllTracks from "./components/AllTracks";

export default async function page() {
    const imagesResult = await getAllImages()
    const tracksResult = await getAllAlbums()

    if (!tracksResult.success) return <div>no tracks</div>
    if (!imagesResult.success) return <div>no images</div>

    return (
        <>
            <div className="flex flex-col md:flex-row flex-wrap items-center gap-y-3">
                {
                    imagesResult.data.map((image) => {
                        const bucketUrl = process.env.R2_PUBLIC_URL + image.imageBucketKey
                        return (
                            <div key={image.id} className="flex flex-wrap w-full md:w-64 px-3 aspect-square">
                                <Image src={bucketUrl} alt={image.caption} width={400} height={400} />
                            </div>
                        )
                    })
                }
            </div>
            <AllTracks albums={tracksResult.data} />
        </>

    )
};

import { getAllImages } from "@/actions/db-images-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image'

export default async function page() {
    const allImagesResult = await getAllImages();
    if (!allImagesResult.success) return <div>error loading images</div>

    return (
        <div className="h-full w-full flex flex-col items-center gap-y-5">
            <div className="w-full flex justify-end">
                <Link href="/admin/dashboard/art/image-upload"><Button>Upload Image</Button></Link>
            </div>

            <div className="flex gap-x-3 w-fit flex-wrap mx-auto border">
                {allImagesResult.data.map((image) => {
                    return (
                        <div key={image.id} className="inline-flex flex-col items-center">
                            <div className="w-48 aspect-square flex items-center justify-center">
                                <div className=""><Image key={image.imageBucketKey} src={process.env.R2_PUBLIC_URL + image.imageBucketKey} alt={image.caption} width={300} height={300} /></div>
                            </div>
                            <div>{image.name}</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
};

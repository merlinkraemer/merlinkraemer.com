'use server'
import { Image } from "@/generated/prisma";
import { logError } from "@/lib/logging";
import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/generic-types";

type ImageType = {
    name: string;
    caption: string;
    imageKey: string
}

export async function getAllImages(): Promise<ActionResult<Image[]>> {
    try {
        const images = await prisma.image.findMany({});
            return { success: true, data: images }
    } catch (error) {
        logError(error)
    }

    return { success: false, error: "failed to get images" }

}

export async function addImageToDb(formData: ImageType): Promise<ActionResult<null>> {
    try {
        await prisma.image.create({
            data: {
                name: formData.name,
                caption: formData.caption,
                imageBucketKey: formData.imageKey
            }
        })
        return { success: true, data: null }
    } catch (error) {
        logError(error)
        return { success: false, error: "prisma error failed to create image" }
    }
}


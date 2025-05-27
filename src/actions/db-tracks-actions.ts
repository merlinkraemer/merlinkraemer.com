'use server'
import { Prisma } from '@/generated/prisma'
import { logError } from '@/lib/logging'
import { prisma } from '@/lib/prisma'
import { ActionResult } from '@/types/generic-types'

export async function addAlbumToDb(formData: Prisma.AlbumCreateInput): Promise<ActionResult<null>> {
    try {
        await prisma.album.create({
            data: formData
        })
        return { success: true, data: null }
    } catch (error) {
        logError(error)
        return { success: false, error: "failed to create album in db" }

    }

}

export type AlbumWithTracks = Prisma.AlbumGetPayload<{ include: { tracks: true }}>

export async function getAllAlbums(): Promise<ActionResult<AlbumWithTracks[]>> {
    try {
        const albums = await prisma.album.findMany({
            include: {
                tracks: true
            }
        });
        return { success: true, data: albums }
    } catch (error) {
        logError(error)
        return { success: false, error: "db-tracks-actions couldnt get album" }
    }

}

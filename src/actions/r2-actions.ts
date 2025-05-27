'use server'

import { logError } from "@/lib/logging";
import { s3Client } from "@/lib/r2-bucket";
import { ActionResult } from "@/types/generic-types";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

type resultType = {
    url: string;
    uniqueKey: string
}
export async function getSignedUploadUrl(key: string): Promise<ActionResult<resultType>> {
    const uniqueKey = `(${key})-${randomUUID()}`
    const command = new PutObjectCommand({
        Key: uniqueKey,
        Bucket: process.env.R2_BUCKET_NAME,
    });

    try {
        const url = await getSignedUrl(
            s3Client,
            command,
            {
                expiresIn: 3600
            }
        )
        return { success: true, data: { url, uniqueKey } }
    } catch (error) {
        logError(error)
        return { success: false, error: "r2Error, getSignedUploadUrl" }
    }
}

export async function deleteFromBucket(key: string): Promise<ActionResult<null>> {
    const command = new DeleteObjectCommand({
        Key: key,
        Bucket: process.env.R2_BUCKET_NAME
    })

    try {
        await s3Client.send(command)
        return { success: true, data: null }
    } catch (error) {
        logError(error)
        return { success: false, error: "failed to delete object from bucket" }
    }
}

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Configure S3 client for R2
const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

async function listR2Images() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME,
        });

        const response = await s3Client.send(command);

        console.log('Images in R2 bucket:');
        if (response.Contents) {
            response.Contents.forEach((object, index) => {
                console.log(`${index + 1}. ${object.Key} (${object.Size} bytes)`);
            });
        } else {
            console.log('No images found in bucket');
        }
    } catch (error) {
        console.error('Error listing R2 images:', error);
    }
}

listR2Images();

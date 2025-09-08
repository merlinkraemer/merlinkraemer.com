import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

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

const RAILWAY_URL = 'https://merlins-internetbackend-production.up.railway.app';
const ADMIN_PASSWORD = 'R8p6CnAAEER#0E';

async function importImagesToRailway() {
    try {
        // List all objects in R2 bucket
        const command = new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME,
        });

        const response = await s3Client.send(command);

        if (!response.Contents) {
            console.log('No images found in bucket');
            return;
        }

        console.log(`Found ${response.Contents.length} images in R2 bucket`);

        // Import each image to Railway backend
        for (const object of response.Contents) {
            const fileName = object.Key;

            // Skip the test image we already have
            if (fileName === '1757368639252-nklepoud42b.png') {
                console.log(`Skipping test image: ${fileName}`);
                continue;
            }

            // Determine category and year based on filename
            let category = 'finished';
            let year = 2024;
            let alt = fileName.replace('.webp', '').replace('.png', '');
            let description = alt;

            // You can customize this logic based on your naming convention
            if (fileName.includes('IMG_')) {
                category = 'wip';
                year = 2025;
            }

            try {
                // Download image from R2
                const getCommand = new GetObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: fileName,
                });

                const imageResponse = await s3Client.send(getCommand);
                const imageBuffer = await imageResponse.Body.transformToByteArray();

                // Create FormData for upload
                const formData = new FormData();
                formData.append('image', new Blob([imageBuffer], { type: imageResponse.ContentType }), fileName);
                formData.append('alt', alt);
                formData.append('description', description);
                formData.append('category', category);
                formData.append('year', year.toString());
                formData.append('width', '1');

                // Upload to Railway backend
                const uploadResponse = await fetch(`${RAILWAY_URL}/api/gallery`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ADMIN_PASSWORD}`,
                    },
                    body: formData,
                });

                if (uploadResponse.ok) {
                    const result = await uploadResponse.json();
                    console.log(`Imported to Railway: ${fileName} -> ${result.id}`);
                } else {
                    const error = await uploadResponse.text();
                    console.error(`Error uploading ${fileName}:`, error);
                }
            } catch (error) {
                console.error(`Error importing ${fileName}:`, error.message);
            }
        }

        console.log('Import to Railway completed!');
    } catch (error) {
        console.error('Error during import:', error);
    }
}

importImagesToRailway();

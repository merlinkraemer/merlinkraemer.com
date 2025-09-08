import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const RAILWAY_URL = 'https://merlins-internetbackend-production.up.railway.app';
const ADMIN_PASSWORD = 'R8p6CnAAEER#0E';

// List of your existing images from R2
const images = [
    { fileName: 'Cozy-Bed.webp', category: 'finished', year: 2024, alt: 'Cozy-Bed', description: 'Cozy-Bed' },
    { fileName: 'IMG_0409.webp', category: 'wip', year: 2025, alt: 'IMG_0409', description: 'IMG_0409' },
    { fileName: 'IMG_0412.webp', category: 'wip', year: 2025, alt: 'IMG_0412', description: 'IMG_0412' },
    { fileName: 'IMG_0438.webp', category: 'wip', year: 2025, alt: 'IMG_0438', description: 'IMG_0438' },
    { fileName: 'IMG_0440.webp', category: 'wip', year: 2025, alt: 'IMG_0440', description: 'IMG_0440' },
    { fileName: 'IMG_0441.webp', category: 'wip', year: 2025, alt: 'IMG_0441', description: 'IMG_0441' },
    { fileName: 'IMG_0443.webp', category: 'wip', year: 2025, alt: 'IMG_0443', description: 'IMG_0443' },
    { fileName: 'IMG_0444.webp', category: 'wip', year: 2025, alt: 'IMG_0444', description: 'IMG_0444' },
    { fileName: 'Katze-in-Pflanze.webp', category: 'finished', year: 2024, alt: 'Katze-in-Pflanze', description: 'Katze-in-Pflanze' },
    { fileName: 'Sonnenritter.webp', category: 'finished', year: 2024, alt: 'Sonnenritter', description: 'Sonnenritter' },
    { fileName: 'Studio-Gatos.webp', category: 'finished', year: 2024, alt: 'Studio-Gatos', description: 'Studio-Gatos' },
    { fileName: 'Treibhaus.webp', category: 'finished', year: 2024, alt: 'Treibhaus', description: 'Treibhaus' },
    { fileName: 'pizzalady.webp', category: 'finished', year: 2024, alt: 'pizzalady', description: 'pizzalady' },
    { fileName: 'room1.webp', category: 'finished', year: 2024, alt: 'room1', description: 'room1' },
];

async function addImagesToRailway() {
    console.log(`Adding ${images.length} images to Railway backend...`);

    for (const image of images) {
        const imageUrl = `${process.env.R2_PUBLIC_URL}/${image.fileName}`;

        try {
            // Add existing image using the new endpoint
            const response = await fetch(`${RAILWAY_URL}/api/gallery/existing`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ADMIN_PASSWORD}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    src: imageUrl,
                    alt: image.alt,
                    description: image.description,
                    category: image.category,
                    year: image.year,
                    width: 1,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`Added: ${image.fileName} -> ${result.id}`);
            } else {
                const error = await response.text();
                console.error(`Error adding ${image.fileName}:`, error);
            }
        } catch (error) {
            console.error(`Error adding ${image.fileName}:`, error.message);
        }
    }

    console.log('All images added to Railway backend!');
}

addImagesToRailway();

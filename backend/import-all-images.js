import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// List of your existing images from R2 with proper sizing
const images = [
    { fileName: 'Cozy-Bed.webp', category: 'finished', year: 2024, alt: 'Cozy-Bed', description: 'Cozy-Bed', width: 2 },
    { fileName: 'IMG_0409.webp', category: 'wip', year: 2025, alt: 'IMG_0409', description: 'IMG_0409', width: 1 },
    { fileName: 'IMG_0412.webp', category: 'wip', year: 2025, alt: 'IMG_0412', description: 'IMG_0412', width: 1 },
    { fileName: 'IMG_0438.webp', category: 'wip', year: 2025, alt: 'IMG_0438', description: 'IMG_0438', width: 2 },
    { fileName: 'IMG_0440.webp', category: 'wip', year: 2025, alt: 'IMG_0440', description: 'IMG_0440', width: 1 },
    { fileName: 'IMG_0441.webp', category: 'wip', year: 2025, alt: 'IMG_0441', description: 'IMG_0441', width: 2 },
    { fileName: 'IMG_0443.webp', category: 'wip', year: 2025, alt: 'IMG_0443', description: 'IMG_0443', width: 1 },
    { fileName: 'IMG_0444.webp', category: 'wip', year: 2025, alt: 'IMG_0444', description: 'IMG_0444', width: 2 },
    { fileName: 'Katze-in-Pflanze.webp', category: 'finished', year: 2024, alt: 'Katze-in-Pflanze', description: 'Katze-in-Pflanze', width: 2 },
    { fileName: 'Sonnenritter.webp', category: 'finished', year: 2024, alt: 'Sonnenritter', description: 'Sonnenritter', width: 1 },
    { fileName: 'Studio-Gatos.webp', category: 'finished', year: 2024, alt: 'Studio-Gatos', description: 'Studio-Gatos', width: 2 },
    { fileName: 'Treibhaus.webp', category: 'finished', year: 2024, alt: 'Treibhaus', description: 'Treibhaus', width: 1 },
    { fileName: 'pizzalady.webp', category: 'finished', year: 2024, alt: 'pizzalady', description: 'pizzalady', width: 2 },
    { fileName: 'room1.webp', category: 'finished', year: 2024, alt: 'room1', description: 'room1', width: 1 },
];

async function importAllImages() {
    try {
        console.log(`Importing ${images.length} images to local database...`);

        for (const image of images) {
            const imageUrl = `${process.env.R2_PUBLIC_URL}/${image.fileName}`;

            try {
                // Check if image already exists in database
                const existingImage = await prisma.galleryImage.findUnique({
                    where: { src: imageUrl }
                });

                if (existingImage) {
                    console.log(`Image already exists: ${image.fileName}`);
                    continue;
                }

                // Create database record
                const newImage = await prisma.galleryImage.create({
                    data: {
                        src: imageUrl,
                        alt: image.alt,
                        description: image.description,
                        category: image.category,
                        year: image.year,
                        width: image.width,
                        order: 0,
                    },
                });

                console.log(`Imported: ${image.fileName} -> ${newImage.id} (width: ${image.width})`);
            } catch (error) {
                console.error(`Error importing ${image.fileName}:`, error.message);
            }
        }

        console.log('Import completed!');

        // Show final count
        const totalImages = await prisma.galleryImage.count();
        const finishedImages = await prisma.galleryImage.count({ where: { category: 'finished' } });
        const wipImages = await prisma.galleryImage.count({ where: { category: 'wip' } });

        console.log(`\nFinal counts:`);
        console.log(`- Total images: ${totalImages}`);
        console.log(`- Finished: ${finishedImages}`);
        console.log(`- WIP: ${wipImages}`);

    } catch (error) {
        console.error('Error during import:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importAllImages();

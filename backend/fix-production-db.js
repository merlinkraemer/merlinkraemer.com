import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Use production database URL from Railway
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.RAILWAY_DATABASE_URL
    }
  }
});

// Mapping of database alt names to actual R2 filenames
const imageMapping = {
  'Studio Gatos': 'Studio-Gatos.webp',
  'Room 1': 'room1.webp',
  'Katze in Pflanze': 'Katze-in-Pflanze.webp',
  'Treibhaus': 'Treibhaus.webp',
  'Cozy Bed': 'Cozy-Bed.webp',
  'Sonnenritter': 'Sonnenritter.webp',
  'Pizzalady': 'pizzalady.webp',
  'WIP 2': 'IMG_0409.webp'
};

async function fixProductionDatabase() {
  try {
    console.log('🔧 Fixing Railway production database...\n');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
    console.log('Railway DB URL:', process.env.RAILWAY_DATABASE_URL ? 'Found' : 'Not found');

    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to production database\n');

    for (const [altName, fileName] of Object.entries(imageMapping)) {
      // Find the image by alt name
      const image = await prisma.galleryImage.findFirst({
        where: { alt: altName }
      });

      if (image) {
        const newUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
        
        console.log(`Updating: ${altName}`);
        console.log(`  Old URL: ${image.src}`);
        console.log(`  New URL: ${newUrl}`);

        // Update the image URL
        await prisma.galleryImage.update({
          where: { id: image.id },
          data: { src: newUrl }
        });

        console.log(`  ✅ Updated successfully\n`);
      } else {
        console.log(`❌ Image not found: ${altName}\n`);
      }
    }

    console.log('🎉 Production database has been fixed!');
    
    // Show final results
    const allImages = await prisma.galleryImage.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }]
    });

    console.log('\n📊 Final production database contents:');
    allImages.forEach((img, index) => {
      console.log(`${index + 1}. ${img.alt} -> ${img.src}`);
    });

  } catch (error) {
    console.error('❌ Error fixing production database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionDatabase();

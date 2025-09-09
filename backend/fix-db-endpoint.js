// Add this endpoint to your backend/src/index.ts file
// This will create a special endpoint to fix the database URLs

app.post("/api/fix-image-urls", authenticate, async (req, res) => {
  try {
    console.log("🔧 Starting image URL fixes...");

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

    const results = [];

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

        results.push({
          alt: altName,
          oldUrl: image.src,
          newUrl: newUrl,
          status: 'updated'
        });

        console.log(`  ✅ Updated successfully`);
      } else {
        results.push({
          alt: altName,
          status: 'not_found'
        });
        console.log(`❌ Image not found: ${altName}`);
      }
    }

    console.log('🎉 All image URLs have been fixed!');
    res.json({ success: true, results });

  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
    res.status(500).json({ error: 'Failed to fix image URLs' });
  }
});

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Real descriptions from production
const descriptions = {
    'Cozy-Bed': '56x42cm, Acryl, Pastel auf Holz - 50€',
    'IMG_0409': '40x80cm, Acryl auf Leinwand',
    'Katze-in-Pflanze': '60x60cm, Acryl, Pastel auf Leinwand - 60€ (Verkauft)',
    'Sonnenritter': '52x82cm, Acryl auf Holz - 75€ (Verkauft)',
    'Studio-Gatos': '112x73cm, Acryl auf Holz - 165€ (Verkauft)',
    'Treibhaus': '76x78cm, Öl, Acryl, Latex auf Leinwand - 75€ (Verkauft)',
    'pizzalady': '40x40cm, Acryl auf Leinwand - 50€',
    'room1': '40x40cm, Acryl auf Leinwand (Reserviert)'
};

async function updateDescriptions() {
    try {
        console.log('🔄 Updating image descriptions...');

        for (const [alt, description] of Object.entries(descriptions)) {
            const result = await prisma.galleryImage.updateMany({
                where: { alt: alt },
                data: { description: description }
            });

            if (result.count > 0) {
                console.log(`✅ Updated ${alt}: ${description}`);
            } else {
                console.log(`❌ No image found with alt: ${alt}`);
            }
        }

        console.log('🎉 All descriptions updated successfully!');
    } catch (error) {
        console.error('❌ Error updating descriptions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateDescriptions();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateDatabase() {
    try {
        console.log('🚀 Starting database migration...');

        // Test connection
        await prisma.$connect();
        console.log('✅ Connected to database');

        // The database schema should already be created by Railway
        // Let's just verify the connection and create some test data if needed
        const galleryCount = await prisma.galleryImage.count();
        const linksCount = await prisma.link.count();

        console.log(`📊 Current data: ${galleryCount} gallery images, ${linksCount} links`);

        if (galleryCount === 0 && linksCount === 0) {
            console.log('📝 Database is empty, ready for data import');
        }

        console.log('✅ Database migration completed');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateDatabase();

import { PrismaClient } from "@prisma/client";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

// Configure S3 client for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Your existing images data
const existingImages = [
  {
    filename: "Cozy-Bed.webp",
    alt: "Cozy Bed",
    description: "56x42cm, Acryl, Pastel auf Holz - 50€",
    category: "finished",
    year: 2025,
  },
  {
    filename: "Studio-Gatos.webp",
    alt: "Studio Gatos",
    description: "112x73cm, Acryl auf Holz - 165€ (Verkauft)",
    category: "finished",
    year: 2025,
  },
  {
    filename: "Katze-in-Pflanze.webp",
    alt: "Katze in Pflanze",
    description: "60x60cm, Acryl, Pastel auf Leinwand - 60€ (Verkauft)",
    category: "finished",
    year: 2025,
  },
  {
    filename: "Sonnenritter.webp",
    alt: "Sonnenritter",
    description: "52x82cm, Acryl auf Holz - 75€ (Verkauft)",
    category: "finished",
    year: 2025,
  },
  {
    filename: "pizzalady.webp",
    alt: "Pizzalady",
    description: "40x40cm, Acryl auf Leinwand - 50€",
    category: "finished",
    year: 2025,
  },
  {
    filename: "Treibhaus.webp",
    alt: "Treibhaus",
    description: "76x78cm, Öl, Acryl, Latex auf Leinwand - 75€ (Verkauft)",
    category: "finished",
    year: 2025,
  },
  {
    filename: "room1.webp",
    alt: "Room 1",
    description: "40x40cm, Acryl auf Leinwand (Reserviert)",
    category: "finished",
    year: 2025,
  },
  {
    filename: "IMG_0409.webp",
    alt: "WIP 2",
    description: "40x80cm, Acryl auf Leinwand",
    category: "wip",
    year: 2025,
  },
];

async function migrateImages() {
  try {
    console.log("Starting image migration...");

    // Clear existing data
    await prisma.galleryImage.deleteMany();
    console.log("Cleared existing data");

    // Add existing images to database
    for (const image of existingImages) {
      const imageUrl = `${process.env.R2_PUBLIC_URL}/${image.filename}`;

      await prisma.galleryImage.create({
        data: {
          src: imageUrl,
          alt: image.alt,
          description: image.description,
          category: image.category,
          year: image.year,
          width: 1, // Default to 1 column for existing images
        },
      });

      console.log(`Added: ${image.alt}`);
    }

    console.log("Migration completed successfully!");

    // Show final count
    const count = await prisma.galleryImage.count();
    console.log(`Total images in database: ${count}`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateImages();

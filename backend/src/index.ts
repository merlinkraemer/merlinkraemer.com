import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Configure S3 client for R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Simple auth middleware
const authenticate = (req: any, res: any, next: any) => {
  const password = req.headers.authorization?.replace("Bearer ", "");
  if (password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Routes

// Get all gallery images
app.get("/api/gallery", async (req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    // Group by category
    const galleryData = {
      finished: images.filter((img) => img.category === "finished"),
      wip: images.filter((img) => img.category === "wip"),
    };

    res.json(galleryData);
  } catch (error) {
    console.error("Error fetching gallery:", error);

    // Return fallback data if database is not available
    const fallbackData = {
      finished: [],
      wip: [],
    };

    res.json(fallbackData);
  }
});

// Upload and add new image
app.post(
  "/api/gallery",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const { alt, description, category, year, width } = req.body;

      if (!alt || !description || !category || !year) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate width (1-7)
      const widthValue = width ? parseInt(width) : 1;
      if (widthValue < 1 || widthValue > 7) {
        return res.status(400).json({ error: "Width must be between 1 and 7" });
      }

      // Generate unique filename
      const fileExtension = req.file.originalname.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExtension}`;

      // Upload to R2
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      console.log("Uploading to R2:", {
        bucket: process.env.R2_BUCKET_NAME,
        key: fileName,
        size: req.file.buffer.length,
        type: req.file.mimetype,
      });

      const uploadResult = await s3Client.send(uploadCommand);
      console.log("R2 upload result:", uploadResult);

      // Create database record
      const imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
      const newImage = await prisma.galleryImage.create({
        data: {
          src: imageUrl,
          alt,
          description,
          category,
          year: parseInt(year),
          width: widthValue,
        },
      });

      res.json(newImage);
    } catch (error: any) {
      console.error("Error creating image:", {
        message: error.message,
        stack: error.stack,
        body: req.body,
      });
      res.status(500).json({ error: "Failed to create image" });
    }
  }
);

// Update image
app.put("/api/gallery/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { alt, description, category, year, order, width } = req.body;

    // Validate width if provided
    if (width) {
      const widthValue = parseInt(width);
      if (widthValue < 1 || widthValue > 7) {
        return res.status(400).json({ error: "Width must be between 1 and 7" });
      }
    }

    const updatedImage = await prisma.galleryImage.update({
      where: { id },
      data: {
        alt,
        description,
        category,
        year: year ? parseInt(year) : undefined,
        order: order ? parseInt(order) : undefined,
        width: width ? parseInt(width) : undefined,
      },
    });

    res.json(updatedImage);
  } catch (error: any) {
    console.error(`Error updating image ${req.params.id}:`, {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: `Failed to update image ${req.params.id}` });
  }
});

// Delete image
app.delete("/api/gallery/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    // Get image to extract filename for R2 deletion
    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Delete from database first
    await prisma.galleryImage.delete({ where: { id } });

    // Then, delete from R2
    try {
      const fileName = image.src.split("/").pop();
      if (fileName) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: fileName!,
        });
        await s3Client.send(deleteCommand);
      }
    } catch (s3Error: any) {
      // If S3 deletion fails, log it but don't fail the whole request,
      // as the database entry is already gone.
      console.error(`Failed to delete image ${id} from S3/R2:`, {
        message: s3Error.message,
        stack: s3Error.stack,
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error(`Error deleting image ${id}:`, {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: `Failed to delete image ${id}` });
  }
});

// Add existing image (for importing from R2)
app.post("/api/gallery/existing", authenticate, async (req, res) => {
  try {
    const { src, alt, description, category, year, width } = req.body;

    if (!src || !alt || !description || !category || !year) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate width (1-7)
    const widthValue = width ? parseInt(width) : 1;
    if (widthValue < 1 || widthValue > 7) {
      return res.status(400).json({ error: "Width must be between 1 and 7" });
    }

    // Create database record
    const newImage = await prisma.galleryImage.create({
      data: {
        src,
        alt,
        description,
        category,
        year: parseInt(year),
        width: widthValue,
      },
    });

    res.json(newImage);
  } catch (error: any) {
    console.error("Error creating existing image:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: "Failed to create existing image" });
  }
});

// Simple auth endpoint
app.post("/api/auth", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// Fix image URLs endpoint (admin only)
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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

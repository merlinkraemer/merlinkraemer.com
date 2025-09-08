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
    res.status(500).json({ error: "Failed to fetch gallery" });
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
    } catch (error) {
      console.error("Error creating image:", error);
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
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ error: "Failed to update image" });
  }
});

// Delete image
app.delete("/api/gallery/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Get image to extract filename for R2 deletion
    const image = await prisma.galleryImage.findUnique({ where: { id } });
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Extract filename from URL
    const fileName = image.src.split("/").pop();

    // Delete from R2
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: fileName!,
    });

    await s3Client.send(deleteCommand);

    // Delete from database
    await prisma.galleryImage.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
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

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

      const { alt, description, category, year } = req.body;

      if (!alt || !description || !category || !year) {
        return res.status(400).json({ error: "Missing required fields" });
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

      // Get the next order value for this category
      const lastImage = await prisma.galleryImage.findFirst({
        where: { category },
        orderBy: { order: "desc" },
      });
      const nextOrder = lastImage ? lastImage.order + 1 : 0;

      // Create database record
      const imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
      const newImage = await prisma.galleryImage.create({
        data: {
          src: imageUrl,
          alt,
          description,
          category,
          year: parseInt(year),
          width: 1,
          order: nextOrder,
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
    const { src, alt, description, category, year } = req.body;

    if (!src || !alt || !description || !category || !year) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create database record
    const newImage = await prisma.galleryImage.create({
      data: {
        src,
        alt,
        description,
        category,
        year: parseInt(year),
        width: 1,
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
      "Studio Gatos": "Studio-Gatos.webp",
      "Room 1": "room1.webp",
      "Katze in Pflanze": "Katze-in-Pflanze.webp",
      Treibhaus: "Treibhaus.webp",
      "Cozy Bed": "Cozy-Bed.webp",
      Sonnenritter: "Sonnenritter.webp",
      Pizzalady: "pizzalady.webp",
      "WIP 2": "IMG_0409.webp",
    };

    const results = [];

    for (const [altName, fileName] of Object.entries(imageMapping)) {
      // Find the image by alt name
      const image = await prisma.galleryImage.findFirst({
        where: { alt: altName },
      });

      if (image) {
        const newUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

        console.log(`Updating: ${altName}`);
        console.log(`  Old URL: ${image.src}`);
        console.log(`  New URL: ${newUrl}`);

        // Update the image URL
        await prisma.galleryImage.update({
          where: { id: image.id },
          data: { src: newUrl },
        });

        results.push({
          alt: altName,
          oldUrl: image.src,
          newUrl: newUrl,
          status: "updated",
        });

        console.log(`  ✅ Updated successfully`);
      } else {
        results.push({
          alt: altName,
          status: "not_found",
        });
        console.log(`❌ Image not found: ${altName}`);
      }
    }

    console.log("🎉 All image URLs have been fixed!");
    res.json({ success: true, results });
  } catch (error) {
    console.error("❌ Error fixing image URLs:", error);
    res.status(500).json({ error: "Failed to fix image URLs" });
  }
});

// Links management endpoints
// Get all links
app.get("/api/links", async (req, res) => {
  try {
    const links = await prisma.link.findMany({
      orderBy: { order: "asc" },
    });
    res.json(links);
  } catch (error: any) {
    console.error("Error fetching links:", error);
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

// Reorder links (must be before /:id routes)
app.put("/api/links/reorder", authenticate, async (req, res) => {
  try {
    const { links } = req.body;

    if (!Array.isArray(links)) {
      return res.status(400).json({ error: "Links array is required" });
    }

    // Update order for each link
    const updatePromises = links.map((link: any, index: number) =>
      prisma.link.update({
        where: { id: link.id },
        data: { order: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error reordering links:", error);
    res.status(500).json({ error: "Failed to reorder links" });
  }
});

// Create new link
app.post("/api/links", authenticate, async (req, res) => {
  try {
    const { text, url } = req.body;

    if (!text || !url) {
      return res.status(400).json({ error: "Text and URL are required" });
    }

    // Get the highest order number
    const lastLink = await prisma.link.findFirst({
      orderBy: { order: "desc" },
    });

    const newOrder = lastLink ? lastLink.order + 1 : 1;

    const link = await prisma.link.create({
      data: {
        text,
        url,
        order: newOrder,
      },
    });

    res.json(link);
  } catch (error: any) {
    console.error("Error creating link:", error);
    res.status(500).json({ error: "Failed to create link" });
  }
});

// Update link
app.put("/api/links/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, url } = req.body;

    console.log("Update link request:", { id, text, url });
    console.log("Parsed id:", parseInt(id));

    const link = await prisma.link.update({
      where: { id: parseInt(id) },
      data: { text, url },
    });

    res.json(link);
  } catch (error: any) {
    console.error("Error updating link:", error);
    res.status(500).json({ error: "Failed to update link" });
  }
});

// Delete link
app.delete("/api/links/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.link.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting link:", error);
    res.status(500).json({ error: "Failed to delete link" });
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

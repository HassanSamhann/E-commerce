import { Router, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import { authenticate, requireTenant, AuthRequest } from "../middlewares/auth.middleware";
import multer from "multer";
import path from "path";
import fs from "fs";
import { supabase } from "../lib/supabase";

const router = Router();
router.use(authenticate, requireTenant);

// Ensure uploads folder exists (fallback for static files if any pre-existing)
const uploadsDir = path.join(process.cwd(), "uploads");
try {
  if (!fs.existsSync(uploadsDir) && !process.env.VERCEL) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (error) {
  console.warn("Failed to create uploads directory on startup (read-only filesystem):", error);
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// POST /api/media/upload - Upload file to Supabase Storage
router.post("/upload", upload.single("file"), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Please upload a file" });
      return;
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const uniqueFileName = `${req.tenant!.id}/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

    const { data, error } = await supabase.storage
      .from("media")
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      res.status(500).json({ error: `Upload failed: ${error.message}` });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("media")
      .getPublicUrl(uniqueFileName);

    const media = await prisma.media.create({
      data: {
        tenantId: req.tenant!.id,
        url: publicUrl,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    res.status(201).json({ media, url: publicUrl });
  } catch (error) {
    next(error);
  }
});

// GET /api/media
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = "1", limit = "30" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where: { tenantId: req.tenant!.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.media.count({ where: { tenantId: req.tenant!.id } }),
    ]);

    res.json({ media, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    next(error);
  }
});

// POST /api/media — Save media record (after Cloudinary upload from frontend)
router.post("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { url, publicId, filename, mimeType, size, width, height } = req.body;

    const media = await prisma.media.create({
      data: {
        tenantId: req.tenant!.id,
        url,
        publicId,
        filename,
        mimeType,
        size,
        width,
        height,
      },
    });

    res.status(201).json({ media });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/media/:id
router.delete("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const media = await prisma.media.findFirst({
      where: { id: req.params.id, tenantId: req.tenant!.id },
    });

    if (!media) {
      res.status(404).json({ error: "Media not found" });
      return;
    }

    await prisma.media.delete({ where: { id: media.id } });
    res.json({ message: "Media deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import { body, validationResult } from "express-validator";
import slugify from "slugify";
import { authenticate, requireTenant, AuthRequest, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate, requireTenant);

// GET /api/categories
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { tenantId: req.tenant!.id },
      include: {
        _count: { select: { products: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// POST /api/categories
router.post(
  "/",
  requireRole("OWNER", "ADMIN"),
  [body("name").trim().notEmpty().withMessage("Category name required")],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, description, imageUrl, parentId, sortOrder } = req.body;
      let slug = slugify(name, { lower: true, strict: true });

      const existingSlug = await prisma.category.findFirst({
        where: { tenantId: req.tenant!.id, slug },
      });
      if (existingSlug) slug = `${slug}-${Date.now()}`;

      const category = await prisma.category.create({
        data: {
          tenantId: req.tenant!.id,
          name,
          slug,
          description,
          imageUrl,
          parentId,
          sortOrder: sortOrder ?? 0,
        },
      });
      res.status(201).json({ category });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/categories/:id
router.put(
  "/:id",
  requireRole("OWNER", "ADMIN"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.category.findFirst({
        where: { id: req.params.id, tenantId: req.tenant!.id },
      });
      if (!existing) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      const { name, description, imageUrl, parentId, sortOrder, isActive } = req.body;

      const category = await prisma.category.update({
        where: { id: existing.id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(parentId !== undefined && { parentId }),
          ...(sortOrder !== undefined && { sortOrder }),
          ...(isActive !== undefined && { isActive }),
        },
      });
      res.json({ category });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/categories/:id
router.delete(
  "/:id",
  requireRole("OWNER", "ADMIN"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.category.findFirst({
        where: { id: req.params.id, tenantId: req.tenant!.id },
      });
      if (!existing) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      await prisma.category.delete({ where: { id: existing.id } });
      res.json({ message: "Category deleted" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

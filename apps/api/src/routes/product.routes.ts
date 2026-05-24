import { Router, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import { body, query, validationResult } from "express-validator";
import slugify from "slugify";
import { authenticate, requireTenant, AuthRequest, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate, requireTenant);

// ─── GET /api/products ────────────────────────────────────────────────────────
router.get(
  "/",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const {
        page = "1",
        limit = "20",
        search = "",
        status,
        categoryId,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query as Record<string, string>;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const where: Record<string, unknown> = {
        tenantId: req.tenant!.id,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(status && { status }),
        ...(categoryId && { categoryId }),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true } },
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            _count: { select: { variants: true, orderItems: true } },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: parseInt(limit),
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/products ───────────────────────────────────────────────────────
router.post(
  "/",
  requireRole("OWNER", "ADMIN", "STAFF"),
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price required"),
    body("quantity").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["ACTIVE", "DRAFT", "ARCHIVED"]),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Check product limit
      const plan = req.tenant!.subscription?.plan;
      if (plan) {
        const productCount = await prisma.product.count({
          where: { tenantId: req.tenant!.id, status: { not: "ARCHIVED" } },
        });
        if (productCount >= plan.maxProducts) {
          res.status(403).json({
            error: `Your plan allows maximum ${plan.maxProducts} products. Upgrade to add more.`,
          });
          return;
        }
      }

      const {
        name, nameEn, description, descriptionEn, price, comparePrice, costPrice,
        sku, barcode, quantity, trackQuantity, weight,
        status, isFeatured, categoryId, tags, images, variants,
      } = req.body;

      // Generate unique slug
      let slug = slugify(name, { lower: true, strict: true });
      const existingSlug = await prisma.product.findFirst({
        where: { tenantId: req.tenant!.id, slug },
      });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }

      const product = await prisma.product.create({
        data: {
          tenantId: req.tenant!.id,
          name,
          nameEn,
          slug,
          description,
          descriptionEn,
          price,
          comparePrice,
          costPrice,
          sku,
          barcode,
          quantity: quantity ?? 0,
          trackQuantity: trackQuantity ?? true,
          weight,
          status: status ?? "DRAFT",
          isFeatured: isFeatured ?? false,
          categoryId,
          tags: tags ?? [],
          images: images
            ? {
                create: images.map(
                  (img: { url: string; altText?: string }, i: number) => ({
                    url: img.url,
                    altText: img.altText,
                    sortOrder: i,
                  })
                ),
              }
            : undefined,
          variants: variants
            ? {
                create: variants.map(
                  (v: { name: string; sku?: string; price: number; quantity?: number; options?: any }) => ({
                    name: v.name,
                    sku: v.sku,
                    price: v.price,
                    quantity: v.quantity ?? 0,
                    options: v.options ?? {},
                  })
                ),
              }
            : undefined,
        },
        include: {
          category: true,
          images: true,
          variants: true,
        },
      });

      res.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /api/products/:id ───────────────────────────────────────────────────
router.get(
  "/:id",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await prisma.product.findFirst({
        where: { id: req.params.id, tenantId: req.tenant!.id },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          variants: true,
        },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      res.json({ product });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /api/products/:id ───────────────────────────────────────────────────
router.put(
  "/:id",
  requireRole("OWNER", "ADMIN", "STAFF"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.product.findFirst({
        where: { id: req.params.id, tenantId: req.tenant!.id },
      });

      if (!existing) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const {
        name, nameEn, description, descriptionEn, price, comparePrice, costPrice,
        sku, barcode, quantity, trackQuantity, weight,
        status, isFeatured, categoryId, tags, images, variants,
      } = req.body;

      const product = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          ...(name && { name }),
          ...(nameEn !== undefined && { nameEn }),
          ...(description !== undefined && { description }),
          ...(descriptionEn !== undefined && { descriptionEn }),
          ...(price !== undefined && { price }),
          ...(comparePrice !== undefined && { comparePrice }),
          ...(costPrice !== undefined && { costPrice }),
          ...(sku !== undefined && { sku }),
          ...(barcode !== undefined && { barcode }),
          ...(quantity !== undefined && { quantity }),
          ...(trackQuantity !== undefined && { trackQuantity }),
          ...(weight !== undefined && { weight }),
          ...(status && { status }),
          ...(isFeatured !== undefined && { isFeatured }),
          ...(categoryId !== undefined && { categoryId }),
          ...(tags && { tags }),
          ...(images && {
            images: {
              deleteMany: {},
              create: images.map(
                (img: { url: string; altText?: string }, i: number) => ({
                  url: img.url,
                  altText: img.altText,
                  sortOrder: i,
                })
              ),
            },
          }),
          ...(variants && {
            variants: {
              deleteMany: {},
              create: variants.map(
                (v: { name: string; sku?: string; price: number; quantity?: number; options?: any }) => ({
                  name: v.name,
                  sku: v.sku,
                  price: v.price,
                  quantity: v.quantity ?? 0,
                  options: v.options ?? {},
                })
              ),
            },
          }),
        },
        include: { category: true, images: true, variants: true },
      });

      res.json({ product });
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
router.delete(
  "/:id",
  requireRole("OWNER", "ADMIN"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await prisma.product.findFirst({
        where: { id: req.params.id, tenantId: req.tenant!.id },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      await prisma.product.delete({ where: { id: product.id } });
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/products/:id/images ───────────────────────────────────────────
router.post(
  "/:id/images",
  requireRole("OWNER", "ADMIN", "STAFF"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await prisma.product.findFirst({
        where: { id: req.params.id, tenantId: req.tenant!.id },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const { url, altText } = req.body;
      const existingCount = await prisma.productImage.count({
        where: { productId: product.id },
      });

      const image = await prisma.productImage.create({
        data: { productId: product.id, url, altText, sortOrder: existingCount },
      });

      res.status(201).json({ image });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/products/:id/variants ─────────────────────────────────────────
router.post(
  "/:id/variants",
  requireRole("OWNER", "ADMIN", "STAFF"),
  [
    body("name").notEmpty().withMessage("Variant name required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price required"),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await prisma.product.findFirst({
        where: { id: req.params.id, tenantId: req.tenant!.id },
      });

      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const { name, sku, price, quantity, options } = req.body;

      const variant = await prisma.productVariant.create({
        data: { productId: product.id, name, sku, price, quantity: quantity ?? 0, options: options ?? {} },
      });

      res.status(201).json({ variant });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

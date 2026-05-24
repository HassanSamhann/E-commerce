import { Router, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

// ─── GET /api/admin/tenants ────────────────────────────────────────────────────
// List all tenants with owner information and entity counts
router.get(
  "/tenants",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const tenants = await prisma.tenant.findMany({
        include: {
          members: {
            where: { role: "OWNER" },
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          _count: {
            select: { products: true, orders: true, customers: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ tenants });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/admin/tenants ───────────────────────────────────────────────────
// Manually create a new store and create/assign its owner
router.post(
  "/tenants",
  [
    body("ownerName").trim().notEmpty().withMessage("Owner name is required"),
    body("ownerEmail").isEmail().withMessage("Valid owner email is required"),
    body("ownerPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("storeName").trim().notEmpty().withMessage("Store name is required"),
    body("storeSlug")
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage("Slug can only contain lowercase letters, numbers, and hyphens"),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { ownerName, ownerEmail, ownerPassword, storeName, storeSlug } = req.body;

      // Check if email already registered
      let user = await prisma.user.findUnique({ where: { email: ownerEmail } });
      
      // Check if slug already taken
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug: storeSlug },
      });
      if (existingTenant) {
        res.status(409).json({ error: "Store URL (slug) is already taken" });
        return;
      }

      const hashedPassword = await bcrypt.hash(ownerPassword, 12);

      // Get starter or professional plan
      const starterPlan = await prisma.subscriptionPlan.findFirst({
        where: { slug: "starter", isActive: true },
        orderBy: { sortOrder: "asc" },
      });

      const result = await prisma.$transaction(async (tx) => {
        // Create user if not exists
        if (!user) {
          user = await tx.user.create({
            data: {
              name: ownerName,
              email: ownerEmail,
              password: hashedPassword,
            },
          });
        }

        // Create tenant
        const tenant = await tx.tenant.create({
          data: {
            name: storeName,
            slug: storeSlug,
            email: ownerEmail,
            currency: "EGP",
          },
        });

        // Link user as OWNER of new tenant
        await tx.tenantMember.create({
          data: {
            userId: user!.id,
            tenantId: tenant.id,
            role: "OWNER",
          },
        });

        // Create infinite trial subscription (trialEnd 10 years out, since subscriptions are disabled)
        const trialEnd = new Date();
        trialEnd.setFullYear(trialEnd.getFullYear() + 10);

        if (starterPlan) {
          await tx.subscription.create({
            data: {
              tenantId: tenant.id,
              planId: starterPlan.id,
              status: "ACTIVE",
              trialEnd,
            },
          });
        }

        return { user, tenant };
      });

      res.status(201).json({
        message: "Store created successfully by Super Admin",
        user: {
          id: result.user!.id,
          name: result.user!.name,
          email: result.user!.email,
        },
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /api/admin/tenants/:id ────────────────────────────────────────────────
// Update tenant fields (e.g. toggle isActive status)
router.put(
  "/tenants/:id",
  [body("isActive").optional().isBoolean()],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { id } = req.params;
      const { isActive } = req.body;

      const existing = await prisma.tenant.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: "Store not found" });
        return;
      }

      const tenant = await prisma.tenant.update({
        where: { id },
        data: {
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ message: "Store updated successfully", tenant });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
// List all users and their tenant links
router.get(
  "/users",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const users = await prisma.user.findMany({
        include: {
          tenantMembers: {
            include: {
              tenant: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ users });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

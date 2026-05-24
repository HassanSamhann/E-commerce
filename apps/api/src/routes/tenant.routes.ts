import { Router, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import { body, validationResult } from "express-validator";
import { authenticate, requireTenant, AuthRequest, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// All tenant routes require authentication + tenant context
router.use(authenticate, requireTenant);

// ─── GET /api/tenant ───────────────────────────────────────────────────────────
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenant!.id },
      include: {
        subscription: { include: { plan: true } },
        _count: {
          select: { products: true, orders: true, customers: true, members: true },
        },
      },
    });
    res.json({ tenant });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/tenant ───────────────────────────────────────────────────────────
router.put(
  "/",
  requireRole("OWNER", "ADMIN"),
  [
    body("name").optional().trim().notEmpty(),
    body("email").optional().isEmail(),
    body("phone").optional().trim(),
    body("description").optional().trim(),
    body("currency").optional().isLength({ min: 3, max: 3 }),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const {
        name, description, email, phone, address,
        city, country, currency, primaryColor, logoUrl, coverUrl,
      } = req.body;

      const tenant = await prisma.tenant.update({
        where: { id: req.tenant!.id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(email && { email }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
          ...(city !== undefined && { city }),
          ...(country && { country }),
          ...(currency && { currency }),
          ...(primaryColor && { primaryColor }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(coverUrl !== undefined && { coverUrl }),
        },
      });

      res.json({ tenant });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /api/tenant/members ───────────────────────────────────────────────────
router.get(
  "/members",
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const members = await prisma.tenantMember.findMany({
        where: { tenantId: req.tenant!.id },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });
      res.json({ members });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/tenant/members/invite ──────────────────────────────────────────
router.post(
  "/members/invite",
  requireRole("OWNER", "ADMIN"),
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("role")
      .isIn(["ADMIN", "STAFF"])
      .withMessage("Role must be ADMIN or STAFF"),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, role } = req.body;

      // Check member limit
      const plan = req.tenant!.subscription?.plan;
      if (plan) {
        const memberCount = await prisma.tenantMember.count({
          where: { tenantId: req.tenant!.id },
        });
        if (memberCount >= plan.maxMembers) {
          res.status(403).json({
            error: `Your plan allows maximum ${plan.maxMembers} members. Upgrade to add more.`,
          });
          return;
        }
      }

      const invitedUser = await prisma.user.findUnique({ where: { email } });
      if (!invitedUser) {
        res.status(404).json({ error: "No user found with this email. Ask them to register first." });
        return;
      }

      const existingMember = await prisma.tenantMember.findFirst({
        where: { userId: invitedUser.id, tenantId: req.tenant!.id },
      });
      if (existingMember) {
        res.status(409).json({ error: "User is already a member" });
        return;
      }

      const member = await prisma.tenantMember.create({
        data: { userId: invitedUser.id, tenantId: req.tenant!.id, role },
        include: { user: { select: { id: true, name: true, email: true } } },
      });

      res.status(201).json({ member });
    } catch (error) {
      next(error);
    }
  }
);

// ─── DELETE /api/tenant/members/:memberId ────────────────────────────────────
router.delete(
  "/members/:memberId",
  requireRole("OWNER", "ADMIN"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const member = await prisma.tenantMember.findFirst({
        where: { id: req.params.memberId, tenantId: req.tenant!.id },
      });

      if (!member) {
        res.status(404).json({ error: "Member not found" });
        return;
      }

      if (member.role === "OWNER") {
        res.status(403).json({ error: "Cannot remove the store owner" });
        return;
      }

      await prisma.tenantMember.delete({ where: { id: member.id } });
      res.json({ message: "Member removed successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

import { Router, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import { body, validationResult } from "express-validator";
import { authenticate, requireTenant, AuthRequest, requireRole } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate, requireTenant);

// ─── GET /api/orders ──────────────────────────────────────────────────────────
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      page = "1",
      limit = "20",
      search = "",
      status,
      paymentStatus,
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: Record<string, unknown> = {
      tenantId: req.tenant!.id,
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { customer: { name: { contains: search, mode: "insensitive" } } },
          { customer: { email: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
        orderBy: { createdAt: sortOrder as "asc" | "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
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
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────
router.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, tenantId: req.tenant!.id },
      include: {
        customer: true,
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
            variant: { select: { id: true, name: true } },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/orders/:id/status ───────────────────────────────────────────────
router.put(
  "/:id/status",
  requireRole("OWNER", "ADMIN", "STAFF"),
  [
    body("status")
      .isIn(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED", "REFUNDED"])
      .withMessage("Invalid status"),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const order = await prisma.order.findFirst({
        where: { id: req.params.id, tenantId: req.tenant!.id },
      });

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: req.body.status },
      });

      res.json({ order: updated });
    } catch (error) {
      next(error);
    }
  }
);

// ─── PUT /api/orders/:id/payment ─────────────────────────────────────────────
router.put(
  "/:id/payment",
  requireRole("OWNER", "ADMIN"),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const order = await prisma.order.findFirst({
        where: { id: req.params.id, tenantId: req.tenant!.id },
      });

      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      const { paymentStatus, method, transactionId, notes } = req.body;

      const [updatedOrder] = await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus },
        }),
        prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            status: paymentStatus,
            method,
            transactionId,
            notes,
          },
        }),
      ]);

      res.json({ order: updatedOrder });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

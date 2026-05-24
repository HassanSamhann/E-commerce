import { Router, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import { authenticate, requireTenant, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate, requireTenant);

// GET /api/subscription
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: req.tenant!.id },
      include: { plan: true },
    });

    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Get current usage
    const [productCount, memberCount, orderCount] = await Promise.all([
      prisma.product.count({ where: { tenantId: req.tenant!.id } }),
      prisma.tenantMember.count({ where: { tenantId: req.tenant!.id } }),
      prisma.order.count({ where: { tenantId: req.tenant!.id } }),
    ]);

    res.json({
      subscription,
      plans,
      usage: { products: productCount, members: memberCount, orders: orderCount },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/subscription/upgrade
router.post("/upgrade", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planId } = req.body;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    const subscription = await prisma.subscription.upsert({
      where: { tenantId: req.tenant!.id },
      update: { planId, status: "ACTIVE" },
      create: { tenantId: req.tenant!.id, planId, status: "ACTIVE" },
      include: { plan: true },
    });

    res.json({ subscription, message: "Plan upgraded successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;

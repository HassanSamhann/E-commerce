import { Router, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import { authenticate, requireTenant, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate, requireTenant);

// GET /api/dashboard
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenant!.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      thisMonthOrders,
      lastMonthOrders,
      recentOrders,
      topProducts,
      ordersByStatus,
    ] = await Promise.all([
      prisma.product.count({ where: { tenantId, status: "ACTIVE" } }),
      prisma.order.count({ where: { tenantId } }),
      prisma.customer.count({ where: { tenantId } }),

      // This month revenue
      prisma.order.aggregate({
        where: { tenantId, createdAt: { gte: startOfMonth }, paymentStatus: "PAID" },
        _sum: { total: true },
        _count: true,
      }),

      // Last month revenue
      prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          paymentStatus: "PAID",
        },
        _sum: { total: true },
        _count: true,
      }),

      // Recent orders
      prisma.order.findMany({
        where: { tenantId },
        include: {
          customer: { select: { name: true, email: true } },
          items: { take: 1 },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Top products by order items
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { tenantId } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ["status"],
        where: { tenantId },
        _count: true,
      }),
    ]);

    // Get product names for top products
    const topProductIds = topProducts.map((p) => p.productId);
    const productNames = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, images: { take: 1 } },
    });

    const topProductsWithNames = topProducts.map((tp) => ({
      ...tp,
      product: productNames.find((p) => p.id === tp.productId),
    }));

    const thisMonthRevenue = Number(thisMonthOrders._sum.total ?? 0);
    const lastMonthRevenue = Number(lastMonthOrders._sum.total ?? 0);
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        thisMonthRevenue,
        thisMonthOrders: thisMonthOrders._count,
        lastMonthRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      },
      recentOrders,
      topProducts: topProductsWithNames,
      ordersByStatus,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

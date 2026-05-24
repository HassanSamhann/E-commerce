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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Build last 30 days date range for daily revenue chart
    const start30 = new Date(now);
    start30.setDate(now.getDate() - 29);
    start30.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      thisMonthOrders,
      lastMonthOrders,
      recentOrders,
      topProducts,
      ordersByStatus,
      lowStockProducts,
      pendingOrdersCount,
      newCustomersToday,
      newCustomersWeek,
      last30DaysOrders,
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

      // Recent orders (last 8)
      prisma.order.findMany({
        where: { tenantId },
        include: {
          customer: { select: { name: true, email: true } },
          items: { take: 1 },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
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

      // Low stock products (quantity <= 5)
      prisma.product.findMany({
        where: { tenantId, status: "ACTIVE", quantity: { lte: 5 } },
        select: { id: true, name: true, quantity: true, images: { take: 1 } },
        orderBy: { quantity: "asc" },
        take: 10,
      }),

      // Pending orders count
      prisma.order.count({
        where: { tenantId, status: "PENDING" },
      }),

      // New customers today
      prisma.customer.count({
        where: { tenantId, createdAt: { gte: startOfToday } },
      }),

      // New customers this week
      prisma.customer.count({
        where: { tenantId, createdAt: { gte: startOfWeek } },
      }),

      // Last 30 days orders for chart
      prisma.order.findMany({
        where: { tenantId, createdAt: { gte: start30 }, paymentStatus: "PAID" },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Get product names for top products
    const topProductIds = topProducts.map((p: any) => p.productId);
    const productNames = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, images: { take: 1 } },
    });

    const topProductsWithNames = topProducts.map((tp: any) => ({
      ...tp,
      product: productNames.find((p: any) => p.id === tp.productId),
    }));

    // Build daily revenue chart (last 30 days)
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(start30);
      d.setDate(start30.getDate() + i);
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = 0;
    }
    for (const order of last30DaysOrders) {
      const key = new Date(order.createdAt).toISOString().split("T")[0];
      if (dailyMap[key] !== undefined) {
        dailyMap[key] += Number(order.total);
      }
    }
    const revenueChartData = Object.entries(dailyMap).map(([date, revenue]) => ({
      date,
      revenue,
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
        pendingOrdersCount,
        newCustomersToday,
        newCustomersWeek,
        lowStockCount: lowStockProducts.length,
      },
      recentOrders,
      topProducts: topProductsWithNames,
      ordersByStatus,
      lowStockProducts,
      revenueChartData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

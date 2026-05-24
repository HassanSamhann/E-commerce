import { Router, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import { authenticate, requireTenant, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate, requireTenant);

// GET /api/customers
router.get("/", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = "1", limit = "20", search = "" } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {
      tenantId: req.tenant!.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      customers,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id
router.get("/:id", async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, tenantId: req.tenant!.id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { items: { take: 3 } },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json({ customer });
  } catch (error) {
    next(error);
  }
});

export default router;

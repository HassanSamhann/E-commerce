import { Router, Response, NextFunction, Request } from "express";
import { prisma } from "@repo/database";

const router = Router();

// GET /api/store/:slug — Public store info
router.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: req.params.slug, isActive: true },
      select: {
        id: true, name: true, slug: true, description: true,
        logoUrl: true, coverUrl: true, primaryColor: true,
        currency: true, email: true, phone: true,
        categories: {
          where: { isActive: true, parentId: null },
          select: {
            id: true,
            name: true,
            slug: true,
            children: {
              where: { isActive: true },
              select: { id: true, name: true, slug: true },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!tenant) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    res.json({ store: tenant });
  } catch (error) {
    next(error);
  }
});

// GET /api/store/:slug/products — Public products
router.get("/:slug/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: req.params.slug, isActive: true },
    });

    if (!tenant) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    const { page = "1", limit = "20", search = "", categoryId } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {
      tenantId: tenant.id,
      status: "ACTIVE",
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true, name: true, slug: true, description: true,
          price: true, comparePrice: true, quantity: true, tags: true,
          category: { select: { id: true, name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 3 },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/store/:slug/orders — Public checkout
router.post("/:slug/orders", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: req.params.slug, isActive: true },
    });

    if (!tenant) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    const { customer: customerData, items, shippingAddress, notes, paymentMethod, shippingAmount } = req.body;

    if (!items?.length) {
      res.status(400).json({ error: "No items in order" });
      return;
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { tenantId: tenant.id, email: customerData.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          tenantId: tenant.id,
          email: customerData.email,
          name: customerData.name,
          phone: customerData.phone,
          address: shippingAddress?.address,
          city: shippingAddress?.city,
          country: shippingAddress?.country,
        },
      });
    }

    // Validate products and calculate total
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId: tenant.id, status: "ACTIVE" },
    });

    let subtotal = 0;
    const orderItems = items.map((item: { productId: string; quantity: number; variantId?: string }) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;
      return {
        productId: product.id,
        variantId: item.variantId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
      };
    });

    // Generate order number
    const orderCount = await prisma.order.count({ where: { tenantId: tenant.id } });
    const orderNumber = `ORD-${String(orderCount + 1).padStart(5, "0")}`;

    const shipAmt = Number(shippingAmount || 0);

    const order = await prisma.order.create({
      data: {
        tenantId: tenant.id,
        customerId: customer.id,
        orderNumber,
        subtotal,
        shippingAmount: shipAmt,
        total: subtotal + shipAmt,
        currency: tenant.currency,
        shippingAddress,
        notes,
        items: { create: orderItems },
        payments: {
          create: {
            amount: subtotal + shipAmt,
            currency: tenant.currency,
            status: "PENDING",
            method: paymentMethod || "COD",
            notes: paymentMethod === "COD" ? "Cash on Delivery" : "Credit Card / Online",
          },
        },
      },
      include: { items: true, customer: true, payments: true },
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

// GET /api/store/:slug/products/:id — Public product details
router.get("/:slug/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: req.params.slug, isActive: true },
    });

    if (!tenant) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, tenantId: tenant.id, status: "ACTIVE" },
      select: {
        id: true, name: true, slug: true, description: true,
        price: true, comparePrice: true, quantity: true, tags: true,
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" } },
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
});

export default router;

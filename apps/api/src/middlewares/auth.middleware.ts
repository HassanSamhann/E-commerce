import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/database";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
    role: string;
    subscription: {
      status: string;
      plan: {
        maxProducts: number;
        maxMembers: number;
        maxOrders: number;
        hasAnalytics: boolean;
        hasCustomDomain: boolean;
      };
    } | null;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireTenant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tenantSlug =
      req.headers["x-tenant-slug"] as string ||
      req.params.tenantSlug;

    if (!tenantSlug) {
      res.status(400).json({ error: "Tenant not specified" });
      return;
    }

    const member = await prisma.tenantMember.findFirst({
      where: {
        userId: req.user!.id,
        tenant: { slug: tenantSlug },
      },
      include: {
        tenant: {
          include: {
            subscription: {
              include: { plan: true },
            },
          },
        },
      },
    });

    if (!member) {
      res.status(403).json({ error: "Access denied to this tenant" });
      return;
    }

    req.tenant = {
      id: member.tenant.id,
      name: member.tenant.name,
      slug: member.tenant.slug,
      role: member.role,
      subscription: member.tenant.subscription
        ? {
            status: member.tenant.subscription.status,
            plan: {
              maxProducts: member.tenant.subscription.plan.maxProducts,
              maxMembers: member.tenant.subscription.plan.maxMembers,
              maxOrders: member.tenant.subscription.plan.maxOrders,
              hasAnalytics: member.tenant.subscription.plan.hasAnalytics,
              hasCustomDomain: member.tenant.subscription.plan.hasCustomDomain,
            },
          }
        : null,
    };

    next();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.tenant || !roles.includes(req.tenant.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };

export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const superAdmins = ["hassan700019@gmail.com"];
  if (!req.user || !superAdmins.includes(req.user.email)) {
    res.status(403).json({ error: "Access denied. Super Admin role required." });
    return;
  }
  next();
};


import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/database";
import { body, validationResult } from "express-validator";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

// ─── Register ─────────────────────────────────────────────────────────────────
router.post(
  "/register",
  async (req: Request, res: Response) => {
    res.status(403).json({
      error: "Public registration is disabled. Please contact the administrator (demo@shop.com) to set up your store.",
    });
  }
);

// ─── Login ────────────────────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Get user's tenants
      const members = await prisma.tenantMember.findMany({
        where: { userId: user.id },
        include: {
          tenant: {
            include: {
              subscription: { include: { plan: true } },
            },
          },
        },
      });

      const { accessToken, refreshToken } = generateTokens(user.id);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await prisma.refreshToken.create({
        data: { token: refreshToken, userId: user.id, expiresAt },
      });

      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        tenants: members.map((m) => ({
          id: m.tenant.id,
          name: m.tenant.name,
          slug: m.tenant.slug,
          logoUrl: m.tenant.logoUrl,
          role: m.role,
          subscription: m.tenant.subscription
            ? {
                status: m.tenant.subscription.status,
                plan: m.tenant.subscription.plan.name,
                trialEnd: m.tenant.subscription.trialEnd,
              }
            : null,
        })),
        tokens: { accessToken, refreshToken },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── Refresh Token ────────────────────────────────────────────────────────────
router.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: "Refresh token required" });
        return;
      }

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        res.status(401).json({ error: "Invalid or expired refresh token" });
        return;
      }

      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

      const tokens = generateTokens(storedToken.userId);

      // Rotate refresh token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: storedToken.userId,
          expiresAt,
        },
      });

      res.json({ tokens });
    } catch (error) {
      next(error);
    }
  }
);

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post(
  "/logout",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken, userId: req.user!.id },
        });
      }
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// ─── Me ───────────────────────────────────────────────────────────────────────
router.get(
  "/me",
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          emailVerified: true,
          createdAt: true,
          tenantMembers: {
            include: {
              tenant: {
                include: {
                  subscription: { include: { plan: true } },
                },
              },
            },
          },
        },
      });
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

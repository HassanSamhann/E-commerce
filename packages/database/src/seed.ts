import { prisma } from "./index";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting database seed...");

  // Create subscription plans
  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "starter" },
    update: {},
    create: {
      name: "Starter",
      slug: "starter",
      description: "Perfect for small businesses just getting started",
      price: 19,
      currency: "USD",
      interval: "month",
      maxProducts: 50,
      maxMembers: 2,
      maxOrders: 500,
      hasAnalytics: false,
      hasCustomDomain: false,
      hasStorefront: true,
      sortOrder: 1,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "professional" },
    update: {},
    create: {
      name: "Professional",
      slug: "professional",
      description: "For growing businesses with more needs",
      price: 49,
      currency: "USD",
      interval: "month",
      maxProducts: 500,
      maxMembers: 5,
      maxOrders: 5000,
      hasAnalytics: true,
      hasCustomDomain: true,
      hasStorefront: true,
      sortOrder: 2,
    },
  });

  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "enterprise" },
    update: {},
    create: {
      name: "Enterprise",
      slug: "enterprise",
      description: "Unlimited power for large businesses",
      price: 99,
      currency: "USD",
      interval: "month",
      maxProducts: 999999,
      maxMembers: 999999,
      maxOrders: 999999,
      hasAnalytics: true,
      hasCustomDomain: true,
      hasStorefront: true,
      sortOrder: 3,
    },
  });

  // Create demo user + tenant
  const hashedPassword = await bcrypt.hash("Demo@12345", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "hassan700019@gmail.com" },
    update: {},
    create: {
      email: "hassan700019@gmail.com",
      password: hashedPassword,
      name: "Demo Owner",
      emailVerified: true,
    },
  });

  const demoTenant = await prisma.tenant.upsert({
    where: { slug: "demo-store" },
    update: {},
    create: {
      name: "Demo Store",
      slug: "demo-store",
      description: "A demo store to explore the platform",
      email: "hassan700019@gmail.com",
      currency: "EGP",
      country: "EG",
    },
  });

  // Add user as owner
  await prisma.tenantMember.upsert({
    where: { userId_tenantId: { userId: demoUser.id, tenantId: demoTenant.id } },
    update: {},
    create: {
      userId: demoUser.id,
      tenantId: demoTenant.id,
      role: "OWNER",
    },
  });

  // Assign subscription (14-day trial)
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  await prisma.subscription.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: {
      tenantId: demoTenant.id,
      planId: proPlan.id,
      status: "TRIALING",
      trialEnd,
    },
  });

  // Create sample categories
  const electronicsCategory = await prisma.category.create({
    data: {
      tenantId: demoTenant.id,
      name: "Electronics",
      slug: "electronics",
      description: "Electronic devices and accessories",
      sortOrder: 1,
    },
  });

  const clothingCategory = await prisma.category.create({
    data: {
      tenantId: demoTenant.id,
      name: "Clothing",
      slug: "clothing",
      description: "Fashion and apparel",
      sortOrder: 2,
    },
  });

  // Create sample products
  await prisma.product.createMany({
    data: [
      {
        tenantId: demoTenant.id,
        categoryId: electronicsCategory.id,
        name: "Wireless Headphones",
        slug: "wireless-headphones",
        description: "Premium noise-cancelling wireless headphones",
        price: 1299,
        comparePrice: 1599,
        quantity: 50,
        status: "ACTIVE",
        isFeatured: true,
        tags: ["electronics", "audio", "wireless"],
      },
      {
        tenantId: demoTenant.id,
        categoryId: electronicsCategory.id,
        name: "Smart Watch",
        slug: "smart-watch",
        description: "Feature-packed smartwatch with health tracking",
        price: 2499,
        comparePrice: 2999,
        quantity: 30,
        status: "ACTIVE",
        isFeatured: true,
        tags: ["electronics", "wearable", "health"],
      },
      {
        tenantId: demoTenant.id,
        categoryId: clothingCategory.id,
        name: "Premium T-Shirt",
        slug: "premium-tshirt",
        description: "High quality cotton t-shirt",
        price: 299,
        quantity: 100,
        status: "ACTIVE",
        tags: ["clothing", "casual"],
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("📧 Demo login: hassan700019@gmail.com | Demo@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

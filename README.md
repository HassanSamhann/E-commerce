# 🛒 StoreFlow — Multi-Tenant SaaS E-Commerce

A production-ready SaaS e-commerce platform where multiple merchants can create and manage their own stores.

## 🗂 Project Structure

```
e-commerce/
├── apps/
│   ├── web/          ← Next.js 14 (App Router) - Dashboard + Storefront
│   └── api/          ← Node.js + Express - REST API
├── packages/
│   └── database/     ← Prisma ORM + PostgreSQL schema
└── turbo.json        ← Turborepo monorepo config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- npm or yarn

### 1. Set up the database

Create a PostgreSQL database:
```sql
CREATE DATABASE saas_ecommerce;
```

### 2. Configure environment variables

**API** (`apps/api/.env`):
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/saas_ecommerce
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

**Web** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Install dependencies & run migrations

```bash
# Install all dependencies (monorepo)
npm install

# Go to database package and run migrations
cd packages/database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed  # (optional - adds demo data)
cd ../..
```

### 4. Start development servers

```bash
# Start everything (API + Web) in parallel
npm run dev
```

- 🌐 **Dashboard**: http://localhost:3000
- 🔌 **API**: http://localhost:5000
- 🗄 **Prisma Studio**: `cd packages/database && npx prisma studio`

## 🔐 Demo Credentials
- Email: `hassan700019@gmail.com`
- Password: `Demo@12345`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account + store |
| POST | /api/auth/login | Login |
| GET | /api/dashboard | Store analytics |
| GET/POST | /api/products | List / Create products |
| PUT/DELETE | /api/products/:id | Update / Delete product |
| GET/PUT | /api/orders | List / Update orders |
| GET | /api/customers | Customer list |
| GET | /api/subscription | Current plan + usage |
| GET | /api/store/:slug | Public storefront |

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (Access + Refresh tokens) |
| Monorepo | Turborepo |

## 🔑 Key Features

- ✅ **Multi-tenant** — Each merchant has isolated data
- ✅ **Subscription Plans** — Starter / Professional / Enterprise
- ✅ **Role-based access** — Owner, Admin, Staff
- ✅ **Product Management** — CRUD + Variants + Images
- ✅ **Order Management** — Status tracking + Payment tracking
- ✅ **Customer Management** — Customer profiles + history
- ✅ **Public Storefront** — Each tenant gets `/store/:slug`
- ✅ **Dark Mode** — Full dark/light theme support
- ✅ **14-day Trial** — Auto-assigned on registration

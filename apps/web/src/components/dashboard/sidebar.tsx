"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Tag,
  Image,
  ChevronLeft,
  Store,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/auth.context";
import { useLanguage } from "@/contexts/language.context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { api } from "@/lib/api";

const navItems = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", key: "products", icon: Package },
  { href: "/dashboard/categories", key: "categories", icon: Tag },
  { href: "/dashboard/orders", key: "orders", icon: ShoppingCart },
  { href: "/dashboard/customers", key: "customers", icon: Users },
  { href: "/dashboard/media", key: "media", icon: Image },
  { href: "/dashboard/analytics", key: "analytics", icon: BarChart3 },
];

const bottomNavItems = [
  { href: "/dashboard/subscription", key: "subscription", icon: CreditCard },
  { href: "/dashboard/settings", key: "settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentTenant, user } = useAuth();
  const { t, language } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const isSuperAdmin = user?.email === "demo@shop.com";

  // Fetch badge counts from dashboard
  const { data: dashData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/dashboard").then((r) => r.data),
    staleTime: 60_000,
    enabled: !!currentTenant,
  });

  const pendingCount: number = dashData?.stats?.pendingOrdersCount ?? 0;
  const lowStockCount: number = dashData?.stats?.lowStockCount ?? 0;

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const isRtl = language === "ar";

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "relative flex flex-col bg-white dark:bg-slate-900 h-full overflow-hidden z-20",
        isRtl ? "border-l border-slate-100 dark:border-slate-800" : "border-r border-slate-100 dark:border-slate-800"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/30">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRtl ? 10 : -10 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-slate-900 dark:text-white text-lg">StoreFlow</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tenant */}
      {currentTenant && !collapsed && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {currentTenant.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentTenant.name}
              </p>
              <p className="text-xs text-brand-600 dark:text-brand-400 capitalize">
                {currentTenant.role?.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className={cn("text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2", collapsed && "hidden")}>
          {t("mainMenu")}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const labelText = t(item.key);

          // Badge count for specific routes
          const badge =
            item.href === "/dashboard/orders" && pendingCount > 0
              ? pendingCount
              : item.href === "/dashboard/products" && lowStockCount > 0
              ? lowStockCount
              : null;
          const badgeColor =
            item.href === "/dashboard/products"
              ? "bg-red-500"
              : "bg-amber-500";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active ? "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400" : "text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-brand-600 dark:hover:text-brand-400",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? labelText : undefined}
            >
              <div className="relative flex-shrink-0">
                <Icon className="w-5 h-5" />
                {badge !== null && (
                  <span className={`absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full ${badgeColor} text-white text-[9px] font-black flex items-center justify-center leading-none`}>
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              {!collapsed && <span className="flex-1">{labelText}</span>}
              {!collapsed && badge !== null && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full text-white ${badgeColor}`}>
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              {active && !collapsed && (
                <motion.div
                  layoutId="active-indicator"
                  className={cn("w-1.5 h-1.5 rounded-full bg-brand-500", isRtl ? "mr-auto" : "ml-auto")}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Storefront Link */}
      {currentTenant && !collapsed && (
        <div className="px-3 mb-2">
          <a
            href={`/store/${currentTenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
          >
            <Store className="w-4 h-4" />
            {t("viewStorefront")}
          </a>
        </div>
      )}

      {/* Super Admin Link — visible only for platform owner */}
      {isSuperAdmin && (
        <div className="px-3 mb-2">
          <Link
            href="/dashboard/admin"
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200",
              isActive("/dashboard/admin")
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 shadow-sm"
                : "text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? t("superAdmin") : undefined}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{t("superAdmin")}</span>}
          </Link>
        </div>
      )}

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const labelText = t(item.key);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active ? "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400" : "text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-brand-600 dark:hover:text-brand-400",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? labelText : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{labelText}</span>}
            </Link>
          );
        })}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-16 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10",
          isRtl ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
        )}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          className={cn(
            "w-3 h-3 text-slate-500 transition-transform",
            collapsed ? (isRtl ? "" : "rotate-180") : (isRtl ? "rotate-180" : "")
          )}
        />
      </button>
    </motion.aside>
  );
}

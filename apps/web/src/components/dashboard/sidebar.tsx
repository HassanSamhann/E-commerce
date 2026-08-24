"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faGaugeHigh,
  faBoxesStacked,
  faReceipt,
  faUsers,
  faChartLine,
  faSliders,
  faCreditCard,
  faTags,
  faImages,
  faChevronLeft,
  faStore,
  faShieldHalved,
  faXmark,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/auth.context";
import { useLanguage } from "@/contexts/language.context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { api } from "@/lib/api";

const navItems = [
  { href: "/dashboard", key: "dashboard", icon: faGaugeHigh },
  { href: "/dashboard/products", key: "products", icon: faBoxesStacked },
  { href: "/dashboard/categories", key: "categories", icon: faTags },
  { href: "/dashboard/orders", key: "orders", icon: faReceipt },
  { href: "/dashboard/customers", key: "customers", icon: faUsers },
  { href: "/dashboard/media", key: "media", icon: faImages },
  { href: "/dashboard/analytics", key: "analytics", icon: faChartLine },
];

const bottomNavItems = [
  { href: "/dashboard/subscription", key: "subscription", icon: faCreditCard },
  { href: "/dashboard/settings", key: "settings", icon: faSliders },
];

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { currentTenant, user } = useAuth();
  const { t, language } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const isSuperAdmin = user?.email === "hassan700019@gmail.com";

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

  const sidebarContent = (isMobile: boolean = false) => {
    const showFull = !collapsed || isMobile;

    return (
      <>
        {/* Logo and Mobile Close */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-black/[0.06] dark:border-white/[0.08] flex-shrink-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#0066cc] flex items-center justify-center shadow-sm">
            <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4 text-white" />
          </div>
          {showFull && (
            <span className="font-semibold text-[#1d1d1f] dark:text-white text-base tracking-tight">
              StoreFlow
            </span>
          )}
          {isMobile && setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors ml-auto"
              title="Close Sidebar"
            >
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tenant badge */}
        {currentTenant && showFull && (
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-[#f5f5f7] dark:bg-[#272729] border border-black/[0.04] dark:border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {currentTenant.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white truncate">
                  {currentTenant.name}
                </p>
                <p className="text-[11px] text-[#86868b] dark:text-[#a1a1a6] capitalize">
                  {currentTenant.role?.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className={cn("text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-2 px-2", !showFull && "hidden")}>
            {t("mainMenu")}
          </p>
          {navItems.map((item) => {
            const active = isActive(item.href);
            const labelText = t(item.key);

            const badge =
              item.href === "/dashboard/orders" && pendingCount > 0
                ? pendingCount
                : item.href === "/dashboard/products" && lowStockCount > 0
                ? lowStockCount
                : null;
            const badgeColor =
              item.href === "/dashboard/products"
                ? "bg-rose-500"
                : "bg-amber-500";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setMobileOpen?.(false)}
                className={cn(
                  "apple-sidebar-item",
                  active && "active",
                  !showFull && "justify-center px-2"
                )}
                title={!showFull ? labelText : undefined}
              >
                <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                  <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                  {badge !== null && !showFull && (
                    <span className={`absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full ${badgeColor} text-white text-[8px] font-bold flex items-center justify-center leading-none`}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </div>
                {showFull && <span className="flex-1 text-[14px]">{labelText}</span>}
                {showFull && badge !== null && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full text-white ${badgeColor}`}>
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
                {active && showFull && (
                  <motion.div
                    layoutId={isMobile ? "active-indicator-mobile" : "active-indicator-desktop"}
                    className={cn("w-1.5 h-1.5 rounded-full bg-[#0066cc] dark:bg-[#2997ff]", isRtl ? "mr-auto" : "ml-auto")}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Storefront Link */}
        {currentTenant && showFull && (
          <div className="px-3 mb-2">
            <a
              href={`/store/${currentTenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#1d1d1f] dark:text-[#a1a1a6] hover:bg-[#0066cc]/5 hover:text-[#0066cc] dark:hover:text-[#2997ff] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FontAwesomeIcon icon={faStore} className="w-4 h-4 text-[#86868b]" />
                <span>{t("viewStorefront")}</span>
              </div>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3 h-3 text-[#86868b]" />
            </a>
          </div>
        )}

        {/* Super Admin Link */}
        {isSuperAdmin && (
          <div className="px-3 mb-2">
            <Link
              href="/dashboard/admin"
              onClick={() => isMobile && setMobileOpen?.(false)}
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all",
                isActive("/dashboard/admin")
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/5",
                !showFull && "justify-center px-2"
              )}
              title={!showFull ? t("superAdmin") : undefined}
            >
              <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 flex-shrink-0" />
              {showFull && <span>{t("superAdmin")}</span>}
            </Link>
          </div>
        )}

        {/* Bottom nav */}
        <div className="px-3 py-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            const labelText = t(item.key);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setMobileOpen?.(false)}
                className={cn(
                  "apple-sidebar-item",
                  active && "active",
                  !showFull && "justify-center px-2"
                )}
                title={!showFull ? labelText : undefined}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                </div>
                {showFull && <span>{labelText}</span>}
              </Link>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "relative flex flex-col bg-[#ffffff] dark:bg-[#161617] h-full overflow-hidden z-20 hidden lg:flex flex-shrink-0",
          isRtl ? "border-l border-black/[0.06] dark:border-white/[0.08]" : "border-r border-black/[0.06] dark:border-white/[0.08]"
        )}
      >
        {sidebarContent(false)}

        {/* Collapse button — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute top-16 w-6 h-6 rounded-full bg-white dark:bg-[#272729] border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-center shadow-sm hover:scale-105 transition-all z-10",
            isRtl ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FontAwesomeIcon
            icon={faChevronLeft}
            className={cn(
              "w-2.5 h-2.5 text-[#86868b] transition-transform",
              collapsed ? (isRtl ? "" : "rotate-180") : (isRtl ? "rotate-180" : "")
            )}
          />
        </button>
      </motion.aside>

      {/* 2. Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen?.(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: isRtl ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "100%" : "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className={cn(
                "fixed top-0 bottom-0 z-50 w-[270px] bg-white dark:bg-[#161617] flex flex-col overflow-hidden shadow-2xl lg:hidden",
                isRtl ? "right-0" : "left-0"
              )}
            >
              {sidebarContent(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

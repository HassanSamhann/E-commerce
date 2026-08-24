"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faMoon,
  faSun,
  faArrowRightFromBracket,
  faUser,
  faChevronDown,
  faBuilding,
  faBars,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth.context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logout, tenants, currentTenant, setCurrentTenant } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTenantMenu, setShowTenantMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#161617]/80 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-30">
      {/* Left: Hamburger menu + Tenant switcher */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            title="Open Sidebar"
          >
            <FontAwesomeIcon icon={faBars} className="w-4 h-4" />
          </button>
        )}

        {/* Tenant switcher (only if multiple tenants) */}
        {tenants.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowTenantMenu(!showTenantMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5f5f7] dark:bg-[#272729] hover:bg-[#ebebee] dark:hover:bg-[#333336] text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] transition-all"
            >
              <FontAwesomeIcon icon={faBuilding} className="w-3.5 h-3.5 text-[#0066cc] dark:text-[#2997ff]" />
              <span>{currentTenant?.name}</span>
              <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5 text-[#86868b]" />
            </button>
            {showTenantMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTenantMenu(false)} />
                <div className="absolute top-full mt-2 left-0 z-40 w-56 bg-white dark:bg-[#272729] rounded-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-apple-modal overflow-hidden p-1">
                  {tenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => {
                        setCurrentTenant(tenant);
                        setShowTenantMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors text-left",
                        currentTenant?.id === tenant.id &&
                          "text-[#0066cc] dark:text-[#2997ff] bg-[#0066cc]/10 dark:bg-[#2997ff]/15 font-semibold"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="truncate font-medium">{tenant.name}</p>
                        <p className="text-[11px] text-[#86868b] capitalize">{tenant.role?.toLowerCase()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors active:scale-95"
          title={resolvedTheme === "dark" ? "وضع النهار" : "الوضع الليلي"}
        >
          <FontAwesomeIcon icon={resolvedTheme === "dark" ? faSun : faMoon} className="w-3.5 h-3.5" />
        </button>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors relative active:scale-95">
          <FontAwesomeIcon icon={faBell} className="w-3.5 h-3.5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0066cc] dark:bg-[#2997ff]" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all active:scale-95"
          >
            <div className="w-7 h-7 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white leading-tight">{user?.name}</p>
            </div>
            <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5 text-[#86868b] hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
              <div className="absolute top-full right-0 mt-2 z-40 w-52 bg-white dark:bg-[#272729] rounded-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-apple-modal overflow-hidden p-1.5">
                <div className="px-3 py-2 border-b border-black/[0.04] dark:border-white/[0.06] mb-1">
                  <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#86868b] truncate">{user?.email}</p>
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => { router.push("/dashboard/settings"); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl transition-colors text-left"
                  >
                    <FontAwesomeIcon icon={faGear} className="w-3.5 h-3.5 text-[#86868b]" />
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left font-medium"
                  >
                    <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

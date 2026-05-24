"use client";

import { Bell, Moon, Sun, LogOut, User, ChevronDown, Building2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth.context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout, tenants, currentTenant, setCurrentTenant } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTenantMenu, setShowTenantMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Breadcrumb placeholder / Page title injected by pages */}
      <div className="flex items-center gap-2">
        {/* Tenant switcher (only if multiple tenants) */}
        {tenants.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowTenantMenu(!showTenantMenu)}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{currentTenant?.name}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showTenantMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowTenantMenu(false)} />
                <div className="absolute top-full mt-2 left-0 z-40 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden">
                  {tenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => {
                        setCurrentTenant(tenant);
                        setShowTenantMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left",
                        currentTenant?.id === tenant.id &&
                          "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950"
                      )}
                    >
                      <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{tenant.role?.toLowerCase()}</p>
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
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
              <div className="absolute top-full right-0 mt-2 z-40 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { router.push("/dashboard/settings"); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
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

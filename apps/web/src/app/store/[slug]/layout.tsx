"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Loader2, Store } from "lucide-react";
import { api } from "@/lib/api";
import { CartProvider } from "@/contexts/cart.context";
import Link from "next/link";
import { getTheme } from "@/lib/themes";
import { ClassicLayout } from "@/components/themes/ClassicLayout";
import { LuxuryLayout } from "@/components/themes/LuxuryLayout";
import { NatureLayout } from "@/components/themes/NatureLayout";

// ─── Theme Font Loader ────────────────────────────────────────────────────────
function ThemeFontLoader({ themeId }: { themeId: string }) {
  const themeConfig = getTheme(themeId);

  useEffect(() => {
    // Check if font already loaded
    const existingLink = document.querySelector(`link[data-theme-font="${themeId}"]`);
    if (existingLink) return;

    // Remove old theme font links
    document.querySelectorAll("link[data-theme-font]").forEach((el) => el.remove());

    // Load new font
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = themeConfig.fontUrl;
    link.setAttribute("data-theme-font", themeId);
    document.head.appendChild(link);
  }, [themeId, themeConfig.fontUrl]);

  return null;
}

// ─── Theme Router — picks the right layout based on store.theme ───────────────
function ThemeRouter({ store, children }: { store: any; children: React.ReactNode }) {
  const themeId = store?.theme || "classic";

  // Get the search param for preview mode
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const previewTheme = searchParams?.get("preview");
  const activeTheme = previewTheme || themeId;

  return (
    <>
      <ThemeFontLoader themeId={activeTheme} />
      {activeTheme === "luxury" ? (
        <LuxuryLayout store={store}>{children}</LuxuryLayout>
      ) : activeTheme === "nature" ? (
        <NatureLayout store={store}>{children}</NatureLayout>
      ) : (
        <ClassicLayout store={store}>{children}</ClassicLayout>
      )}
    </>
  );
}

// ─── Main Layout Content ──────────────────────────────────────────────────────
function StorefrontLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const { slug } = params as { slug: string };

  const { data, isLoading, error } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => api.get(`/api/store/${slug}`).then((r) => r.data.store),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
          <p className="text-sm font-medium text-zinc-400">Loading storefront...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-zinc-800 dark:text-white">Store Not Found</h2>
          <p className="text-zinc-400 mt-2 text-sm">
            The store you are looking for does not exist or has been deactivated.
          </p>
          <Link href="/" className="inline-block mt-5 py-2 px-5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ThemeRouter store={data}>
      {React.cloneElement(children as React.ReactElement, { store: data })}
    </ThemeRouter>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <StorefrontLayoutContent>{children}</StorefrontLayoutContent>
    </CartProvider>
  );
}

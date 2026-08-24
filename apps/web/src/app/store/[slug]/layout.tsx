"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faStore } from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import { CartProvider } from "@/contexts/cart.context";
import Link from "next/link";
import { getTheme } from "@/lib/themes";
import { ClassicLayout } from "@/components/themes/ClassicLayout";
import { LuxuryLayout } from "@/components/themes/LuxuryLayout";
import { NatureLayout } from "@/components/themes/NatureLayout";

function ThemeFontLoader({ themeId }: { themeId: string }) {
  const themeConfig = getTheme(themeId);

  useEffect(() => {
    const existingLink = document.querySelector(`link[data-theme-font="${themeId}"]`);
    if (existingLink) return;

    document.querySelectorAll("link[data-theme-font]").forEach((el) => el.remove());

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = themeConfig.fontUrl;
    link.setAttribute("data-theme-font", themeId);
    document.head.appendChild(link);
  }, [themeId, themeConfig.fontUrl]);

  return null;
}

function ThemeRouter({ store, children }: { store: any; children: React.ReactNode }) {
  const themeId = store?.theme || "classic";
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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000]">
        <div className="flex flex-col items-center gap-3">
          <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 animate-spin text-[#0066cc]" />
          <p className="text-xs font-semibold text-[#86868b]">Loading storefront...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] dark:bg-[#000000] px-4">
        <div className="apple-card text-center max-w-sm p-8 space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto text-rose-500">
            <FontAwesomeIcon icon={faStore} className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white">Store Not Found</h2>
          <p className="text-xs text-[#86868b]">
            The storefront you are looking for does not exist or has been paused.
          </p>
          <Link href="/" className="btn-apple-primary text-xs inline-flex mt-2">
            Back to Home
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

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <StorefrontLayoutContent>{children}</StorefrontLayoutContent>
    </CartProvider>
  );
}

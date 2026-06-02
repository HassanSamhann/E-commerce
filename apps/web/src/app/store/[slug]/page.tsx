"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { Search, Package, Plus, Check, ShoppingBag, Grid3X3, Loader2, Store, Star, ArrowRight, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/cart.context";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language.context";
import Link from "next/link";

export default function StorefrontPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { slug } = params as { slug: string };
  const { addToCart, cartItems } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const catId = searchParams.get("categoryId");
  const searchQuery = searchParams.get("search") || "";
  
  useEffect(() => {
    setSelectedCategoryId(catId);
    setSearch(searchQuery);
  }, [catId, searchQuery]);

  // Fetch store details (reads from React Query cache instantly)
  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => api.get(`/api/store/${slug}`).then((r) => r.data.store),
    enabled: !!slug,
  });

  // Fetch products
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["store-products", slug, search, selectedCategoryId],
    queryFn: () =>
      api
        .get(`/api/store/${slug}/products`, {
          params: {
            search,
            categoryId: selectedCategoryId || undefined,
          },
        })
        .then((r) => r.data),
    enabled: !!slug,
  });

  const products = productsData?.products || [];
  const isLoading = isStoreLoading || isProductsLoading;

  if (isStoreLoading || !store) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-zinc-50 dark:bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-zinc-400 mt-2">
          {language === "ar" ? "جاري تحميل المتجر..." : "Loading store catalog..."}
        </p>
      </div>
    );
  }

  // Find active parent category (either the selected category itself, or the parent of the selected sub-category)
  const activeParentCategory = store?.categories?.find((cat: any) => {
    if (cat.id === selectedCategoryId) return true;
    return cat.children?.some((child: any) => child.id === selectedCategoryId);
  }) || null;

  const isRtl = language === "ar";
  const taagerTeal = "#00a896";

  const handleAddToCart = (product: any) => {
    const firstImage = product.images?.[0]?.url;
    addToCart(
      {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: firstImage,
      },
      1
    );

    toast({
      title: t("addedToCart"),
      description: `${product.name} ${t("addedToCartDesc")}`,
    });
  };

  const isProductInCart = (productId: string) => {
    return cartItems.some((item) => item.id === productId);
  };

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Premium Storefront Hero Banner */}
      <div 
        className="relative text-white rounded-3xl p-8 sm:p-12 shadow-lg overflow-hidden border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ 
          background: store.coverUrl 
            ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${store.coverUrl}) center/cover no-repeat` 
            : `linear-gradient(135deg, ${store.primaryColor || taagerTeal} 0%, #0f766e 100%)` 
        }}
      >
        <div className="space-y-4 max-w-xl z-10 text-center md:text-right">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
            {store.logoUrl && (
              <img 
                src={store.logoUrl} 
                alt={store.name} 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 bg-white/10 shadow-md flex-shrink-0"
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-sm">
                {store.name}
              </h1>
              {store.description && (
                <p className="text-xs sm:text-sm text-zinc-200 mt-1 font-semibold">
                  {store.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Quick store features */}
          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start pt-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-white/10 text-white border border-white/10 shadow-sm backdrop-blur-sm">
              🤝 {isRtl ? "الدفع عند الاستلام" : "Cash on Delivery"}
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-white/10 text-white border border-white/10 shadow-sm backdrop-blur-sm">
              ⚡ {isRtl ? "شحن لكافة المحافظات" : "Shipping Countrywide"}
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-white/10 text-white border border-white/10 shadow-sm backdrop-blur-sm">
              ⭐ {isRtl ? "أعلى جودة مضمونة" : "Top Quality Guaranteed"}
            </span>
          </div>
        </div>
        
        <div className="z-10 flex-shrink-0">
          <button 
            onClick={() => {
              const el = document.getElementById("catalog-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 rounded-2xl font-black text-xs transition-transform hover:scale-105 shadow-md flex items-center gap-2 cursor-pointer bg-white text-zinc-900"
          >
            <span>{isRtl ? "تصفح المنتجات الآن" : "Browse Products Now"}</span>
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Dynamic Categories Filter Bar (Taager Style) */}
      {store.categories && store.categories.length > 0 && (
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/60 p-5 flex flex-col gap-4 transition-colors shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={cn(
                "px-4.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200",
                selectedCategoryId === null
                  ? "text-white shadow-md"
                  : "bg-zinc-55 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              style={{
                backgroundColor: selectedCategoryId === null ? store.primaryColor || taagerTeal : undefined,
              }}
            >
              {t("allProducts")}
            </button>
            {store.categories.map((category: any) => {
              const isActive = activeParentCategory?.id === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    "px-4.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "text-white shadow-md"
                      : "bg-zinc-55 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  style={{
                    backgroundColor: isActive ? store.primaryColor || taagerTeal : undefined,
                  }}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Secondary Sub-categories row */}
          {activeParentCategory && activeParentCategory.children && activeParentCategory.children.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-zinc-100 dark:border-zinc-850 pt-3 max-w-full no-scrollbar">
              <span className="text-xs font-bold text-zinc-400 flex-shrink-0">
                {isRtl ? "الفئة الفرعية:" : "Subcategory:"}
              </span>
              <button
                onClick={() => setSelectedCategoryId(activeParentCategory.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200",
                  selectedCategoryId === activeParentCategory.id
                    ? "text-white"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                )}
                style={{
                  backgroundColor: selectedCategoryId === activeParentCategory.id ? store.primaryColor || taagerTeal : undefined,
                }}
              >
                {isRtl ? "الكل" : "All"}
              </button>
              {activeParentCategory.children.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedCategoryId(sub.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200",
                    selectedCategoryId === sub.id
                      ? "text-white"
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  )}
                  style={{
                    backgroundColor: selectedCategoryId === sub.id ? store.primaryColor || taagerTeal : undefined,
                  }}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Products Grid Section (Taager Style) */}
      <div id="catalog-section" className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 rounded-full" style={{ backgroundColor: store.primaryColor || taagerTeal }} />
            {isRtl ? "منتجات مميزة" : "Featured Products"}
          </h3>
          <span className="text-xs font-bold text-zinc-400">
            {products.length} {isRtl ? "منتجات متوفرة" : "products available"}
          </span>
        </div>

        {isLoading ? (
          // Shimmer loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/60 rounded-3xl overflow-hidden p-4 space-y-4 shadow-sm"
              >
                <div className="h-48 w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse mt-4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/60 rounded-3xl"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-zinc-400 opacity-60" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 dark:text-white">
              {t("noProductsFound")}
            </h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-sm">
              {t("noProductsFoundDesc")}
            </p>
          </motion.div>
        ) : (
          // Products Grid
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product: any, index: number) => {
                const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.price);
                const discountPercent = hasDiscount
                  ? Math.round(
                      ((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100
                    )
                  : 0;

                const inCart = isProductInCart(product.id);
                const outOfStock = product.quantity <= 0;

                return (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/60 rounded-[24px] overflow-hidden p-4 flex flex-col justify-between shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 transition-all duration-300 relative"
                  >
                    {/* Link to details page wrapping Image & Metadata */}
                    <Link href={`/store/${slug}/products/${product.id}`} className="flex-1 flex flex-col group cursor-pointer">
                      
                      {/* Image / Gallery */}
                      <div className="relative h-52 w-full rounded-[18px] overflow-hidden bg-zinc-55 dark:bg-zinc-900/40 mb-4 border border-zinc-200/80 dark:border-zinc-800/60">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50">
                            <Package className="w-12 h-12 stroke-[1.25]" />
                          </div>
                        )}

                        {/* Featured & Discount Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                          {discountPercent > 0 && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md shadow-red-500/20">
                              {language === "ar" ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
                            </span>
                          )}
                          {product.isFeatured && (
                            <span
                              className="text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md shadow-indigo-500/20"
                              style={{ backgroundColor: store.primaryColor || taagerTeal }}
                            >
                              {t("featured")}
                            </span>
                          )}
                        </div>

                        {/* Stock badge */}
                        {outOfStock && (
                          <div className="absolute inset-0 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <span className="bg-zinc-900 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-lg border border-white/10">
                              {t("outOfStock")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex-1 flex flex-col px-1.5">
                        {product.category && (
                          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 block">
                            {product.category.name}
                          </span>
                        )}
                        <h3 className="text-sm font-extrabold text-zinc-850 dark:text-white line-clamp-1 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors leading-snug">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-xs text-zinc-400 dark:text-zinc-450 mt-1.5 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </Link>

                    {/* Pricing and CTA */}
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between px-1.5">
                      <div>
                        {hasDiscount && (
                          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-555 line-through block mb-0.5">
                            {formatCurrency(Number(product.comparePrice), store.currency)}
                          </span>
                        )}
                        <span className="text-base font-black text-zinc-800 dark:text-white">
                          {formatCurrency(Number(product.price), store.currency)}
                        </span>
                      </div>

                      <button
                        disabled={outOfStock}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className={cn(
                          "px-4.5 py-2 rounded-xl text-white text-xs font-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-1 hover:scale-105 active:scale-95"
                        )}
                        style={{
                          backgroundColor: outOfStock
                            ? "#cbd5e1"
                            : inCart
                            ? "#10b981"
                            : store.primaryColor || taagerTeal,
                        }}
                      >
                        {inCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{inCart ? (isRtl ? "مضاف" : "Added") : (isRtl ? "شراء" : "Buy")}</span>
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faBoxArchive,
  faPlus,
  faCheck,
  faCircleNotch,
  faArrowRight,
  faArrowLeft,
  faStar,
  faTruckFast,
  faShieldHalved,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
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
  const [page, setPage] = useState(1);

  const catId = searchParams.get("categoryId");
  const searchQuery = searchParams.get("search") || "";
  
  useEffect(() => {
    setSelectedCategoryId(catId);
    setSearch(searchQuery);
  }, [catId, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, search]);

  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => api.get(`/api/store/${slug}`).then((r) => r.data.store),
    enabled: !!slug,
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["store-products", slug, search, selectedCategoryId, page],
    queryFn: () =>
      api
        .get(`/api/store/${slug}/products`, {
          params: {
            search,
            categoryId: selectedCategoryId || undefined,
            page,
            limit: 30,
          },
        })
        .then((r) => r.data),
    enabled: !!slug,
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;
  const isLoading = isStoreLoading || isProductsLoading;

  if (isStoreLoading || !store) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 animate-spin text-[#0066cc]" />
        <p className="text-xs font-semibold text-[#86868b] mt-3">
          {language === "ar" ? "جاري تحميل المتجر..." : "Loading store catalog..."}
        </p>
      </div>
    );
  }

  const activeParentCategory = store?.categories?.find((cat: any) => {
    if (cat.id === selectedCategoryId) return true;
    return cat.children?.some((child: any) => child.id === selectedCategoryId);
  }) || null;

  const isRtl = language === "ar";

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
      {/* Apple Flagship Hero Banner */}
      {(!store.theme || store.theme === "classic") && (
        <div 
          className="relative text-white rounded-[24px] p-8 sm:p-12 overflow-hidden border border-black/[0.08] dark:border-white/[0.12] flex flex-col md:flex-row items-center justify-between gap-6 shadow-apple-card"
          style={{ 
            background: store.coverUrl 
              ? `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.75)), url(${store.coverUrl}) center/cover no-repeat` 
              : `linear-gradient(135deg, #1d1d1f 0%, #000000 100%)` 
          }}
        >
          <div className="space-y-4 max-w-xl z-10 text-center md:text-right">
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
              {store.logoUrl && (
                <img 
                  src={store.logoUrl} 
                  alt={store.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-md flex-shrink-0"
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-4xl font-semibold leading-tight tracking-tight">
                  {store.name}
                </h1>
                {store.description && (
                  <p className="text-xs sm:text-sm text-[#86868b] mt-1 font-normal">
                    {store.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Store highlight pills */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md flex items-center gap-1.5">
                <FontAwesomeIcon icon={faHandshake} className="w-3 h-3 text-emerald-400" />
                <span>{isRtl ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md flex items-center gap-1.5">
                <FontAwesomeIcon icon={faTruckFast} className="w-3 h-3 text-[#2997ff]" />
                <span>{isRtl ? "شحن لكافة المحافظات" : "Shipping Countrywide"}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md flex items-center gap-1.5">
                <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-amber-400" />
                <span>{isRtl ? "جودة مضمونة" : "Top Quality"}</span>
              </span>
            </div>
          </div>
          
          <div className="z-10 flex-shrink-0">
            <button 
              onClick={() => {
                const el = document.getElementById("catalog-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-apple-primary text-xs px-6 py-3"
            >
              <span>{isRtl ? "تصفح المجموعة" : "Explore Collection"}</span>
              <FontAwesomeIcon icon={isRtl ? faArrowLeft : faArrowRight} className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Categories Filter Bar */}
      {store.categories && store.categories.length > 0 && (
        <div className="apple-card p-4 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
                selectedCategoryId === null
                  ? "bg-[#0066cc] text-white shadow-none"
                  : "bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-white hover:bg-black/[0.04]"
              )}
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
                    "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "bg-[#0066cc] text-white shadow-none"
                      : "bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-white hover:bg-black/[0.04]"
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Sub-categories */}
          {activeParentCategory && activeParentCategory.children && activeParentCategory.children.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-black/[0.04] dark:border-white/[0.06] pt-3 max-w-full no-scrollbar">
              <span className="text-xs font-semibold text-[#86868b] flex-shrink-0">
                {isRtl ? "الفئة الفرعية:" : "Subcategory:"}
              </span>
              <button
                onClick={() => setSelectedCategoryId(activeParentCategory.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                  selectedCategoryId === activeParentCategory.id
                    ? "badge-apple-blue"
                    : "badge-apple-gray hover:bg-black/[0.06]"
                )}
              >
                {isRtl ? "الكل" : "All"}
              </button>
              {activeParentCategory.children.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedCategoryId(sub.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
                    selectedCategoryId === sub.id
                      ? "badge-apple-blue"
                      : "badge-apple-gray hover:bg-black/[0.06]"
                  )}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Catalog Grid */}
      <div id="catalog-section" className="space-y-6">
        <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
            {isRtl ? "المنتجات المتاحة" : "Featured Products"}
          </h2>
          <span className="text-xs text-[#86868b] font-medium">
            {products.length} {isRtl ? "منتج متوفر" : "products listed"}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="apple-card p-4 space-y-4 animate-pulse">
                <div className="h-48 w-full rounded-2xl bg-black/[0.04] dark:bg-white/[0.04]" />
                <div className="h-4 w-2/3 bg-black/[0.04] dark:bg-white/[0.04] rounded" />
                <div className="h-4 w-1/2 bg-black/[0.04] dark:bg-white/[0.04] rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="apple-card flex flex-col items-center justify-center text-center py-16 px-4 gap-3"
          >
            <FontAwesomeIcon icon={faBagShopping} className="w-10 h-10 text-[#86868b] opacity-30" />
            <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-white">
              {t("noProductsFound")}
            </h3>
            <p className="text-xs text-[#86868b] max-w-sm">
              {t("noProductsFoundDesc")}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.03 }}
                      className="apple-card p-4 flex flex-col justify-between group relative transition-all hover:shadow-apple-card hover:-translate-y-1"
                    >
                      <Link href={`/store/${slug}/products/${product.id}`} className="flex-1 flex flex-col group cursor-pointer">
                        {/* Image */}
                        <div className="relative h-52 w-full rounded-[18px] overflow-hidden bg-[#f5f5f7] dark:bg-[#272729] mb-3.5 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faBoxArchive} className="w-10 h-10 text-[#86868b] opacity-40" />
                          )}

                          {/* Badges */}
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                            {discountPercent > 0 && (
                              <span className="badge-apple-red text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {language === "ar" ? `-${discountPercent}%` : `${discountPercent}% OFF`}
                              </span>
                            )}
                            {product.isFeatured && (
                              <span className="badge-apple-blue text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {t("featured")}
                              </span>
                            )}
                          </div>

                          {outOfStock && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
                              <span className="px-3 py-1 rounded-full bg-[#1d1d1f] text-white text-xs font-semibold">
                                {t("outOfStock")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title & Category */}
                        <div className="flex-1 flex flex-col">
                          {product.category && (
                            <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider mb-1 block">
                              {product.category.name}
                            </span>
                          )}
                          <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white line-clamp-1 group-hover:text-[#0066cc] dark:group-hover:text-[#2997ff] transition-colors">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-xs text-[#86868b] mt-1 line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </Link>

                      {/* Pricing and Action */}
                      <div className="mt-4 pt-3.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                        <div>
                          {hasDiscount && (
                            <span className="text-[11px] font-medium text-[#86868b] line-through block leading-none mb-0.5">
                              {formatCurrency(Number(product.comparePrice), store.currency)}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-[#1d1d1f] dark:text-white">
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
                            "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 active:scale-95",
                            outOfStock
                              ? "btn-apple-pearl opacity-50 cursor-not-allowed"
                              : inCart
                              ? "bg-emerald-600 text-white"
                              : "btn-apple-primary"
                          )}
                        >
                          <FontAwesomeIcon icon={inCart ? faCheck : faPlus} className="w-2.5 h-2.5" />
                          <span>{inCart ? (isRtl ? "تمت الإضافة" : "Added") : (isRtl ? "شراء" : "Buy")}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/[0.04] dark:border-white/[0.06] pt-6" dir={isRtl ? "rtl" : "ltr"}>
                <p className="text-xs text-[#86868b]">
                  {isRtl
                    ? `عرض ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )} من أصل ${pagination.total} منتج`
                    : `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )} of ${pagination.total} products`}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      const el = document.getElementById("catalog-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    disabled={page === 1}
                    className="btn-apple-pearl px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    <FontAwesomeIcon icon={isRtl ? faArrowRight : faArrowLeft} className="w-2.5 h-2.5" />
                    <span>{isRtl ? "السابق" : "Previous"}</span>
                  </button>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.06] text-[#1d1d1f] dark:text-white">
                    {page} / {pagination.pages}
                  </span>
                  <button
                    onClick={() => {
                      setPage((p) => Math.min(pagination.pages, p + 1));
                      const el = document.getElementById("catalog-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    disabled={page === pagination.pages}
                    className="btn-apple-pearl px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    <span>{isRtl ? "التالي" : "Next"}</span>
                    <FontAwesomeIcon icon={isRtl ? faArrowLeft : faArrowRight} className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

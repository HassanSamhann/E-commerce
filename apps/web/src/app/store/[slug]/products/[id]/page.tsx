"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/cart.context";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language.context";
import Link from "next/link";

export default function StorefrontProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { slug, id } = params as { slug: string; id: string };
  const { addToCart, cartItems } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const isRtl = language === "ar";

  // Fetch store details (reads from React Query cache instantly)
  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => api.get(`/api/store/${slug}`).then((r) => r.data.store),
    enabled: !!slug,
  });

  // Fetch product details
  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["store-product", id],
    queryFn: () => api.get(`/api/store/${slug}/products/${id}`).then((r) => r.data.product),
    enabled: !!id && !!slug,
  });

  const product = productData;
  const isLoading = isStoreLoading || isProductLoading;

  if (isLoading || !store) {
    return (
      <div className="space-y-8 animate-pulse" dir={isRtl ? "rtl" : "ltr"}>
        {/* Breadcrumb Navigation Shimmer */}
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image Shimmer */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-[28px] aspect-square bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 shadow-sm" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Right Column: Meta Shimmer */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-9 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>

            {/* Price box Shimmer */}
            <div className="h-16 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/60" />

            {/* Description Shimmer */}
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>

            {/* Actions Shimmer */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-14 flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="h-14 flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !store) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          {isRtl ? "المنتج غير موجود" : "Product Not Found"}
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          {isRtl ? "قد يكون تم حذف المنتج أو نقله بواسطة التاجر." : "The product you are looking for does not exist or has been removed."}
        </p>
        <Link
          href={`/store/${slug}`}
          className="inline-flex items-center gap-2 mt-6 py-2.5 px-5 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          style={{ backgroundColor: store.primaryColor || "#6366f1" }}
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {t("backToStore")}
        </Link>
      </div>
    );
  }

  const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : 0;

  const inCart = cartItems.some((item) => item.id === product.id);
  const outOfStock = product.quantity <= 0;

  const handleAddToCart = () => {
    const firstImage = product.images?.[0]?.url;
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: firstImage,
      },
      quantity
    );

    toast({
      title: t("addedToCart"),
      description: `${product.name} ${t("addedToCartDesc")}`,
    });
  };

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          href={`/store/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {isRtl ? "العودة لكتالوج المنتجات" : "Back to Catalog"}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-3xl overflow-hidden aspect-square bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
            {product.images?.[activeImageIdx]?.url ? (
              <img
                src={product.images[activeImageIdx].url}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <ShoppingBag className="w-20 h-20 text-slate-300 stroke-[1.25]" />
            )}

            {/* Discount Badge */}
            {discountPercent > 0 && !outOfStock && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md z-10">
                {isRtl ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
              </span>
            )}

            {/* Out of Stock overlay */}
            {outOfStock && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                <span className="bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg">
                  {t("outOfStock")}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-white dark:bg-slate-900 flex-shrink-0 transition-all ${
                    activeImageIdx === idx
                      ? "border-brand-500 shadow-sm"
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                  style={{
                    borderColor: activeImageIdx === idx ? store.primaryColor || "#6366f1" : undefined,
                  }}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Meta & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            {product.quantity > 0 && product.quantity < 10 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black animate-pulse border border-amber-500/20 shadow-sm shadow-amber-500/5 mb-2">
                <span>🔥 {isRtl ? `عاجل: متبقي ${product.quantity} قطع فقط في المخزن!` : `Hurry up: Only ${product.quantity} items left in stock!`}</span>
              </div>
            )}
            {product.category && (
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                {product.category.name}
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Price Box */}
          <div className="p-5 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-855 flex items-center gap-4">
            <span className="text-2xl font-black text-slate-855 dark:text-white">
              {formatCurrency(Number(product.price), store.currency)}
            </span>
            {hasDiscount && (
              <span className="text-sm font-semibold text-slate-400 line-through">
                {formatCurrency(Number(product.comparePrice), store.currency)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isRtl ? "الوصف والتفاصيل" : "Description"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-850 p-5 rounded-2xl whitespace-pre-line shadow-sm">
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity and Cart buttons */}
          {!outOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {isRtl ? "الكمية المطلوبة:" : "Quantity:"}
                </span>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-500 transition-colors disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center text-slate-800 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-500 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-6 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg hover:opacity-95 shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] duration-150"
                  style={{ backgroundColor: store.primaryColor || "#6366f1" }}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {isRtl ? "إضافة لسلة المشتريات" : "Add to Shopping Cart"}
                </button>

                {store.phone && (
                  <a
                    href={`https://wa.me/${(() => {
                      const cleaned = store.phone.replace(/\D/g, "");
                      if (cleaned.startsWith("0")) return "2" + cleaned;
                      if (cleaned.startsWith("20")) return cleaned;
                      return "20" + cleaned;
                    })()}?text=${encodeURIComponent(
                      isRtl
                        ? `مرحباً، أود طلب منتج: ${product.name}\nبسعر: ${formatCurrency(product.price, store.currency)}\nالكمية: ${quantity}\nرابط المنتج: ${typeof window !== "undefined" ? window.location.href : ""}`
                        : `Hello, I want to order: ${product.name}\nPrice: ${formatCurrency(product.price, store.currency)}\nQuantity: ${quantity}\nLink: ${typeof window !== "undefined" ? window.location.href : ""}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-750 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/15 hover:scale-[1.01] active:scale-[0.99] duration-150 text-center"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.113.975 11.488.975c-5.442 0-9.866 4.372-9.87 9.802 0 1.698.48 3.35 1.387 4.825L1.97 21.03l5.677-1.876zm13.125-9.351c-.322-.16-.1.21-.83-.16-.403-.201-2.39-1.177-2.761-1.31-.37-.134-.64-.201-.91.201-.27.402-1.042 1.31-1.277 1.578-.235.268-.47.301-.79.141-.322-.16-1.362-.501-2.594-1.599-.958-.853-1.602-1.908-1.79-2.22-.19-.311-.02-.48.14-.64.14-.14.32-.37.48-.56.16-.18.21-.31.32-.51.11-.2.05-.38-.03-.54-.08-.16-.91-2.206-1.246-3.009-.329-.787-.663-.681-.912-.693-.235-.011-.504-.014-.772-.014-.27 0-.71.1-1.08.5-.37.4-1.41 1.38-1.41 3.367s1.44 3.9 1.64 4.168c.2.268 2.83 4.302 6.85 6.043 4.02 1.741 4.02 1.16 4.75 1.08.73-.08 2.39-.974 2.72-1.916.33-.942.33-1.751.23-1.918-.1-.168-.37-.268-.69-.428z" />
                    </svg>
                    <span>{isRtl ? "طلب مباشر عبر واتساب" : "Direct WhatsApp Order"}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center text-center p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-50 dark:border-slate-850 shadow-sm gap-2">
              <Truck className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-800 dark:text-white">{isRtl ? "شحن سريع" : "Fast Delivery"}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{isRtl ? "لكافة المحافظات" : "To all governorates"}</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-50 dark:border-slate-850 shadow-sm gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-800 dark:text-white">{isRtl ? "دفع آمن" : "Secure Payment"}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{isRtl ? "دفع كاش عند الاستلام" : "Cash on delivery"}</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-50 dark:border-slate-850 shadow-sm gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-[10px] font-bold text-slate-800 dark:text-white">{isRtl ? "استرجاع سهل" : "Easy Return"}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{isRtl ? "خلال 14 يوماً" : "Within 14 days"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

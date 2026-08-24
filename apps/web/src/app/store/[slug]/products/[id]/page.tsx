"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faArrowLeft,
  faArrowRight,
  faCircleNotch,
  faCheck,
  faPlus,
  faMinus,
  faShieldHalved,
  faTruckFast,
  faRotateLeft,
  faBoxArchive,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/cart.context";
import { formatCurrency, cn } from "@/lib/utils";
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
  const isRtl = language === "ar";

  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => api.get(`/api/store/${slug}`).then((r) => r.data.store),
    enabled: !!slug,
  });

  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["store-product", id],
    queryFn: () => api.get(`/api/store/${slug}/products/${id}`).then((r) => r.data.product),
    enabled: !!id && !!slug,
  });

  const product = productData;

  React.useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant((prev: any) => prev || product.variants[0]);
    }
  }, [product]);

  const isLoading = isStoreLoading || isProductLoading;

  if (isLoading || !store) {
    return (
      <div className="space-y-8 animate-pulse p-6 apple-card" dir={isRtl ? "rtl" : "ltr"}>
        <div className="h-4 w-32 bg-black/[0.06] dark:bg-white/[0.06] rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-[24px] aspect-square bg-black/[0.04] dark:bg-white/[0.04]" />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <div className="h-4 w-20 bg-black/[0.04] dark:bg-white/[0.04] rounded-full" />
            <div className="h-8 w-3/4 bg-black/[0.04] dark:bg-white/[0.04] rounded-xl" />
            <div className="h-12 w-1/3 bg-black/[0.04] dark:bg-white/[0.04] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product || !store) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
          <FontAwesomeIcon icon={faBoxArchive} className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white">
          {isRtl ? "المنتج غير متوفر" : "Product Not Found"}
        </h2>
        <p className="text-xs text-[#86868b] mt-1.5">
          {isRtl ? "قد يكون تم حذف المنتج أو نقله." : "The product you are looking for does not exist or has been removed."}
        </p>
        <Link
          href={`/store/${slug}`}
          className="btn-apple-primary text-xs mt-6 inline-flex"
        >
          <FontAwesomeIcon icon={isRtl ? faArrowRight : faArrowLeft} className="w-3 h-3" />
          <span>{t("backToStore")}</span>
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? Number(selectedVariant.price) : (product ? Number(product.price) : 0);
  const currentComparePrice = selectedVariant ? null : (product?.comparePrice ? Number(product.comparePrice) : null);
  const hasDiscount = currentComparePrice !== null && currentComparePrice > currentPrice;
  const discountPercent = hasDiscount && currentComparePrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  const itemId = selectedVariant ? `${product?.id}-${selectedVariant.id}` : (product?.id || "");
  const inCart = cartItems.some((item) => item.id === itemId);
  const outOfStock = selectedVariant ? selectedVariant.quantity <= 0 : (product ? product.quantity <= 0 : true);

  const handleAddToCart = () => {
    if (!product) return;
    const firstImage = product.images?.[0]?.url;
    const finalItemId = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
    const finalName = product.name;
    const finalPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
    const toastDesc = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;

    addToCart(
      {
        id: finalItemId,
        productId: product.id,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        name: finalName,
        price: finalPrice,
        image: firstImage,
      },
      quantity
    );

    toast({
      title: t("addedToCart"),
      description: `${toastDesc} ${t("addedToCartDesc")}`,
    });
  };

  return (
    <div className="space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          href={`/store/${slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#0066cc] dark:hover:text-[#2997ff] transition-colors"
        >
          <FontAwesomeIcon icon={isRtl ? faArrowRight : faArrowLeft} className="w-3 h-3" />
          <span>{isRtl ? "العودة لكتالوج المنتجات" : "Back to Catalog"}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative rounded-[24px] overflow-hidden aspect-square bg-white dark:bg-[#1d1d1f] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center shadow-apple-card">
            {product.images?.[activeImageIdx]?.url ? (
              <img
                src={product.images[activeImageIdx].url}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <FontAwesomeIcon icon={faBoxArchive} className="w-16 h-16 text-[#86868b] opacity-30" />
            )}

            {/* Badges */}
            {discountPercent > 0 && !outOfStock && (
              <span className="absolute top-4 left-4 badge-apple-red text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                {isRtl ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
              </span>
            )}

            {outOfStock && (
              <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
                <span className="px-4 py-1.5 rounded-full bg-[#1d1d1f] text-white text-xs font-semibold">
                  {t("outOfStock")}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-white dark:bg-[#1d1d1f] flex-shrink-0 transition-all ${
                    activeImageIdx === idx
                      ? "border-[#0066cc] dark:border-[#2997ff]"
                      : "border-black/[0.06] dark:border-white/[0.08]"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Meta & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-1.5">
            {product.quantity > 0 && product.quantity < 10 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-apple-amber text-xs font-semibold mb-2">
                <span>{isRtl ? `متبقي ${product.quantity} قطع فقط في المخزن!` : `Only ${product.quantity} items left in stock!`}</span>
              </div>
            )}
            {product.category && (
              <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider block">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* Price Box */}
          <div className="p-4 apple-card flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
              {formatCurrency(currentPrice, store.currency)}
            </span>
            {hasDiscount && currentComparePrice && (
              <span className="text-sm font-medium text-[#86868b] line-through">
                {formatCurrency(currentComparePrice, store.currency)}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                {isRtl ? "التفاصيل والمواصفات" : "Details"}
              </h3>
              <p className="text-xs sm:text-sm text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed apple-card p-4 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 apple-card p-4">
              <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                {isRtl ? "الخيارات المتاحة:" : "Available Variants:"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isOutOfStock = v.quantity <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        "px-3.5 py-2 rounded-full border text-xs font-semibold transition-all flex items-center gap-2",
                        isSelected
                          ? "border-[#0066cc] bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff]"
                          : "border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-white hover:border-black/[0.2] disabled:opacity-40 disabled:cursor-not-allowed"
                      )}
                    >
                      <span>{v.name}</span>
                      <span className="opacity-75 font-normal">({formatCurrency(Number(v.price), store.currency)})</span>
                      {isOutOfStock && <span className="text-rose-500 text-[10px]">{isRtl ? "نفذت" : "Sold out"}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Buy */}
          {!outOfStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#86868b]">
                  {isRtl ? "الكمية:" : "Quantity:"}
                </span>
                <div className="flex items-center gap-2 bg-[#f5f5f7] dark:bg-[#272729] rounded-full px-3 py-1 border border-black/[0.06] dark:border-white/[0.08]">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-40"
                  >
                    <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-semibold w-6 text-center text-[#1d1d1f] dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f]"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="btn-apple-primary flex-1 py-3 text-xs justify-center"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="w-3.5 h-3.5" />
                  <span>{isRtl ? "إضافة لحقيبة التسوق" : "Add to Shopping Bag"}</span>
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
                        ? `مرحباً، أود طلب منتج: ${product.name}\nالسعر: ${formatCurrency(product.price, store.currency)}\nالكمية: ${quantity}`
                        : `Hello, I would like to order: ${product.name}\nPrice: ${formatCurrency(product.price, store.currency)}\nQuantity: ${quantity}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 text-center"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4" />
                    <span>{isRtl ? "طلب مباشر بالواتساب" : "Direct WhatsApp Order"}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Trust Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
            <div className="apple-card p-3 text-center space-y-1">
              <FontAwesomeIcon icon={faTruckFast} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
              <p className="text-[11px] font-semibold text-[#1d1d1f] dark:text-white">{isRtl ? "شحن سريع" : "Fast Delivery"}</p>
              <p className="text-[10px] text-[#86868b]">{isRtl ? "لكافة المحافظات" : "Countrywide"}</p>
            </div>
            <div className="apple-card p-3 text-center space-y-1">
              <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[11px] font-semibold text-[#1d1d1f] dark:text-white">{isRtl ? "دفع آمن" : "Secure Pay"}</p>
              <p className="text-[10px] text-[#86868b]">{isRtl ? "عند الاستلام" : "Cash on delivery"}</p>
            </div>
            <div className="apple-card p-3 text-center space-y-1">
              <FontAwesomeIcon icon={faRotateLeft} className="w-4 h-4 text-amber-500" />
              <p className="text-[11px] font-semibold text-[#1d1d1f] dark:text-white">{isRtl ? "استرجاع سهل" : "Easy Returns"}</p>
              <p className="text-[10px] text-[#86868b]">{isRtl ? "خلال 14 يوماً" : "Within 14 days"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

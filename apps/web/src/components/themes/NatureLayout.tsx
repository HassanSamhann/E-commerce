"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faXmark,
  faPlus,
  faMinus,
  faTrashCan,
  faStore,
  faLeaf,
  faWind,
  faSeedling,
  faMagnifyingGlass,
  faBars,
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/cart.context";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language.context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

interface NatureLayoutProps {
  store: any;
  children: React.ReactNode;
}

export function NatureLayout({ store, children }: NatureLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const isRtl = language === "ar";
  const { cartCount, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const isCheckoutPage = pathname.endsWith("/checkout");

  const green = store.primaryColor || "#2e7d32";
  const cream = "#f8f9fa";
  const bark = "#1d1d1f";

  const cleanPhone = (p: string) => {
    const c = p.replace(/\D/g, "");
    return c.startsWith("0") ? "2" + c : c.startsWith("20") ? c : "20" + c;
  };

  useEffect(() => { setSearchVal(searchParams.get("search") || ""); }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/store/${params.slug}?search=${searchVal}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] text-[#1d1d1f]">
      {/* Top Banner */}
      <div className="text-white text-[12px] font-semibold py-2 px-4 text-center bg-emerald-700">
        <div className="flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5"><FontAwesomeIcon icon={faLeaf} className="w-3 h-3" /> {isRtl ? "منتجات طبيعية 100%" : "100% Verified Quality"}</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">{isRtl ? "دفع آمن عند الاستلام" : "Cash on Delivery Available"}</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <Link href={`/store/${params.slug}`} className="flex items-center gap-2.5 flex-shrink-0">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-9 h-9 rounded-full object-cover border border-emerald-600/20" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-600 text-white shadow-sm">
                  <FontAwesomeIcon icon={faLeaf} className="w-4 h-4" />
                </div>
              )}
              <span className="text-base font-semibold tracking-tight">{store.name}</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto hidden md:flex">
              <div className="relative w-full">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#86868b]" />
                <input
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder={isRtl ? "ابحث عن المنتجات..." : "Search products..."}
                  className="apple-search-pill pl-9 pr-4"
                />
              </div>
            </form>

            <div className="flex items-center gap-2.5">
              <LanguageSwitcher />
              {!isCheckoutPage && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="w-3 h-3" />
                  <span className="hidden sm:inline">{isRtl ? "الحقيبة" : "Bag"}</span>
                  {cartCount > 0 && (
                    <span className="w-4 h-4 text-[10px] font-bold text-white bg-emerald-600 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-12 text-center text-xs text-[#86868b] bg-white">
        <p>© {new Date().getFullYear()} {store.name}. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-50 bg-black" />
            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "tween", duration: 0.24 }}
              className={cn("fixed top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-apple-modal flex flex-col border-l border-black/[0.08]", isRtl ? "left-0" : "right-0")}
            >
              <div className="flex items-center justify-between p-5 border-b border-black/[0.04]" dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base font-semibold text-[#1d1d1f]">{t("shoppingCart")}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700">{cartCount}</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:bg-black/[0.04]">
                  <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-2 text-[#86868b]">
                    <FontAwesomeIcon icon={faBagShopping} className="w-8 h-8 opacity-20" />
                    <p className="font-semibold text-sm text-[#1d1d1f]">{t("cartIsEmpty")}</p>
                  </div>
                ) : cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3.5 py-3 border-b border-black/[0.04] last:border-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <FontAwesomeIcon icon={faLeaf} className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#1d1d1f] line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-semibold text-emerald-700 mt-0.5">{formatCurrency(item.price, store.currency)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#86868b]">
                          <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#86868b]">
                          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:text-rose-600">
                      <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {cartItems.length > 0 && (
                <div className="p-5 border-t border-black/[0.04] bg-[#f5f5f7]" dir={isRtl ? "rtl" : "ltr"}>
                  <div className="flex items-center justify-between text-sm font-semibold mb-3">
                    <span>{t("totalAmount")}</span>
                    <span className="text-emerald-700 text-base">{formatCurrency(cartTotal, store.currency)}</span>
                  </div>
                  <button
                    onClick={() => { setIsCartOpen(false); router.push(`/store/${params.slug}/checkout`); }}
                    className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors"
                  >
                    {t("proceedToCheckout")}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

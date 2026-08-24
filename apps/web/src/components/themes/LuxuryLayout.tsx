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
  faCrown,
  faGem,
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

interface LuxuryLayoutProps {
  store: any;
  children: React.ReactNode;
}

export function LuxuryLayout({ store, children }: LuxuryLayoutProps) {
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

  // Luxury gold & obsidian palette
  const gold = "#c9a84c";
  const darkBg = "#0c0c0c";
  const darkSurface = "#161617";
  const darkBorder = "#272729";

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: darkBg, color: "#e8e0d0" }}>
      {/* Gold top marquee */}
      <div className="text-black text-[11px] font-semibold py-2 px-4 text-center overflow-hidden" style={{ backgroundColor: gold }}>
        <div className="flex items-center justify-center gap-6">
          <span>✦ {isRtl ? "شحن سريع لكافة المحافظات" : "Premium Express Shipping"} ✦</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">✦ {isRtl ? "الدفع عند الاستلام" : "Cash on Delivery Available"} ✦</span>
        </div>
      </div>

      {/* Sticky Obsidian Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ backgroundColor: "rgba(12,12,12,0.92)", borderColor: darkBorder }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href={`/store/${params.slug}`} className="flex items-center gap-3 flex-shrink-0 group">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-10 h-10 rounded-full object-cover p-0.5 border" style={{ borderColor: gold }} />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ borderColor: gold, color: gold }}>
                  <FontAwesomeIcon icon={faCrown} className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="text-base font-semibold tracking-wider uppercase block" style={{ color: "#f5e6c8" }}>
                  {store.name}
                </span>
                <span className="text-[9px] tracking-[0.25em] uppercase block font-mono" style={{ color: gold }}>
                  {isRtl ? "إصدار فاخر" : "Luxury Edition"}
                </span>
              </div>
            </Link>

            {/* Center navigation */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider uppercase" style={{ color: "#8a7a60" }}>
              <Link href={`/store/${params.slug}`} className="hover:text-white transition-colors" style={!pathname.includes("/products/") && !isCheckoutPage ? { color: gold } : {}}>
                {isRtl ? "الرئيسية" : "Home"}
              </Link>
              {store.categories?.slice(0, 4).map((cat: any) => (
                <Link key={cat.id} href={`/store/${params.slug}?categoryId=${cat.id}`} className="hover:text-white transition-colors whitespace-nowrap">
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="hidden md:flex items-center rounded-full border px-3.5 py-1 gap-2" style={{ borderColor: darkBorder, backgroundColor: darkSurface }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3 h-3 flex-shrink-0" style={{ color: gold }} />
                <input
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder={isRtl ? "بحث..." : "Search..."}
                  className="bg-transparent text-xs focus:outline-none w-32 text-white placeholder-zinc-500"
                />
              </form>

              <LanguageSwitcher />

              {!isCheckoutPage && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all hover:border-[#c9a84c]"
                  style={{ borderColor: darkBorder, color: gold }}
                >
                  <FontAwesomeIcon icon={faBagShopping} className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isRtl ? "الحقيبة" : "Bag"}</span>
                  {cartCount > 0 && (
                    <span className="w-4 h-4 text-[10px] font-bold text-black rounded-full flex items-center justify-center" style={{ backgroundColor: gold }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              <button
                className="md:hidden w-8 h-8 rounded-full border flex items-center justify-center"
                style={{ borderColor: darkBorder, color: gold }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <FontAwesomeIcon icon={faBars} className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Banner */}
      {store.coverUrl && (
        <div className="relative w-full h-56 sm:h-72 overflow-hidden">
          <img src={store.coverUrl} alt={store.name} className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3" style={{ background: "linear-gradient(to bottom, rgba(12,12,12,0.3), rgba(12,12,12,0.85))" }}>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white text-center tracking-tight" style={{ color: "#f5e6c8" }}>
              {store.name}
            </h1>
            {store.description && (
              <p className="text-xs text-center max-w-md" style={{ color: "#a08060" }}>
                {store.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-12" style={{ backgroundColor: darkSurface, borderColor: darkBorder }} dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-semibold tracking-tight uppercase mb-2" style={{ color: "#f5e6c8" }}>{store.name}</h3>
          <p className="text-xs max-w-md mx-auto mb-6" style={{ color: "#8a7a60" }}>
            {store.description || (isRtl ? "نوفر لك أرقى المنتجات بجودة استثنائية." : "Providing premium goods with verified quality.")}
          </p>
          <div className="pt-6 border-t text-xs" style={{ borderColor: darkBorder, color: "#6a5a40" }}>
            <p>© {new Date().getFullYear()} {store.name}. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-50 bg-black" />
            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "tween", duration: 0.24 }}
              className={cn("fixed top-0 bottom-0 z-50 w-full max-w-md flex flex-col border-l", isRtl ? "left-0" : "right-0")}
              style={{ backgroundColor: darkSurface, borderColor: darkBorder }}
            >
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: darkBorder }} dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faCrown} className="w-4 h-4" style={{ color: gold }} />
                  <h2 className="text-base font-semibold text-white">{t("shoppingCart")}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold text-black" style={{ backgroundColor: gold }}>{cartCount}</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-white">
                  <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 gap-2">
                    <FontAwesomeIcon icon={faBagShopping} className="w-10 h-10 opacity-20" style={{ color: gold }} />
                    <p className="font-semibold text-sm" style={{ color: "#8a7a60" }}>{t("cartIsEmpty")}</p>
                  </div>
                ) : cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3.5 py-3 border-b last:border-0" style={{ borderColor: darkBorder }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1e1e1e" }}>
                        <FontAwesomeIcon icon={faStore} className="w-4 h-4" style={{ color: gold }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: gold }}>{formatCurrency(item.price, store.currency)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400" style={{ backgroundColor: "#1e1e1e" }}>
                          <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-semibold w-5 text-center text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400" style={{ backgroundColor: "#1e1e1e" }}>
                          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-500 hover:text-rose-500">
                      <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {cartItems.length > 0 && (
                <div className="p-5 border-t" style={{ borderColor: darkBorder, backgroundColor: "#111112" }} dir={isRtl ? "rtl" : "ltr"}>
                  <div className="flex items-center justify-between font-semibold text-sm mb-3">
                    <span>{t("totalAmount")}</span>
                    <span style={{ color: gold }} className="text-base">{formatCurrency(cartTotal, store.currency)}</span>
                  </div>
                  <button
                    onClick={() => { setIsCartOpen(false); router.push(`/store/${params.slug}/checkout`); }}
                    className="w-full py-3 rounded-full text-black font-semibold text-xs tracking-wider uppercase transition-opacity hover:opacity-90"
                    style={{ backgroundColor: gold }}
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

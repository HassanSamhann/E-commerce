"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingBag, X, Plus, Minus, Trash2, Store, Loader2,
  ChevronDown, ChevronRight, ChevronLeft, Search, Menu, Phone, Mail,
  Diamond, Crown, Gem,
} from "lucide-react";
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const isCheckoutPage = pathname.endsWith("/checkout");

  // Luxury gold palette
  const gold = "#c9a84c";
  const darkBg = "#0c0c0c";
  const darkSurface = "#141414";
  const darkBorder = "#2a2a2a";

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
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: darkBg, color: "#e8e0d0" }}>

      {/* Gold marquee announcement bar */}
      <div className="text-black text-[11px] font-bold py-2 px-4 text-center overflow-hidden relative" style={{ backgroundColor: gold }}>
        <div className="flex items-center justify-center gap-8 animate-pulse">
          <span className="flex items-center gap-2">✦ {isRtl ? "شحن سريع وآمن" : "Premium Fast Shipping"} ✦</span>
          <span>|</span>
          <span className="flex items-center gap-2">✦ {isRtl ? "الدفع عند الاستلام" : "Cash on Delivery"} ✦</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:flex items-center gap-2">✦ {isRtl ? "جودة مضمونة" : "Quality Guaranteed"} ✦</span>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ backgroundColor: "rgba(12,12,12,0.95)", borderColor: darkBorder }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link href={`/store/${params.slug}`} className="flex items-center gap-3 flex-shrink-0 group">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-12 h-12 rounded-full object-contain p-0.5 border-2 group-hover:scale-105 transition-transform" style={{ borderColor: gold }} />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 group-hover:scale-105 transition-transform" style={{ backgroundColor: "transparent", borderColor: gold }}>
                  <Crown className="w-5 h-5" style={{ color: gold }} />
                </div>
              )}
              <div>
                <span className="text-xl font-bold tracking-widest uppercase block" style={{ fontFamily: "'Playfair Display', serif", color: "#f5e6c8", letterSpacing: "0.15em" }}>
                  {store.name}
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase block" style={{ color: gold }}>
                  {isRtl ? "متجر فاخر" : "Luxury Store"}
                </span>
              </div>
            </Link>

            {/* Desktop Center Nav */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-widest uppercase" style={{ color: "#a09070", letterSpacing: "0.12em" }}>
              <Link href={`/store/${params.slug}`} className="hover:text-white transition-colors" style={!pathname.includes("/products/") && !isCheckoutPage ? { color: gold } : {}}>
                {isRtl ? "الرئيسية" : "Home"}
              </Link>
              {store.categories?.slice(0, 4).map((cat: any) => (
                <Link key={cat.id} href={`/store/${params.slug}?categoryId=${cat.id}`} className="hover:text-white transition-colors whitespace-nowrap">
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center rounded-full border px-4 py-1.5 gap-2 transition-all focus-within:border-yellow-600" style={{ borderColor: darkBorder, backgroundColor: darkSurface }}>
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: gold }} />
                <input
                  value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                  placeholder={isRtl ? "بحث..." : "Search..."}
                  className="bg-transparent text-sm focus:outline-none w-36 text-white placeholder-zinc-600"
                />
              </form>

              <LanguageSwitcher />

              {!isCheckoutPage && (
                <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold transition-all hover:border-yellow-600 hover:text-yellow-400" style={{ borderColor: darkBorder, color: "#c0a060" }}>
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">{isRtl ? "السلة" : "Cart"}</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[10px] font-black text-black rounded-full flex items-center justify-center" style={{ backgroundColor: gold }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              )}

              <button className="md:hidden p-2 rounded-full border" style={{ borderColor: darkBorder, color: gold }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Strip */}
        {store.categories?.length > 0 && (
          <div className="border-t" style={{ borderColor: darkBorder, backgroundColor: darkSurface }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto flex items-center gap-4" dir={isRtl ? "rtl" : "ltr"}>
              {store.categories.map((cat: any) => (
                <Link key={cat.id} href={`/store/${params.slug}?categoryId=${cat.id}`}
                  className="text-xs font-semibold tracking-widest uppercase whitespace-nowrap transition-all px-1 py-1 border-b-2 border-transparent hover:border-yellow-500 hover:text-yellow-400"
                  style={{ color: "#7a6a50", letterSpacing: "0.1em" }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ backgroundColor: darkSurface, borderTop: `1px solid ${darkBorder}` }}>
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-3" dir={isRtl ? "rtl" : "ltr"}>
                <form onSubmit={handleSearch} className="flex items-center rounded-full border px-4 py-2 gap-2" style={{ borderColor: darkBorder }}>
                  <Search className="w-4 h-4" style={{ color: gold }} />
                  <input value={searchVal} onChange={(e) => setSearchVal(e.target.value)} placeholder={isRtl ? "بحث..." : "Search..."} className="bg-transparent text-sm focus:outline-none flex-1 text-white placeholder-zinc-600" />
                </form>
                <nav className="flex flex-col gap-1">
                  {store.categories?.map((cat: any) => (
                    <Link key={cat.id} href={`/store/${params.slug}?categoryId=${cat.id}`} onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2.5 text-sm font-semibold tracking-wider rounded-lg transition-colors hover:text-yellow-400"
                      style={{ color: "#8a7a60" }}>
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cover Banner */}
      {store.coverUrl && (
        <div className="relative w-full h-56 sm:h-72 overflow-hidden">
          <img src={store.coverUrl} alt={store.name} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3" style={{ background: "linear-gradient(to bottom, rgba(12,12,12,0.3), rgba(12,12,12,0.8))" }}>
            <div className="flex items-center gap-3">
              <div className="h-px w-12" style={{ backgroundColor: gold }} />
              <Gem className="w-5 h-5" style={{ color: gold }} />
              <div className="h-px w-12" style={{ backgroundColor: gold }} />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white text-center tracking-widest uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
              {store.name}
            </h1>
            {store.description && (
              <p className="text-sm text-center max-w-md tracking-wider" style={{ color: "#a08060" }}>
                {store.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <div className="h-px w-12" style={{ backgroundColor: gold }} />
              <Diamond className="w-3 h-3" style={{ color: gold }} />
              <div className="h-px w-12" style={{ backgroundColor: gold }} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-14" style={{ backgroundColor: darkSurface, borderColor: darkBorder }} dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16" style={{ backgroundColor: gold }} />
              <Crown className="w-5 h-5" style={{ color: gold }} />
              <div className="h-px w-16" style={{ backgroundColor: gold }} />
            </div>
            <h3 className="text-2xl font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#f5e6c8" }}>{store.name}</h3>
            <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: "#6a5a40" }}>
              {store.description || (isRtl ? "نوفر لك أرقى المنتجات بجودة لا مثيل لها." : "Offering you the finest products with unmatched quality.")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            <div className="text-center">
              <h4 className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: gold }}>{isRtl ? "روابط" : "Navigation"}</h4>
              <ul className="space-y-2 text-sm" style={{ color: "#5a4a30" }}>
                <li><Link href={`/store/${params.slug}`} className="hover:text-yellow-400 transition-colors">{isRtl ? "المنتجات" : "Products"}</Link></li>
                <li><Link href={`/store/${params.slug}/checkout`} className="hover:text-yellow-400 transition-colors">{isRtl ? "السلة" : "Cart"}</Link></li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: gold }}>{isRtl ? "تواصل" : "Contact"}</h4>
              <ul className="space-y-2 text-sm" style={{ color: "#5a4a30" }}>
                {store.email && <li><a href={`mailto:${store.email}`} className="hover:text-yellow-400 transition-colors">{store.email}</a></li>}
                {store.phone && <li dir="ltr"><a href={`tel:${store.phone}`} className="hover:text-yellow-400 transition-colors">{store.phone}</a></li>}
              </ul>
            </div>
            <div className="text-center">
              <h4 className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: gold }}>{isRtl ? "خدماتنا" : "Services"}</h4>
              <ul className="space-y-2 text-sm" style={{ color: "#5a4a30" }}>
                <li>✦ {isRtl ? "شحن سريع" : "Fast Delivery"}</li>
                <li>✦ {isRtl ? "دفع عند الاستلام" : "Cash on Delivery"}</li>
                <li>✦ {isRtl ? "جودة مضمونة" : "Quality Guaranteed"}</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-xs" style={{ borderColor: darkBorder, color: "#4a3a20" }}>
            <p>© {new Date().getFullYear()} {store.name}. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg border-t px-6 py-2.5 flex items-center justify-between sm:hidden" style={{ backgroundColor: "rgba(12,12,12,0.97)", borderColor: darkBorder }}>
        <Link href={`/store/${params.slug}`} className="flex flex-col items-center gap-1 text-sm" style={{ color: "#6a5a40" }}>
          <Store className="w-5 h-5" /><span className="text-[10px] font-black">{isRtl ? "الرئيسية" : "Home"}</span>
        </Link>
        <button onClick={() => setIsCartOpen(true)} className="relative flex flex-col items-center gap-1" style={{ color: "#6a5a40" }}>
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 text-[9px] font-black text-black rounded-full flex items-center justify-center" style={{ backgroundColor: gold }}>{cartCount}</span>}
          <span className="text-[10px] font-black">{isRtl ? "السلة" : "Cart"}</span>
        </button>
        {store.phone && (
          <a href={`https://wa.me/${cleanPhone(store.phone)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1" style={{ color: "#6a5a40" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" style={{ color: "#2dbe60" }}><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.113.975 11.488.975c-5.442 0-9.866 4.372-9.87 9.802 0 1.698.48 3.35 1.387 4.825L1.97 21.03l5.677-1.876zm13.125-9.351c-.322-.16-.1.21-.83-.16-.403-.201-2.39-1.177-2.761-1.31-.37-.134-.64-.201-.91.201-.27.402-1.042 1.31-1.277 1.578-.235.268-.47.301-.79.141-.322-.16-1.362-.501-2.594-1.599-.958-.853-1.602-1.908-1.79-2.22-.19-.311-.02-.48.14-.64.14-.14.32-.37.48-.56.16-.18.21-.31.32-.51.11-.2.05-.38-.03-.54-.08-.16-.91-2.206-1.246-3.009-.329-.787-.663-.681-.912-.693-.235-.011-.504-.014-.772-.014-.27 0-.71.1-1.08.5-.37.4-1.41 1.38-1.41 3.367s1.44 3.9 1.64 4.168c.2.268 2.83 4.302 6.85 6.043 4.02 1.741 4.02 1.16 4.75 1.08.73-.08 2.39-.974 2.72-1.916.33-.942.33-1.751.23-1.918-.1-.168-.37-.268-.69-.428z" /></svg>
            <span className="text-[10px] font-black">{isRtl ? "دعم" : "Support"}</span>
          </a>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-50 bg-black" />
            <motion.div initial={{ x: isRtl ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRtl ? "-100%" : "100%" }} transition={{ type: "tween", duration: 0.28 }}
              className={cn("fixed top-0 bottom-0 z-50 w-full max-w-md flex flex-col border-l", isRtl ? "left-0" : "right-0")}
              style={{ backgroundColor: darkSurface, borderColor: darkBorder }}>
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: darkBorder }} dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5" style={{ color: gold }} />
                  <h2 className="text-lg font-bold tracking-wider" style={{ fontFamily: "'Playfair Display', serif", color: "#f5e6c8" }}>{t("shoppingCart")}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold text-black" style={{ backgroundColor: gold }}>{cartCount}</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <ShoppingBag className="w-10 h-10 opacity-20 mb-3" style={{ color: gold }} />
                    <p className="font-semibold" style={{ color: "#8a7a60" }}>{t("cartIsEmpty")}</p>
                  </div>
                ) : cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0" style={{ borderColor: darkBorder }}>
                    {item.image ? <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover opacity-90" /> : <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1e1e1e" }}><Store className="w-6 h-6" style={{ color: gold }} /></div>}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold line-clamp-1" style={{ color: "#e8e0d0" }}>{item.name}</h4>
                      {item.variantName && <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5" style={{ backgroundColor: "#1e1e1e", color: "#8a7a60" }}>{item.variantName}</span>}
                      <p className="text-sm font-black mt-0.5" style={{ color: gold }}>{formatCurrency(item.price, store.currency)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded text-zinc-400 hover:text-white transition-colors" style={{ backgroundColor: "#1e1e1e" }}><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-xs font-semibold w-6 text-center" style={{ color: "#e8e0d0" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded text-zinc-400 hover:text-white transition-colors" style={{ backgroundColor: "#1e1e1e" }}><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              {cartItems.length > 0 && (
                <div className="p-5 border-t" style={{ borderColor: darkBorder, backgroundColor: "#0e0e0e" }} dir={isRtl ? "rtl" : "ltr"}>
                  <div className="flex items-center justify-between font-black mb-4" style={{ color: "#e8e0d0" }}>
                    <span>{t("totalAmount")}</span>
                    <span style={{ color: gold }}>{formatCurrency(cartTotal, store.currency)}</span>
                  </div>
                  <button onClick={() => { setIsCartOpen(false); router.push(`/store/${params.slug}/checkout`); }}
                    className="w-full py-3.5 px-4 rounded-lg text-black font-bold text-center tracking-widest uppercase text-sm transition-opacity hover:opacity-90" style={{ backgroundColor: gold }}>
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

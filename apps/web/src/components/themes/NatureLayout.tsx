"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingCart, X, Plus, Minus, Trash2, Store, Loader2,
  ChevronDown, ChevronRight, ChevronLeft, Search, Menu, Phone, Mail, Leaf, Wind, Flower2,
} from "lucide-react";
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
  const [activeParentCat, setActiveParentCat] = useState<any>(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const isCheckoutPage = pathname.endsWith("/checkout");

  // Nature palette
  const green = store.primaryColor || "#2d7a4f";
  const cream = "#f5f0e8";
  const bark = "#4a3728";
  const softGreen = "#e8f0eb";
  const earthBrown = "#8b6914";

  const cleanPhone = (p: string) => {
    const c = p.replace(/\D/g, "");
    return c.startsWith("0") ? "2" + c : c.startsWith("20") ? c : "20" + c;
  };

  useEffect(() => { setSearchVal(searchParams.get("search") || ""); }, [searchParams]);
  useEffect(() => {
    if (store.categories?.length > 0 && !activeParentCat) setActiveParentCat(store.categories[0]);
  }, [store.categories, activeParentCat]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/store/${params.slug}?search=${searchVal}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: cream, color: bark }}>

      {/* Nature announcement bar */}
      <div className="text-white text-[11px] font-medium py-2 px-4 text-center" style={{ backgroundColor: green }}>
        <div className="flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5"><Leaf className="w-3 h-3" /> {isRtl ? "منتجات طبيعية 100%" : "100% Natural Products"}</span>
          <span className="w-px h-3 bg-white/30" />
          <span className="flex items-center gap-1.5"><Wind className="w-3 h-3" /> {isRtl ? "شحن سريع" : "Fast Delivery"}</span>
          <span className="hidden sm:flex w-px h-3 bg-white/30" />
          <span className="hidden sm:flex items-center gap-1.5"><Flower2 className="w-3 h-3" /> {isRtl ? "دفع عند الاستلام" : "Cash on Delivery"}</span>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b shadow-sm" style={{ backgroundColor: "rgba(245,240,232,0.97)", borderColor: "#d4cbb8" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href={`/store/${params.slug}`} className="flex items-center gap-2.5 flex-shrink-0 group">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-11 h-11 rounded-2xl object-contain border-2 group-hover:scale-105 transition-transform" style={{ borderColor: green + "40", backgroundColor: softGreen }} />
              ) : (
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform" style={{ backgroundColor: softGreen, border: `2px solid ${green}30` }}>
                  <Leaf className="w-5 h-5" style={{ color: green }} />
                </div>
              )}
              <div>
                <span className="text-lg font-bold block" style={{ fontFamily: "'Playfair Display', serif", color: bark }}>{store.name}</span>
                <span className="text-[9px] font-medium tracking-widest uppercase block" style={{ color: green }}>{isRtl ? "متجر طبيعي" : "Natural Store"}</span>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto hidden md:flex">
              <div className="flex w-full rounded-2xl border overflow-hidden transition-all focus-within:shadow-md" style={{ borderColor: "#c8bfa0", backgroundColor: "#fff" }}>
                <input value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                  placeholder={isRtl ? "ابحث عن منتجاتك الطبيعية..." : "Search natural products..."}
                  className="flex-1 px-4 py-2.5 bg-transparent text-sm focus:outline-none" style={{ color: bark }} />
                <button type="submit" className="px-5 py-2.5 text-white font-bold text-sm flex items-center gap-1.5 transition-opacity hover:opacity-90" style={{ backgroundColor: green }}>
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <LanguageSwitcher />
              {!isCheckoutPage && (
                <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm transition-all hover:shadow-md" style={{ backgroundColor: softGreen, color: green, border: `1px solid ${green}30` }}>
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">{isRtl ? "السلة" : "Cart"}</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[10px] font-black text-white rounded-full flex items-center justify-center" style={{ backgroundColor: green }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              <button className="md:hidden p-2.5 rounded-xl" style={{ backgroundColor: softGreen, color: green }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category nav */}
        {store.categories?.length > 0 && (
          <div className="hidden sm:block border-t" style={{ borderColor: "#d4cbb8", backgroundColor: "#efebe0" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-1 overflow-x-auto" dir={isRtl ? "rtl" : "ltr"}>
              {store.categories.map((cat: any) => (
                <Link key={cat.id} href={`/store/${params.slug}?categoryId=${cat.id}`}
                  className="px-4 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all"
                  style={{
                    backgroundColor: "transparent",
                    color: "#6b5a3a",
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = softGreen; (e.target as HTMLElement).style.color = green; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = "transparent"; (e.target as HTMLElement).style.color = "#6b5a3a"; }}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner */}
      {store.coverUrl ? (
        <div className="relative w-full h-60 sm:h-80 overflow-hidden">
          <img src={store.coverUrl} alt={store.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-end pb-10 px-6" style={{ background: "linear-gradient(to top, rgba(74,55,40,0.8), transparent)" }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4" style={{ color: "#a0d88a" }} />
                <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#a0d88a" }}>{isRtl ? "متجر طبيعي" : "Natural Products"}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{store.name}</h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full py-10 px-4" style={{ backgroundColor: softGreen }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="w-4 h-4" style={{ color: green }} />
                <span className="text-xs font-medium tracking-widest uppercase" style={{ color: green }}>{isRtl ? "منتجات طبيعية" : "Natural Products"}</span>
              </div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: bark }}>{store.name}</h1>
              {store.description && <p className="mt-2 text-sm max-w-md" style={{ color: "#6b5a3a" }}>{store.description}</p>}
            </div>
            <div className="text-6xl opacity-20">🌿</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-14" style={{ backgroundColor: "#eee8d5", borderColor: "#d4cbb8" }} dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12" style={{ backgroundColor: green }} />
              <Flower2 className="w-5 h-5" style={{ color: green }} />
              <div className="h-px w-12" style={{ backgroundColor: green }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: bark }}>{store.name}</h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: "#6b5a3a" }}>{store.description || (isRtl ? "نوفر لك منتجات طبيعية 100% بجودة استثنائية." : "Premium 100% natural products for your wellness.")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            <div className="text-center">
              <h4 className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: green }}>{isRtl ? "روابط" : "Navigation"}</h4>
              <ul className="space-y-2 text-sm" style={{ color: "#6b5a3a" }}>
                <li><Link href={`/store/${params.slug}`} className="transition-colors" style={{ color: "#6b5a3a" }}>{isRtl ? "المنتجات" : "Products"}</Link></li>
                <li><Link href={`/store/${params.slug}/checkout`} className="transition-colors" style={{ color: "#6b5a3a" }}>{isRtl ? "السلة" : "Cart"}</Link></li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: green }}>{isRtl ? "تواصل" : "Contact"}</h4>
              <ul className="space-y-2 text-sm" style={{ color: "#6b5a3a" }}>
                {store.email && <li><a href={`mailto:${store.email}`} style={{ color: green }}>{store.email}</a></li>}
                {store.phone && <li dir="ltr"><a href={`tel:${store.phone}`} style={{ color: green }}>{store.phone}</a></li>}
              </ul>
            </div>
            <div className="text-center">
              <h4 className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: green }}>{isRtl ? "مميزاتنا" : "Features"}</h4>
              <ul className="space-y-2 text-sm" style={{ color: "#6b5a3a" }}>
                <li className="flex items-center justify-center gap-2"><Leaf className="w-3.5 h-3.5" style={{ color: green }} /> {isRtl ? "طبيعي 100%" : "100% Natural"}</li>
                <li className="flex items-center justify-center gap-2"><Wind className="w-3.5 h-3.5" style={{ color: green }} /> {isRtl ? "شحن سريع" : "Fast Delivery"}</li>
                <li className="flex items-center justify-center gap-2"><Flower2 className="w-3.5 h-3.5" style={{ color: green }} /> {isRtl ? "ضمان الجودة" : "Quality Guarantee"}</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-xs" style={{ borderColor: "#c8bfa0", color: "#8b7a5a" }}>
            <p>© {new Date().getFullYear()} {store.name}. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t px-6 py-2.5 flex items-center justify-between sm:hidden shadow-lg" style={{ backgroundColor: cream, borderColor: "#d4cbb8" }}>
        <Link href={`/store/${params.slug}`} className="flex flex-col items-center gap-1" style={{ color: "#8b7a5a" }}>
          <Store className="w-5 h-5" /><span className="text-[10px] font-black">{isRtl ? "الرئيسية" : "Home"}</span>
        </Link>
        <button onClick={() => setIsCartOpen(true)} className="relative flex flex-col items-center gap-1" style={{ color: "#8b7a5a" }}>
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 text-[9px] font-black text-white rounded-full flex items-center justify-center" style={{ backgroundColor: green }}>{cartCount}</span>}
          <span className="text-[10px] font-black">{isRtl ? "السلة" : "Cart"}</span>
        </button>
        {store.phone && (
          <a href={`https://wa.me/${cleanPhone(store.phone)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1" style={{ color: "#8b7a5a" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-emerald-600"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.113.975 11.488.975c-5.442 0-9.866 4.372-9.87 9.802 0 1.698.48 3.35 1.387 4.825L1.97 21.03l5.677-1.876zm13.125-9.351c-.322-.16-.1.21-.83-.16-.403-.201-2.39-1.177-2.761-1.31-.37-.134-.64-.201-.91.201-.27.402-1.042 1.31-1.277 1.578-.235.268-.47.301-.79.141-.322-.16-1.362-.501-2.594-1.599-.958-.853-1.602-1.908-1.79-2.22-.19-.311-.02-.48.14-.64.14-.14.32-.37.48-.56.16-.18.21-.31.32-.51.11-.2.05-.38-.03-.54-.08-.16-.91-2.206-1.246-3.009-.329-.787-.663-.681-.912-.693-.235-.011-.504-.014-.772-.014-.27 0-.71.1-1.08.5-.37.4-1.41 1.38-1.41 3.367s1.44 3.9 1.64 4.168c.2.268 2.83 4.302 6.85 6.043 4.02 1.741 4.02 1.16 4.75 1.08.73-.08 2.39-.974 2.72-1.916.33-.942.33-1.751.23-1.918-.1-.168-.37-.268-.69-.428z" /></svg>
            <span className="text-[10px] font-black">{isRtl ? "دعم" : "Support"}</span>
          </a>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-50 bg-black" />
            <motion.div initial={{ x: isRtl ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRtl ? "-100%" : "100%" }} transition={{ type: "tween", duration: 0.28 }}
              className={cn("fixed top-0 bottom-0 z-50 w-full max-w-md flex flex-col border-l", isRtl ? "left-0" : "right-0")}
              style={{ backgroundColor: cream, borderColor: "#d4cbb8" }}>
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#d4cbb8" }} dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" style={{ color: green }} />
                  <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: bark }}>{t("shoppingCart")}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ backgroundColor: green }}>{cartCount}</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16">
                    <Leaf className="w-10 h-10 opacity-20 mb-3" style={{ color: green }} />
                    <p className="font-semibold" style={{ color: "#8b7a5a" }}>{t("cartIsEmpty")}</p>
                  </div>
                ) : cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0" style={{ borderColor: "#d4cbb8" }}>
                    {item.image ? <img src={item.image} alt={item.name} className="w-16 h-16 rounded-2xl object-cover" style={{ border: `1px solid ${green}20` }} /> : <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: softGreen }}><Leaf className="w-6 h-6" style={{ color: green }} /></div>}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold line-clamp-1" style={{ color: bark }}>{item.name}</h4>
                      {item.variantName && <span className="inline-block px-2 py-0.5 rounded-xl text-[10px] font-bold mt-0.5" style={{ backgroundColor: softGreen, color: green }}>{item.variantName}</span>}
                      <p className="text-sm font-black mt-0.5" style={{ color: green }}>{formatCurrency(item.price, store.currency)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-lg" style={{ backgroundColor: softGreen, color: green }}><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-xs font-semibold w-6 text-center" style={{ color: bark }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-lg" style={{ backgroundColor: softGreen, color: green }}><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              {cartItems.length > 0 && (
                <div className="p-5 border-t" style={{ borderColor: "#d4cbb8", backgroundColor: softGreen }} dir={isRtl ? "rtl" : "ltr"}>
                  <div className="flex items-center justify-between font-black mb-4" style={{ color: bark }}>
                    <span>{t("totalAmount")}</span>
                    <span style={{ color: green }}>{formatCurrency(cartTotal, store.currency)}</span>
                  </div>
                  <button onClick={() => { setIsCartOpen(false); router.push(`/store/${params.slug}/checkout`); }}
                    className="w-full py-3.5 px-4 rounded-2xl text-white font-bold text-center transition-opacity hover:opacity-90" style={{ backgroundColor: green }}>
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

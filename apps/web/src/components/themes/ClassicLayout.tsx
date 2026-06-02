"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingCart, X, Plus, Minus, Trash2, Store, Loader2,
  ChevronDown, ChevronRight, ChevronLeft, ArrowRight,
  Mail, Phone, Heart, Search, Menu, MapPin, LayoutGrid,
  Info, PhoneCall, Sun, Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/cart.context";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language.context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTheme } from "next-themes";

interface ClassicLayoutProps {
  store: any;
  children: React.ReactNode;
}

export function ClassicLayout({ store, children }: ClassicLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const isRtl = language === "ar";
  const { cartCount, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeParentCat, setActiveParentCat] = useState<any>(null);
  const [searchVal, setSearchVal] = useState("");
  const isCheckoutPage = pathname.endsWith("/checkout");
  const primary = store.primaryColor || "#6366f1";

  const cleanPhoneForWhatsapp = (phoneString: string) => {
    if (!phoneString) return "";
    const cleaned = phoneString.replace(/\D/g, "");
    if (cleaned.startsWith("0")) return "2" + cleaned;
    if (cleaned.startsWith("20")) return cleaned;
    return "20" + cleaned;
  };

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setSearchVal(searchParams.get("search") || ""); }, [searchParams]);
  useEffect(() => {
    if (store.categories?.length > 0 && !activeParentCat) setActiveParentCat(store.categories[0]);
  }, [store.categories, activeParentCat]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/store/${params.slug}?search=${searchVal}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Announcement bar */}
      <div className="text-white text-[11px] font-bold py-2 px-4 hidden sm:block" style={{ backgroundColor: primary }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {store.email || "support@store.com"}</span>
            <span className="flex items-center gap-1" dir="ltr"><Phone className="w-3.5 h-3.5" /> {store.phone || "+20 100 000 0000"}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{isRtl ? "شحن سريع وآمن 🇪🇬" : "Fast & secure shipping to all Egypt 🇪🇬"}</span>
            <span className="w-px h-3.5 bg-white/25" />
            <span>{isRtl ? "الدفع عند الاستلام 💵" : "Cash on Delivery 💵"}</span>
          </div>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/92 dark:bg-zinc-950/92 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href={`/store/${params.slug}`} className="flex items-center gap-2.5 flex-shrink-0 group">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-10 h-10 rounded-xl object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform" style={{ backgroundColor: primary }}>
                  <Store className="w-5 h-5" />
                </div>
              )}
              <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tight hidden sm:block">{store.name}</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden md:flex">
              <div className="flex w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 overflow-hidden focus-within:ring-2 focus-within:border-transparent transition-all" style={{ "--tw-ring-color": primary } as any}>
                <input
                  value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                  placeholder={isRtl ? "ما الذي تبحث عنه؟" : "Search products..."}
                  className="flex-1 px-4 py-2.5 bg-transparent text-sm text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none"
                />
                <button type="submit" className="px-5 py-2.5 text-white font-bold text-sm flex items-center gap-1.5 transition-opacity hover:opacity-90" style={{ backgroundColor: primary }}>
                  <Search className="w-4 h-4" />
                  <span>{isRtl ? "بحث" : "Search"}</span>
                </button>
              </div>
            </form>

            {/* Desktop Actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {mounted && (
                <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                  {resolvedTheme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
                </button>
              )}
              {!isCheckoutPage && (
                <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950" style={{ backgroundColor: primary }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              <button className="md:hidden p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Nav */}
        <div className="hidden sm:block border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-950/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-6 text-sm font-semibold" dir={isRtl ? "rtl" : "ltr"}>
            {/* Categories Mega Menu */}
            {store.categories?.length > 0 && (
              <div className="relative" onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-white transition-all shadow-sm text-sm" style={{ backgroundColor: primary }}>
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{isRtl ? "الفئات" : "Categories"}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isMegaMenuOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                      className={cn("absolute top-full mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 flex overflow-hidden min-w-[480px] h-72", isRtl ? "right-0" : "left-0")}>
                      <div className="w-44 bg-zinc-50 dark:bg-zinc-900/60 border-r dark:border-zinc-800 py-2 overflow-y-auto flex-shrink-0">
                        {store.categories.map((cat: any) => {
                          const active = activeParentCat?.id === cat.id;
                          return (
                            <div key={cat.id} onMouseEnter={() => setActiveParentCat(cat)}
                              onClick={() => { setIsMegaMenuOpen(false); router.push(`/store/${params.slug}?categoryId=${cat.id}`); }}
                              className={cn("px-4 py-2.5 text-xs font-bold flex justify-between items-center cursor-pointer transition-all border-r-2", active ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white" : "text-zinc-500 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40 border-transparent")}
                              style={{ borderRightColor: active ? primary : "transparent" }}>
                              <span>{cat.name}</span>
                              {cat.children?.length > 0 && (isRtl ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex-1 p-5 overflow-y-auto bg-white dark:bg-zinc-950">
                        {activeParentCat && (
                          <div>
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
                              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">{activeParentCat.name}</h3>
                              <Link href={`/store/${params.slug}?categoryId=${activeParentCat.id}`} onClick={() => setIsMegaMenuOpen(false)} className="text-xs font-bold hover:underline" style={{ color: primary }}>
                                {isRtl ? "عرض الكل ←" : "View All →"}
                              </Link>
                            </div>
                            {activeParentCat.children?.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2">
                                {activeParentCat.children.map((sub: any) => (
                                  <Link key={sub.id} href={`/store/${params.slug}?categoryId=${sub.id}`} onClick={() => setIsMegaMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:shadow-sm">
                                    <span>{sub.name}</span>
                                    {isRtl ? <ChevronLeft className="w-3 h-3 opacity-40" /> : <ChevronRight className="w-3 h-3 opacity-40" />}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-400 text-center py-8">{isRtl ? "لا توجد فئات فرعية" : "No sub-categories"}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <nav className="flex items-center gap-6 text-zinc-600 dark:text-zinc-400">
              <Link href={`/store/${params.slug}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors" style={!pathname.includes("/products/") && !isCheckoutPage ? { color: primary } : {}}>
                {isRtl ? "الرئيسية" : "Home"}
              </Link>
              <button onClick={() => document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Info className="w-3.5 h-3.5" /> {isRtl ? "من نحن" : "About"}
              </button>
              <button onClick={() => document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <PhoneCall className="w-3.5 h-3.5" /> {isRtl ? "تواصل" : "Contact"}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-zinc-50 dark:bg-black">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-14" dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="w-9 h-9 rounded-xl object-contain" /> : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: primary }}><Store className="w-4.5 h-4.5" /></div>}
                <span className="text-lg font-black text-zinc-900 dark:text-white">{store.name}</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{store.description || (isRtl ? `أهلاً بك في ${store.name}. نوفر لك أفضل المنتجات بجودة عالية.` : `Welcome to ${store.name}. We offer the best products at great prices.`)}</p>
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">{isRtl ? "روابط" : "Links"}</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href={`/store/${params.slug}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">{isRtl ? "المنتجات" : "Products"}</Link></li>
                <li><Link href={`/store/${params.slug}/checkout`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">{isRtl ? "السلة" : "Cart"}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">{isRtl ? "تواصل" : "Contact"}</h4>
              <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                {store.email && <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /><a href={`mailto:${store.email}`} className="hover:underline" style={{ color: primary }}>{store.email}</a></li>}
                {store.phone && <li className="flex items-center gap-2" dir="ltr"><Phone className="w-3.5 h-3.5" /><a href={`tel:${store.phone}`} className="hover:underline" style={{ color: primary }}>{store.phone}</a></li>}
                <li><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">🇪🇬 {isRtl ? "دفع عند الاستلام" : "Cash on Delivery"}</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400">
            <p>© {new Date().getFullYear()} {store.name}. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-6 py-2.5 flex items-center justify-between sm:hidden shadow-lg">
        <Link href={`/store/${params.slug}`} className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400 transition-all">
          <Store className="w-5 h-5" /><span className="text-[10px] font-black">{isRtl ? "الرئيسية" : "Home"}</span>
        </Link>
        <button onClick={() => setIsCartOpen(true)} className="relative flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 text-[9px] font-black text-white rounded-full flex items-center justify-center" style={{ backgroundColor: primary }}>{cartCount}</span>}
          <span className="text-[10px] font-black">{isRtl ? "السلة" : "Cart"}</span>
        </button>
        {mounted && (
          <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400">
            {resolvedTheme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            <span className="text-[10px] font-black">{isRtl ? "المظهر" : "Theme"}</span>
          </button>
        )}
        {store.phone && (
          <a href={`https://wa.me/${cleanPhoneForWhatsapp(store.phone)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-emerald-500"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.113.975 11.488.975c-5.442 0-9.866 4.372-9.87 9.802 0 1.698.48 3.35 1.387 4.825L1.97 21.03l5.677-1.876zm13.125-9.351c-.322-.16-.1.21-.83-.16-.403-.201-2.39-1.177-2.761-1.31-.37-.134-.64-.201-.91.201-.27.402-1.042 1.31-1.277 1.578-.235.268-.47.301-.79.141-.322-.16-1.362-.501-2.594-1.599-.958-.853-1.602-1.908-1.79-2.22-.19-.311-.02-.48.14-.64.14-.14.32-.37.48-.56.16-.18.21-.31.32-.51.11-.2.05-.38-.03-.54-.08-.16-.91-2.206-1.246-3.009-.329-.787-.663-.681-.912-.693-.235-.011-.504-.014-.772-.014-.27 0-.71.1-1.08.5-.37.4-1.41 1.38-1.41 3.367s1.44 3.9 1.64 4.168c.2.268 2.83 4.302 6.85 6.043 4.02 1.741 4.02 1.16 4.75 1.08.73-.08 2.39-.974 2.72-1.916.33-.942.33-1.751.23-1.918-.1-.168-.37-.268-.69-.428z" /></svg>
            <span className="text-[10px] font-black">{isRtl ? "دعم" : "Support"}</span>
          </a>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-50 bg-black" />
            <motion.div initial={{ x: isRtl ? "-100%" : "100%" }} animate={{ x: 0 }} exit={{ x: isRtl ? "-100%" : "100%" }} transition={{ type: "tween", duration: 0.28 }}
              className={cn("fixed top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800", isRtl ? "left-0" : "right-0")}>
              <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800" dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white">{t("shoppingCart")}</h2>
                  <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 px-2 py-0.5 rounded-full font-bold">{cartCount}</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-16">
                    <ShoppingCart className="w-10 h-10 opacity-30 mb-3" />
                    <p className="font-semibold text-zinc-600 dark:text-zinc-300">{t("cartIsEmpty")}</p>
                    <p className="text-sm mt-1">{t("cartIsEmptyDesc")}</p>
                  </div>
                ) : cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-900 last:border-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-zinc-100 dark:border-zinc-800" /> : <div className="w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center"><Store className="w-6 h-6 text-zinc-400" /></div>}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-zinc-800 dark:text-white line-clamp-1">{item.name}</h4>
                      {item.variantName && <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-500 mt-0.5">{item.variantName}</span>}
                      <p className="text-sm font-black mt-0.5" style={{ color: primary }}>{formatCurrency(item.price, store.currency)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-xs font-semibold w-6 text-center text-zinc-800 dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50" dir={isRtl ? "rtl" : "ltr"}>
                  <div className="flex items-center justify-between font-black text-zinc-800 dark:text-white mb-4"><span>{t("totalAmount")}</span><span>{formatCurrency(cartTotal, store.currency)}</span></div>
                  <button onClick={() => { setIsCartOpen(false); router.push(`/store/${params.slug}/checkout`); }}
                    className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-center shadow-lg transition-opacity hover:opacity-90" style={{ backgroundColor: primary }}>
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

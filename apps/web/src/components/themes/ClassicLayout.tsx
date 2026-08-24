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
  faChevronDown,
  faChevronRight,
  faChevronLeft,
  faEnvelope,
  faPhone,
  faMagnifyingGlass,
  faBars,
  faSun,
  faMoon,
  faCircleCheck,
  faLayerGroup,
  faArrowRight,
  faArrowLeft,
  faCircleInfo,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
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
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7]">
      {/* Apple 44px Top Announcement Strip */}
      <div className="bg-[#1d1d1f] text-white text-[12px] font-medium py-2.5 px-4 hidden sm:block border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5 text-[#86868b]">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-[#0066cc] dark:text-[#2997ff]" />
              <span>{store.email || "support@store.com"}</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors" dir="ltr">
              <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-[#0066cc] dark:text-[#2997ff]" />
              <span>{store.phone || "+20 100 000 0000"}</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-[#f5f5f7]">{isRtl ? "شحن سريع لكافة المحافظات 🇪🇬" : "Fast shipping to all Egypt 🇪🇬"}</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-emerald-400 font-semibold">{isRtl ? "الدفع عند الاستلام 💵" : "Cash on Delivery 💵"}</span>
          </div>
        </div>
      </div>

      {/* Sticky Apple Frosted Glass Header */}
      <header className="sticky top-0 z-40 frosted-glass border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Store Brand / Logo */}
            <Link href={`/store/${params.slug}`} className="flex items-center gap-3 flex-shrink-0 group">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-9 h-9 rounded-full object-cover border border-black/[0.08] dark:border-white/[0.1]" />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#0066cc] text-white shadow-sm group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faStore} className="w-4 h-4" />
                </div>
              )}
              <span className="text-lg font-semibold text-[#1d1d1f] dark:text-white tracking-tight hidden sm:block">
                {store.name}
              </span>
            </Link>

            {/* Apple Search Pill */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto hidden md:flex">
              <div className="relative w-full">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b]" />
                <input
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder={isRtl ? "ابحث عن المنتجات..." : "Search products..."}
                  className="apple-search-pill pl-9 pr-20"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-[#0066cc] hover:bg-[#0071e3] text-white text-xs font-semibold transition-colors"
                >
                  {isRtl ? "بحث" : "Search"}
                </button>
              </div>
            </form>

            {/* Desktop Actions */}
            <div className="flex items-center gap-2.5">
              <LanguageSwitcher />
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <FontAwesomeIcon
                    icon={resolvedTheme === "dark" ? faSun : faMoon}
                    className="w-4 h-4 text-amber-500 dark:text-indigo-400"
                  />
                </button>
              )}
              {!isCheckoutPage && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-white text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="w-3.5 h-3.5 text-[#0066cc] dark:text-[#2997ff]" />
                  <span className="hidden sm:inline">{isRtl ? "الحقيبة" : "Bag"}</span>
                  {cartCount > 0 && (
                    <span className="w-4 h-4 text-[10px] font-bold text-white bg-[#0066cc] rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              <button
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#86868b] hover:bg-black/[0.04] transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <FontAwesomeIcon icon={faBars} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Nav Categories */}
        <div className="hidden sm:block border-t border-black/[0.04] dark:border-white/[0.06] bg-white/70 dark:bg-black/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-6 text-xs font-semibold" dir={isRtl ? "rtl" : "ltr"}>
            {store.categories?.length > 0 && (
              <div className="relative" onMouseEnter={() => setIsMegaMenuOpen(true)} onMouseLeave={() => setIsMegaMenuOpen(false)}>
                <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0066cc] text-white transition-all shadow-none hover:bg-[#0071e3]">
                  <FontAwesomeIcon icon={faLayerGroup} className="w-3 h-3" />
                  <span>{isRtl ? "جميع الفئات" : "Categories"}</span>
                  <FontAwesomeIcon icon={faChevronDown} className={cn("w-2.5 h-2.5 transition-transform", isMegaMenuOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "absolute top-full mt-2 bg-white dark:bg-[#1d1d1f] border border-black/[0.08] dark:border-white/[0.12] rounded-2xl shadow-apple-card z-50 flex overflow-hidden min-w-[480px] h-72",
                        isRtl ? "right-0" : "left-0"
                      )}
                    >
                      <div className="w-44 bg-[#f5f5f7] dark:bg-[#272729] border-r border-black/[0.04] dark:border-white/[0.06] py-2 overflow-y-auto flex-shrink-0">
                        {store.categories.map((cat: any) => {
                          const active = activeParentCat?.id === cat.id;
                          return (
                            <div
                              key={cat.id}
                              onMouseEnter={() => setActiveParentCat(cat)}
                              onClick={() => { setIsMegaMenuOpen(false); router.push(`/store/${params.slug}?categoryId=${cat.id}`); }}
                              className={cn(
                                "px-4 py-2.5 text-xs font-semibold flex justify-between items-center cursor-pointer transition-colors",
                                active ? "bg-white dark:bg-[#1d1d1f] text-[#0066cc] dark:text-[#2997ff]" : "text-[#86868b] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                              )}
                            >
                              <span>{cat.name}</span>
                              {cat.children?.length > 0 && <FontAwesomeIcon icon={isRtl ? faChevronLeft : faChevronRight} className="w-2.5 h-2.5 opacity-60" />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex-1 p-5 overflow-y-auto bg-white dark:bg-[#1d1d1f]">
                        {activeParentCat && (
                          <div>
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
                              <h3 className="text-xs font-bold text-[#86868b] uppercase tracking-wider">{activeParentCat.name}</h3>
                              <Link
                                href={`/store/${params.slug}?categoryId=${activeParentCat.id}`}
                                onClick={() => setIsMegaMenuOpen(false)}
                                className="text-xs font-semibold text-[#0066cc] dark:text-[#2997ff] hover:underline"
                              >
                                {isRtl ? "عرض الكل ←" : "View All →"}
                              </Link>
                            </div>
                            {activeParentCat.children?.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2">
                                {activeParentCat.children.map((sub: any) => (
                                  <Link
                                    key={sub.id}
                                    href={`/store/${params.slug}?categoryId=${sub.id}`}
                                    onClick={() => setIsMegaMenuOpen(false)}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] hover:border-[#0066cc] bg-[#f5f5f7] dark:bg-[#272729] text-xs font-medium text-[#1d1d1f] dark:text-white transition-colors"
                                  >
                                    <span>{sub.name}</span>
                                    <FontAwesomeIcon icon={isRtl ? faChevronLeft : faChevronRight} className="w-2.5 h-2.5 text-[#86868b]" />
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#86868b] text-center py-8">{isRtl ? "لا توجد فئات فرعية" : "No sub-categories"}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <nav className="flex items-center gap-6 text-[#86868b]">
              <Link
                href={`/store/${params.slug}`}
                className={cn(
                  "hover:text-[#1d1d1f] dark:hover:text-white transition-colors",
                  !pathname.includes("/products/") && !isCheckoutPage && "text-[#0066cc] dark:text-[#2997ff] font-semibold"
                )}
              >
                {isRtl ? "الرئيسية" : "Home"}
              </Link>
              <button onClick={() => document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCircleInfo} className="w-3 h-3" />
                <span>{isRtl ? "عن المتجر" : "About"}</span>
              </button>
              <button onClick={() => document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#1d1d1f] dark:hover:text-white transition-colors flex items-center gap-1.5">
                <FontAwesomeIcon icon={faHeadset} className="w-3 h-3" />
                <span>{isRtl ? "خدمة العملاء" : "Support"}</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Museum Space */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Apple Editorial Footer */}
      <footer className="bg-[#f5f5f7] dark:bg-[#161617] border-t border-black/[0.06] dark:border-white/[0.08] py-14 text-[#86868b]" dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0066cc] text-white">
                    <FontAwesomeIcon icon={faStore} className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="text-base font-semibold text-[#1d1d1f] dark:text-white tracking-tight">{store.name}</span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                {store.description || (isRtl ? `أهلاً بك في ${store.name}. نوفر لك أفضل المنتجات بأعلى معايير الجودة.` : `Welcome to ${store.name}. We provide high-end premium goods with verified quality.`)}
              </p>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#1d1d1f] dark:text-white mb-3">{isRtl ? "روابط سريعة" : "Quick Links"}</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href={`/store/${params.slug}`} className="hover:text-[#0066cc] transition-colors">{isRtl ? "الكتالوج" : "Catalog"}</Link></li>
                <li><Link href={`/store/${params.slug}/checkout`} className="hover:text-[#0066cc] transition-colors">{isRtl ? "حقيبة الشراء" : "Shopping Bag"}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#1d1d1f] dark:text-white mb-3">{isRtl ? "تواصل معنا" : "Contact Us"}</h4>
              <ul className="space-y-2 text-xs">
                {store.email && (
                  <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-[#0066cc]" />
                    <a href={`mailto:${store.email}`} className="hover:underline">{store.email}</a>
                  </li>
                )}
                {store.phone && (
                  <li className="flex items-center gap-2" dir="ltr">
                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-[#0066cc]" />
                    <a href={`tel:${store.phone}`} className="hover:underline">{store.phone}</a>
                  </li>
                )}
                <li className="pt-1">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold badge-apple-green">
                    {isRtl ? "الدفع عند الاستلام متاح" : "Cash on Delivery Available"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-black/[0.04] dark:border-white/[0.06] text-center text-xs text-[#86868b]">
            <p>© {new Date().getFullYear()} {store.name}. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 frosted-glass border-t border-black/[0.08] dark:border-white/[0.08] px-6 py-2.5 flex items-center justify-between sm:hidden shadow-apple-card">
        <Link href={`/store/${params.slug}`} className="flex flex-col items-center gap-1 text-[#86868b] hover:text-[#0066cc]">
          <FontAwesomeIcon icon={faStore} className="w-4 h-4" />
          <span className="text-[10px] font-semibold">{isRtl ? "الرئيسية" : "Home"}</span>
        </Link>
        <button onClick={() => setIsCartOpen(true)} className="relative flex flex-col items-center gap-1 text-[#86868b] hover:text-[#0066cc]">
          <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
          {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[9px] font-bold text-white bg-[#0066cc] rounded-full flex items-center justify-center">{cartCount}</span>}
          <span className="text-[10px] font-semibold">{isRtl ? "الحقيبة" : "Bag"}</span>
        </button>
        {mounted && (
          <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="flex flex-col items-center gap-1 text-[#86868b]">
            <FontAwesomeIcon icon={resolvedTheme === "dark" ? faSun : faMoon} className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-semibold">{isRtl ? "المظهر" : "Theme"}</span>
          </button>
        )}
        {store.phone && (
          <a href={`https://wa.me/${cleanPhoneForWhatsapp(store.phone)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-[#86868b]">
            <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] font-semibold">{isRtl ? "واتساب" : "WhatsApp"}</span>
          </a>
        )}
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-50 bg-black" />
            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "tween", duration: 0.24 }}
              className={cn(
                "fixed top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-[#1d1d1f] shadow-apple-modal flex flex-col border-l border-black/[0.08] dark:border-white/[0.12]",
                isRtl ? "left-0" : "right-0"
              )}
            >
              <div className="flex items-center justify-between p-5 border-b border-black/[0.04] dark:border-white/[0.06]" dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
                  <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white tracking-tight">{t("shoppingCart")}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold badge-apple-gray">{cartCount}</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:bg-black/[0.04] transition-colors">
                  <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#86868b] py-16 gap-2">
                    <FontAwesomeIcon icon={faBagShopping} className="w-10 h-10 opacity-20" />
                    <p className="font-semibold text-sm text-[#1d1d1f] dark:text-white">{t("cartIsEmpty")}</p>
                    <p className="text-xs">{t("cartIsEmptyDesc")}</p>
                  </div>
                ) : cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3.5 py-3 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.08]" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center text-[#86868b]">
                        <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-[#1d1d1f] dark:text-white line-clamp-1">{item.name}</h4>
                      {item.variantName && <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f5f5f7] dark:bg-[#272729] text-[#86868b] mt-0.5">{item.variantName}</span>}
                      <p className="text-xs font-semibold text-[#0066cc] dark:text-[#2997ff] mt-0.5">{formatCurrency(item.price, store.currency)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f]">
                          <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-semibold w-5 text-center text-[#1d1d1f] dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f]">
                          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:text-rose-600 hover:bg-rose-500/10 transition-colors">
                      <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {cartItems.length > 0 && (
                <div className="p-5 border-t border-black/[0.04] dark:border-white/[0.06] bg-[#f5f5f7] dark:bg-[#272729]" dir={isRtl ? "rtl" : "ltr"}>
                  <div className="flex items-center justify-between text-sm font-semibold text-[#1d1d1f] dark:text-white mb-3">
                    <span>{t("totalAmount")}</span>
                    <span className="text-[#0066cc] dark:text-[#2997ff] text-base">{formatCurrency(cartTotal, store.currency)}</span>
                  </div>
                  <button
                    onClick={() => { setIsCartOpen(false); router.push(`/store/${params.slug}/checkout`); }}
                    className="btn-apple-primary w-full py-3 text-xs justify-center"
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

"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Store,
  Loader2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  Heart,
  Search,
  Menu,
  HelpCircle,
  MapPin,
  User,
  LayoutGrid,
  Info,
  PhoneCall,
  Sun,
  Moon
} from "lucide-react";
import { api } from "@/lib/api";
import { CartProvider, useCart } from "@/contexts/cart.context";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/language.context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTheme } from "next-themes";

function StorefrontNavbar({ store, isCartOpen, setIsCartOpen }: { store: any; isCartOpen: boolean; setIsCartOpen: (open: boolean) => void }) {
  const { cartCount, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeParentCat, setActiveParentCat] = useState<any>(null);
  
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const isCheckoutPage = pathname.endsWith("/checkout");
  const isRtl = language === "ar";
  
  // Search State in Header
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    setSearchVal(searchParams.get("search") || "");
  }, [searchParams]);

  // Set default active parent category for the Mega Menu
  useEffect(() => {
    if (store.categories && store.categories.length > 0 && !activeParentCat) {
      setActiveParentCat(store.categories[0]);
    }
  }, [store.categories, activeParentCat]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/store/${params.slug}?search=${searchVal}`);
  };

  const taagerTeal = "#00a896"; // Taager theme color

  return (
    <>
      {/* 1. Thin Top Announcement Bar */}
      <div 
        className="text-white text-[11px] font-bold py-2 px-4 transition-colors hidden sm:block"
        style={{ backgroundColor: store.primaryColor || taagerTeal }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {store.email || "support@store.com"}
            </span>
            <span className="flex items-center gap-1" dir="ltr">
              <Phone className="w-3.5 h-3.5" /> {store.phone || "+20 100 000 0000"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>{isRtl ? "شحن سريع وآمن لكافة المحافظات المصرية 🇪🇬" : "Fast & secure shipping to all Egypt 🇪🇬"}</span>
            <div className="h-3.5 w-px bg-white/20" />
            <span>{isRtl ? "الدفع عند الاستلام كاش 💵" : "Cash on Delivery 💵"}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Header (Logo, Big Search, User Actions, Shipping Badge) */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 transition-colors shadow-sm py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left/Right Container: Logo & Country */}
            <div className="flex items-center justify-between md:justify-start gap-6">
              {/* Logo / Store Name */}
              <Link href={`/store/${params.slug}`} className="flex items-center gap-2.5 group flex-shrink-0">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-11 h-11 rounded-xl object-contain bg-slate-50 border border-slate-100 dark:border-slate-800"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black transition-transform group-hover:scale-105 shadow-md"
                    style={{ backgroundColor: store.primaryColor || taagerTeal }}
                  >
                    <Store className="w-6 h-6" />
                  </div>
                )}
                <span className="text-xl font-black text-slate-850 dark:text-white tracking-tight group-hover:opacity-85 transition-opacity">
                  {store.name}
                </span>
              </Link>

              {/* Ship to Egypt Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-750 text-xs font-bold text-slate-650 dark:text-slate-350">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{isRtl ? "شحن إلى مصر" : "Ship to Egypt"}</span>
                <span className="w-4 h-3 bg-red-650 inline-block relative ml-0.5 rounded-sm">🇪🇬</span>
              </div>
            </div>

            {/* Middle Container: Massive Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-auto w-full relative">
              <div className="flex items-center rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
                <input
                  type="text"
                  placeholder={isRtl ? "ما الذي تبحث عنه؟" : "What are you looking for?"}
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-medium"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-white font-bold text-sm flex items-center gap-1.5 transition-colors"
                  style={{ backgroundColor: store.primaryColor || taagerTeal }}
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">{isRtl ? "بحث" : "Search"}</span>
                </button>
              </div>
            </form>

            {/* Right Container: Wishlist, Cart & Switcher */}
            <div className="flex items-center justify-end gap-3.5 flex-shrink-0">
              <LanguageSwitcher />

              {/* Theme Toggle Button */}
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="p-2.5 rounded-xl text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none"
                  title={resolvedTheme === "dark" ? "وضع النهار" : "الوضع الليلي"}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="w-5 h-5 text-amber-500 transition-transform duration-500 hover:rotate-45" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-400 transition-transform duration-500 hover:-rotate-12" />
                  )}
                </button>
              )}

              {/* Wishlist Placeholder */}
              <button className="p-2.5 rounded-xl text-slate-500 hover:text-red-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <Heart className="w-5.5 h-5.5" />
              </button>

              {/* Cart Button */}
              {!isCheckoutPage && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-450 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <ShoppingCart className="w-5.5 h-5.5" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 text-[10px] font-extrabold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse shadow-sm"
                      style={{ backgroundColor: store.primaryColor || taagerTeal }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* 3. Sub-Header Navigation (All Categories mega button, Home, About, Contact) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-2.5 transition-colors shadow-sm text-sm font-bold relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6" dir={isRtl ? "rtl" : "ltr"}>
          
          {/* Categories Button + Mega Menu trigger */}
          {store.categories && store.categories.length > 0 && (
            <div 
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-extrabold transition-all shadow-md"
                style={{ backgroundColor: store.primaryColor || taagerTeal }}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>{isRtl ? "جميع الفئات" : "All Categories"}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isMegaMenuOpen && "rotate-180")} />
              </button>

              {/* TAAGER STYLE MEGA MENU */}
              <AnimatePresence>
                {isMegaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "absolute top-full mt-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl shadow-2xl z-50 flex overflow-hidden min-w-[500px] h-[340px]",
                      isRtl ? "right-0 text-right" : "left-0 text-left"
                    )}
                  >
                    {/* Column 1: Parent Categories */}
                    <div className="w-48 bg-slate-50 dark:bg-slate-950/40 border-r dark:border-slate-850 py-3 overflow-y-auto space-y-0.5 flex-shrink-0">
                      {store.categories.map((cat: any) => {
                        const isActive = activeParentCat?.id === cat.id;
                        return (
                          <div
                            key={cat.id}
                            onMouseEnter={() => setActiveParentCat(cat)}
                            onClick={() => {
                              setIsMegaMenuOpen(false);
                              router.push(`/store/${params.slug}?categoryId=${cat.id}`);
                            }}
                            className={cn(
                              "px-4 py-2.5 text-xs font-bold flex items-center justify-between cursor-pointer transition-all",
                              isActive 
                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-r-4"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-900/60"
                            )}
                            style={{ borderRightColor: isActive ? store.primaryColor || taagerTeal : "transparent" }}
                          >
                            <span>{cat.name}</span>
                            {cat.children && cat.children.length > 0 && (
                              isRtl ? <ChevronLeft className="w-3.5 h-3.5 opacity-60" /> : <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Column 2: Sub-categories list */}
                    <div className="flex-1 p-5 overflow-y-auto bg-white dark:bg-slate-900">
                      {activeParentCat ? (
                        <div className="space-y-6">
                          <div className="border-b border-slate-50 dark:border-slate-850 pb-2 flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                              {activeParentCat.name}
                            </h3>
                            <Link
                              href={`/store/${params.slug}?categoryId=${activeParentCat.id}`}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="text-xs font-bold hover:underline"
                              style={{ color: store.primaryColor || taagerTeal }}
                            >
                              {isRtl ? "عرض كل المنتجات ←" : "View All Products →"}
                            </Link>
                          </div>

                          {activeParentCat.children && activeParentCat.children.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                              {activeParentCat.children.map((sub: any) => (
                                <Link
                                  key={sub.id}
                                  href={`/store/${params.slug}?categoryId=${sub.id}`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
                                >
                                  <span>{sub.name}</span>
                                  {isRtl ? <ChevronLeft className="w-3.5 h-3.5 opacity-40" /> : <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 py-6 text-center">
                              {isRtl ? "لا توجد فئات فرعية مضافة حالياً." : "No sub-categories added yet."}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                          {isRtl ? "اختر فئة لعرض تفاصيلها" : "Select a category to view details"}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Centered/Right Navigation Links */}
          <nav className="flex items-center gap-8 text-slate-650 dark:text-slate-450">
            <Link
              href={`/store/${params.slug}`}
              className={cn(
                "hover:text-slate-900 dark:hover:text-white transition-colors py-1.5 border-b-2 border-transparent",
                !pathname.includes("/products/") && !isCheckoutPage && "text-slate-900 dark:text-white"
              )}
              style={{
                borderBottomColor: !pathname.includes("/products/") && !isCheckoutPage ? store.primaryColor || taagerTeal : "transparent"
              }}
            >
              {isRtl ? "الرئيسية" : "Home"}
            </Link>

            <button
              onClick={() => {
                const footer = document.querySelector("footer");
                footer?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors py-1.5 border-b-2 border-transparent flex items-center gap-1.5"
            >
              <Info className="w-4 h-4 text-slate-400" />
              <span>{isRtl ? "من نحن" : "About Us"}</span>
            </button>

            <button
              onClick={() => {
                const footer = document.querySelector("footer");
                footer?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-slate-900 dark:hover:text-white transition-colors py-1.5 border-b-2 border-transparent flex items-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4 text-slate-400" />
              <span>{isRtl ? "اتصل بنا" : "Contact"}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Cart Sidebar Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className={cn(
                "fixed top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col",
                isRtl ? "left-0" : "right-0"
              )}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800" dir={isRtl ? "rtl" : "ltr"}>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-slate-755 dark:text-slate-355" />
                  <h2 className="text-lg font-bold text-slate-855 dark:text-white">{t("shoppingCart")}</h2>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-650 px-2 py-0.5 rounded-full font-bold">
                    {cartCount} {language === "ar" ? "منتجات" : cartCount === 1 ? "item" : "items"}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Items */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-555 py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                      <ShoppingCart className="w-8 h-8 opacity-40" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-350">{t("cartIsEmpty")}</h3>
                    <p className="text-sm mt-1 max-w-xs">{t("cartIsEmptyDesc")}</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-3 border-b border-slate-55 dark:border-slate-855 last:border-0"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover bg-slate-50 border border-slate-100 dark:border-slate-800"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Store className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-855 dark:text-white line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-sm font-black mt-0.5" style={{ color: store.primaryColor || taagerTeal }}>
                          {formatCurrency(item.price, store.currency)}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-750 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-semibold w-6 text-center text-slate-800 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 hover:text-slate-750 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50" dir={isRtl ? "rtl" : "ltr"}>
                  <div className="flex items-center justify-between text-base font-black text-slate-855 dark:text-white mb-4">
                    <span>{t("totalAmount")}</span>
                    <span>{formatCurrency(cartTotal, store.currency)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push(`/store/${params.slug}/checkout`);
                    }}
                    className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-center hover:opacity-95 shadow-lg shadow-indigo-100 dark:shadow-none transition-all duration-200"
                    style={{ backgroundColor: store.primaryColor || taagerTeal }}
                  >
                    {t("proceedToCheckout")}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function StorefrontLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const { slug } = params as { slug: string };
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { cartCount } = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanPhoneForWhatsapp = (phoneString: string) => {
    if (!phoneString) return "";
    const cleaned = phoneString.replace(/\D/g, ""); // Keep only numbers
    if (cleaned.startsWith("0")) {
      return "2" + cleaned;
    }
    if (cleaned.startsWith("20")) {
      return cleaned;
    }
    return "20" + cleaned;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => api.get(`/api/store/${slug}`).then((r) => r.data.store),
    enabled: !!slug,
  });

  const taagerTeal = "#00a896";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
          <p className="text-sm font-medium text-slate-400">Loading storefront...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Store Not Found</h2>
          <p className="text-slate-400 mt-2">
            The store you are looking for does not exist or has been deactivated by the administrator.
          </p>
          <Link
            href="/"
            className="inline-block mt-5 py-2 px-5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors pb-16 sm:pb-0">
      <StorefrontNavbar store={data} isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {React.cloneElement(children as React.ReactElement, { store: data })}
      </main>

      {/* Upgraded Stunning Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-16 transition-colors" dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {/* Store Branding info */}
            <div className="md:col-span-2 space-y-4 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                {data.logoUrl ? (
                  <img
                    src={data.logoUrl}
                    alt={data.name}
                    className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-100 dark:border-slate-800"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold"
                    style={{ backgroundColor: data.primaryColor || taagerTeal }}
                  >
                    <Store className="w-5.5 h-5.5" />
                  </div>
                )}
                <span className="text-xl font-black text-slate-850 dark:text-white tracking-tight">{data.name}</span>
              </div>
              <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed max-w-sm">
                {data.description ||
                  (isRtl
                    ? `أهلاً بك في متجر ${data.name}! نوفر لك تشكيلة رائعة من المنتجات بجودة استثنائية وأسعار تنافسية، مع ضمان شحن سريع لكافة المحافظات المصرية والدفع نقداً عند الاستلام.`
                    : `Welcome to ${data.name}! We provide you with a wonderful selection of premium products, with fast delivery and Cash on Delivery support across Egypt.`)}
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-right">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                {isRtl ? "روابط سريعة" : "Quick Links"}
              </h4>
              <ul className="space-y-2.5 text-sm font-semibold text-slate-650 dark:text-slate-450">
                <li>
                  <Link href={`/store/${slug}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    {isRtl ? "كتالوج المنتجات" : "Products Catalog"}
                  </Link>
                </li>
                <li>
                  <Link href={`/store/${slug}/checkout`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                    {isRtl ? "سلة المشتريات" : "Shopping Cart"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Details */}
            <div className="text-center md:text-right space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                {isRtl ? "تواصل معنا" : "Contact details"}
              </h4>
              <ul className="space-y-3.5 text-sm text-slate-650 dark:text-slate-400">
                {data.email && (
                  <li className="flex items-center justify-center md:justify-start gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${data.email}`} className="hover:underline font-semibold" style={{ color: data.primaryColor || taagerTeal }}>
                      {data.email}
                    </a>
                  </li>
                )}
                {data.phone && (
                  <li className="flex items-center justify-center md:justify-start gap-2" dir="ltr">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${data.phone}`} className="hover:underline font-semibold" style={{ color: data.primaryColor || taagerTeal }}>
                      {data.phone}
                    </a>
                  </li>
                )}
                <li className="pt-2 border-t border-slate-50 dark:border-slate-855">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                    🇪🇬 {isRtl ? "دفع كاش عند الاستلام بمصر" : "Cash on delivery for Egypt"}
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* Trust and Payment Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 py-6 border-t border-slate-100 dark:border-slate-800/80 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-550 dark:text-slate-400 shadow-sm">
              <span className="text-emerald-500 text-base">💵</span>
              <span>{isRtl ? "الدفع عند الاستلام كاش" : "Cash on Delivery"}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-550 dark:text-slate-400 shadow-sm">
              <span className="text-blue-500 text-base">⚡</span>
              <span>{isRtl ? "شحن سريع وآمن" : "Fast & Secure Shipping"}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-550 dark:text-slate-400 shadow-sm">
              <span className="text-indigo-500 text-base">🔒</span>
              <span>{isRtl ? "حماية وضمان الجودة" : "Quality Guarantee"}</span>
            </div>
            
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
            
            <div className="flex items-center gap-3">
              <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-7 w-auto opacity-75 dark:opacity-90 hover:opacity-100 hover:scale-105 transition-all" />
              <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-7 w-auto opacity-75 dark:opacity-90 hover:opacity-100 hover:scale-105 transition-all" />
              <div className="px-2 py-1 rounded bg-red-650 text-white font-extrabold text-[9px] uppercase tracking-wider scale-90 select-none shadow-sm shadow-red-500/20">
                COD
              </div>
              <div className="px-2 py-1 rounded bg-emerald-650 text-white font-extrabold text-[9px] uppercase tracking-wider scale-90 select-none shadow-sm shadow-emerald-500/20">
                V-CASH
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 font-medium">
            <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span>© {new Date().getFullYear()} {data.name}. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</span>
              <span className="hidden sm:inline text-slate-350 dark:text-slate-700">|</span>
              <span className="flex items-center gap-1">
                {isRtl ? "مشغل بواسطة" : "Powered by"}{" "}
                <a 
                  href="https://github.com/HassanSamhann" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-black hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"
                >
                  H.samhan
                </a>
              </span>
            </p>
          </div>
        </div>
      </footer>

      {/* 4. Mobile Bottom Floating Sticky Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-150 dark:border-slate-850 px-6 py-2.5 flex items-center justify-between sm:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.06)] transition-all">
        {/* Home */}
        <Link 
          href={`/store/${slug}`}
          className="flex flex-col items-center gap-1 text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all duration-200"
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-black">{isRtl ? "الرئيسية" : "Home"}</span>
        </Link>

        {/* Cart trigger */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all duration-200 focus:outline-none"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 text-[9px] font-black text-white rounded-full flex items-center justify-center animate-bounce shadow-sm"
              style={{ backgroundColor: data.primaryColor || taagerTeal }}
            >
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-black">{isRtl ? "السلة" : "Cart"}</span>
        </button>

        {/* Theme switcher */}
        {mounted && (
          <button 
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex flex-col items-center gap-1 text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all duration-200 focus:outline-none"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-500 transition-transform duration-500 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-400" />
            )}
            <span className="text-[10px] font-black">{isRtl ? "المظهر" : "Theme"}</span>
          </button>
        )}

        {/* WhatsApp direct support */}
        {data.phone && (
          <a 
            href={`https://wa.me/${cleanPhoneForWhatsapp(data.phone)}?text=${encodeURIComponent(isRtl ? "مرحباً، أود الاستفسار عن بعض المنتجات." : "Hello, I want to ask about some products.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-slate-555 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-450 transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-emerald-500 dark:text-emerald-400">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 1.981 14.113.975 11.488.975c-5.442 0-9.866 4.372-9.87 9.802 0 1.698.48 3.35 1.387 4.825L1.97 21.03l5.677-1.876zm13.125-9.351c-.322-.16-.1.21-.83-.16-.403-.201-2.39-1.177-2.761-1.31-.37-.134-.64-.201-.91.201-.27.402-1.042 1.31-1.277 1.578-.235.268-.47.301-.79.141-.322-.16-1.362-.501-2.594-1.599-.958-.853-1.602-1.908-1.79-2.22-.19-.311-.02-.48.14-.64.14-.14.32-.37.48-.56.16-.18.21-.31.32-.51.11-.2.05-.38-.03-.54-.08-.16-.91-2.206-1.246-3.009-.329-.787-.663-.681-.912-.693-.235-.011-.504-.014-.772-.014-.27 0-.71.1-1.08.5-.37.4-1.41 1.38-1.41 3.367s1.44 3.9 1.64 4.168c.2.268 2.83 4.302 6.85 6.043 4.02 1.741 4.02 1.16 4.75 1.08.73-.08 2.39-.974 2.72-1.916.33-.942.33-1.751.23-1.918-.1-.168-.37-.268-.69-.428z" />
            </svg>
            <span className="text-[10px] font-black">{isRtl ? "دعم" : "Support"}</span>
          </a>
        )}
      </div>
    </div>
  );
}

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <StorefrontLayoutContent>{children}</StorefrontLayoutContent>
    </CartProvider>
  );
}

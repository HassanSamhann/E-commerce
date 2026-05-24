"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ar" | "en";
type Direction = "rtl" | "ltr";

const translations: Record<string, Record<Language, string>> = {
  // Sidebar & Navigation
  dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  products: { en: "Products", ar: "المنتجات" },
  categories: { en: "Categories", ar: "التصنيفات" },
  orders: { en: "Orders", ar: "الطلبات" },
  customers: { en: "Customers", ar: "العملاء" },
  media: { en: "Media", ar: "الوسائط" },
  analytics: { en: "Analytics", ar: "التحليلات" },
  subscription: { en: "Subscription", ar: "الاشتراك" },
  settings: { en: "Settings", ar: "الإعدادات" },
  mainMenu: { en: "Main Menu", ar: "القائمة الرئيسية" },
  viewStorefront: { en: "View Storefront ↗", ar: "معاينة المتجر ↗" },
  logout: { en: "Logout", ar: "تسجيل الخروج" },
  superAdmin: { en: "Super Admin", ar: "المدير العام" },
  manageStores: { en: "Manage Stores", ar: "إدارة المتاجر" },
  addStore: { en: "Add New Store", ar: "إضافة متجر جديد" },
  active: { en: "Active", ar: "نشط" },
  inactive: { en: "Inactive", ar: "معطل" },
  ownerName: { en: "Owner Name", ar: "اسم المالك" },
  ownerEmail: { en: "Owner Email", ar: "بريد المالك" },
  password: { en: "Password", ar: "كلمة المرور" },
  storeSlug: { en: "Store Slug", ar: "الرابط السريع" },
  totalStores: { en: "Total Stores", ar: "إجمالي المتاجر" },
  activeStores: { en: "Active Stores", ar: "المتاجر النشطة" },
  usersCount: { en: "Total Users", ar: "إجمالي المستخدمين" },
  variants: { en: "Product Variants", ar: "المنتجات الفرعية (المتغيرات)" },
  addVariant: { en: "Add Variant", ar: "إضافة منتج فرعي" },
  nameEn: { en: "Name (English)", ar: "الاسم بالإنجليزية" },
  descriptionEn: { en: "Description (English)", ar: "الوصف بالإنجليزية" },
  nameAr: { en: "Name (Arabic)", ar: "الاسم بالعربية" },
  descriptionAr: { en: "Description (Arabic)", ar: "الوصف بالعربية" },

  // General Storefront
  shoppingCart: { en: "Shopping Cart", ar: "سلة المشتريات" },
  cartIsEmpty: { en: "Your cart is empty", ar: "سلة المشتريات فارغة" },
  cartIsEmptyDesc: { en: "Add products from the store catalog to complete your purchase.", ar: "أضف منتجات من المتجر لإتمام عملية الشراء." },
  totalAmount: { en: "Total Amount", ar: "المبلغ الإجمالي" },
  proceedToCheckout: { en: "Proceed to Checkout", ar: "الذهاب للدفع" },
  allProducts: { en: "All Products", ar: "كل المنتجات" },
  searchPlaceholder: { en: "Search products...", ar: "ابحث عن منتج..." },
  noProductsFound: { en: "No products found", ar: "لم يتم العثور على منتجات" },
  noProductsFoundDesc: { en: "We couldn't find any active products in this category matching your search.", ar: "لم نجد أي منتجات نشطة في هذا القسم تطابق بحثك." },
  outOfStock: { en: "Out of stock", ar: "نفذت الكمية" },
  addedToCart: { en: "Added to Cart!", ar: "تمت الإضافة للسلة!" },
  addedToCartDesc: { en: "has been added to your shopping cart.", ar: "تمت إضافته بنجاح لسلة مشترياتك." },
  featured: { en: "Featured", ar: "مميز" },
  continueShopping: { en: "Continue Shopping", ar: "مواصلة التسوق" },
  backToStore: { en: "Back to Store", ar: "العودة للمتجر" },

  // Checkout Page
  checkoutSecurely: { en: "Checkout Securely", ar: "إتمام الدفع بأمان" },
  contactInfo: { en: "Contact Information", ar: "معلومات الاتصال" },
  fullName: { en: "Full Name", ar: "الاسم الكامل" },
  fullNamePlaceholder: { en: "Enter your name", ar: "أدخل اسمك بالكامل" },
  phoneNumber: { en: "Phone Number", ar: "رقم الهاتف" },
  phoneNumberPlaceholder: { en: "e.g. +201234567890", ar: "مثال: +201234567890" },
  emailAddress: { en: "Email Address", ar: "البريد الإلكتروني" },
  emailAddressPlaceholder: { en: "name@example.com", ar: "name@example.com" },
  shippingAddress: { en: "Shipping Address", ar: "عنوان الشحن" },
  addressLine: { en: "Address Line", ar: "العنوان بالتفصيل" },
  addressPlaceholder: { en: "Street name, building, apartment", ar: "اسم الشارع، رقم المبنى، الشقة" },
  city: { en: "City", ar: "المدينة" },
  cityPlaceholder: { en: "Cairo", ar: "القاهرة" },
  country: { en: "Country", ar: "الدولة" },
  additionalNotes: { en: "Additional Notes", ar: "ملاحظات إضافية" },
  orderNotesOptional: { en: "Order Notes (Optional)", ar: "ملاحظات الطلب (اختياري)" },
  notesPlaceholder: { en: "Special instructions for shipping or preparation...", ar: "تعليمات خاصة بالشحن أو التجهيز..." },
  placeOrder: { en: "Place Order", ar: "تأكيد الطلب" },
  placingOrder: { en: "Placing Order...", ar: "جاري تأكيد الطلب..." },
  orderSummary: { en: "Order Summary", ar: "ملخص الطلب" },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  shippingFee: { en: "Shipping Fee", ar: "رسوم الشحن" },
  free: { en: "Free", ar: "مجاني" },

  // Order Success Screen
  orderConfirmed: { en: "Order Confirmed!", ar: "تم تأكيد طلبك بنجاح!" },
  orderConfirmedDesc: { en: "Thank you for shopping with. Your order has been placed.", ar: "شكراً لتسوقك معنا، تم استلام طلبك بنجاح وجاري تجهيزه." },
  orderNumber: { en: "Order Number:", ar: "رقم الطلب:" },
  status: { en: "Status:", ar: "حالة الطلب:" },
  totalPaid: { en: "Total Paid:", ar: "إجمالي المدفوع:" },
  shippingTo: { en: "Shipping to:", ar: "الشحن إلى:" },
  paymentMethod: { en: "Payment Method", ar: "طريقة الدفع" },
  cashOnDelivery: { en: "Cash on Delivery (COD)", ar: "الدفع عند الاستلام (كاش)" },
  onlineCard: { en: "Credit Card / Online", ar: "الدفع بالبطاقة / أونلاين" },
  paymentDetails: { en: "Payment Details", ar: "تفاصيل الدفع" },
  paymentStatus: { en: "Payment Status", ar: "حالة الدفع" },
  markAsPaid: { en: "Mark as Paid", ar: "تأكيد استلام الدفع" },
};

interface LanguageContextType {
  language: Language;
  dir: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar"); // Default to Arabic as requested!
  const [dir, setDir] = useState<Direction>("rtl");

  // Load language from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("lang") as Language;
    if (stored && (stored === "ar" || stored === "en")) {
      setLanguageState(stored);
      setDir(stored === "ar" ? "rtl" : "ltr");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const newDir = lang === "ar" ? "rtl" : "ltr";
    setDir(newDir);
    localStorage.setItem("lang", lang);
    
    // Set HTML dir attribute
    if (typeof document !== "undefined") {
      document.documentElement.dir = newDir;
      document.documentElement.lang = lang;
    }
  };

  // Set initial document attributes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language, dir]);

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

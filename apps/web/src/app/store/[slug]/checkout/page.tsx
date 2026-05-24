"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingBag, ArrowLeft, ArrowRight, Loader2, CheckCircle, CreditCard, ChevronRight, ChevronLeft, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/cart.context";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language.context";
const GOVERNORATES = [
  { nameAr: "القاهرة", nameEn: "Cairo", fee: 50 },
  { nameAr: "الجيزة", nameEn: "Giza", fee: 50 },
  { nameAr: "الإسكندرية", nameEn: "Alexandria", fee: 60 },
  { nameAr: "القليوبية", nameEn: "Qalyubia", fee: 55 },
  { nameAr: "الدقهلية", nameEn: "Dakahlia", fee: 65 },
  { nameAr: "المنوفية", nameEn: "Monufia", fee: 65 },
  { nameAr: "الغربية", nameEn: "Gharbia", fee: 65 },
  { nameAr: "الشرقية", nameEn: "Sharqia", fee: 65 },
  { nameAr: "البحيرة", nameEn: "Beheira", fee: 70 },
  { nameAr: "دمياط", nameEn: "Damietta", fee: 70 },
  { nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh", fee: 70 },
  { nameAr: "الفيوم", nameEn: "Fayoum", fee: 70 },
  { nameAr: "بني سويف", nameEn: "Beni Suef", fee: 75 },
  { nameAr: "المنيا", nameEn: "Minya", fee: 80 },
  { nameAr: "أسيوط", nameEn: "Asyut", fee: 85 },
  { nameAr: "سوهاج", nameEn: "Sohag", fee: 90 },
  { nameAr: "قنا", nameEn: "Qena", fee: 95 },
  { nameAr: "الأقصر", nameEn: "Luxor", fee: 100 },
  { nameAr: "أسوان", nameEn: "Aswan", fee: 100 },
  { nameAr: "السويس", nameEn: "Suez", fee: 70 },
  { nameAr: "الإسماعيلية", nameEn: "Ismailia", fee: 70 },
  { nameAr: "بورسعيد", nameEn: "Port Said", fee: 70 },
  { nameAr: "البحر الأحمر", nameEn: "Red Sea", fee: 110 },
  { nameAr: "مطروح", nameEn: "Matrouh", fee: 110 },
  { nameAr: "الوادي الجديد", nameEn: "New Valley", fee: 120 },
  { nameAr: "شمال سيناء", nameEn: "North Sinai", fee: 120 },
  { nameAr: "جنوب سيناء", nameEn: "South Sinai", fee: 120 },
];
export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params as { slug: string };
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [paymentMethod] = useState("COD"); // Locked to Cash on Delivery
  const [selectedGov, setSelectedGov] = useState(GOVERNORATES[0]);

  const isRtl = language === "ar";

  // Fetch store details (reads from React Query cache instantly)
  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => api.get(`/api/store/${slug}`).then((r) => r.data.store),
    enabled: !!slug,
  });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: GOVERNORATES[0].nameEn,
    country: "EG",
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGovChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gov = GOVERNORATES.find((g) => g.nameEn === e.target.value) || GOVERNORATES[0];
    setSelectedGov(gov);
    setFormData((prev) => ({ ...prev, city: gov.nameEn }));
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);

    try {
      const payload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          address: formData.address,
          city: `${selectedGov.nameAr} / ${selectedGov.nameEn}`,
          country: "EG",
        },
        notes: formData.notes,
        paymentMethod: "COD",
        shippingAmount: selectedGov.fee,
      };

      const { data } = await api.post(`/api/store/${slug}/orders`, payload);

      setPlacedOrder(data.order);
      clearCart();

      toast({
        title: t("orderConfirmed"),
        description: t("orderConfirmedDesc"),
      });
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast({
        variant: "destructive",
        title: isRtl ? "فشل إتمام الطلب" : "Checkout Failed",
        description: err.response?.data?.error || (isRtl ? "حدث خطأ أثناء معالجة طلبك، يرجى المحاولة مرة أخرى." : "An error occurred during checkout. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  // If store is loading, show loading spinner
  if (isStoreLoading || !store) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-medium text-slate-400 mt-2">
          {isRtl ? "جاري تحميل صفحة الدفع..." : "Loading checkout..."}
        </p>
      </div>
    );
  }

  // If order was successfully placed, show Confirmation Screen
  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-100/50 dark:shadow-none"
        >
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
          </div>
          
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {t("orderConfirmed")}
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {isRtl ? (
              <>
                شكراً لتسوقك من متجر <span className="font-semibold text-slate-650 dark:text-slate-200">{store.name}</span>. تم تسجيل طلبك بنجاح!
              </>
            ) : (
              <>
                Thank you for shopping with <span className="font-semibold text-slate-600 dark:text-slate-200">{store.name}</span>. Your order has been placed.
              </>
            )}
          </p>

          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-left space-y-3" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">{t("orderNumber")}</span>
              <span className="text-slate-800 dark:text-white font-bold">{placedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">{t("status")}</span>
              <span className="text-amber-600 font-bold uppercase">
                {isRtl && placedOrder.status === "PENDING" ? "في انتظار التأكيد" : placedOrder.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">{t("totalPaid")}</span>
              <span className="text-slate-800 dark:text-white font-extrabold">
                {formatCurrency(Number(placedOrder.total), store.currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-200/50 dark:border-slate-700/50 pt-3">
              <span className="text-slate-400 font-medium">{t("shippingTo")}</span>
              <span className="text-slate-700 dark:text-slate-350 text-right truncate max-w-[200px]">
                {placedOrder.shippingAddress?.address}، {placedOrder.shippingAddress?.city}
              </span>
            </div>
          </div>

          <Link
            href={`/store/${slug}`}
            className="inline-flex items-center gap-2 mt-8 py-3 px-6 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:opacity-95"
            style={{ backgroundColor: store.primaryColor || "#6366f1" }}
          >
            {t("continueShopping")} {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Link>
        </motion.div>
      </div>
    );
  }

  // If cart is empty, show Empty State
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl mt-8">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-slate-450 opacity-60 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-slate-850 dark:text-white">{t("cartIsEmpty")}</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
          {t("cartIsEmptyDesc")}
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

  return (
    <div className="space-y-6">
      <style>{`
        .dynamic-focus-input:focus {
          border-color: ${store.primaryColor || "#6366f1"} !important;
          box-shadow: 0 0 0 2px ${(store.primaryColor || "#6366f1")}20 !important;
        }
      `}</style>
      {/* Back button */}
      <div>
        <Link
          href={`/store/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />} {t("continueShopping")}
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-white mt-4">
          {t("checkoutSecurely")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleCheckoutSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800/60 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: store.primaryColor || "#6366f1" }}>1</span>
                {t("contactInfo")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("fullName")}</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t("fullNamePlaceholder")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dynamic-focus-input transition-all text-sm animate-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("phoneNumber")}</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t("phoneNumberPlaceholder")}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dynamic-focus-input transition-all text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("emailAddress")}</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t("emailAddressPlaceholder")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dynamic-focus-input transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800/60 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: store.primaryColor || "#6366f1" }}>2</span>
                {t("shippingAddress")}
              </h2>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("addressLine")}</label>
                <input
                  required
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t("addressPlaceholder")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dynamic-focus-input transition-all text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("city")}</label>
                  <select
                    name="city"
                    value={selectedGov.nameEn}
                    onChange={handleGovChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dynamic-focus-input transition-all text-sm font-semibold"
                  >
                    {GOVERNORATES.map((gov) => (
                      <option key={gov.nameEn} value={gov.nameEn}>
                        {isRtl ? gov.nameAr : gov.nameEn} (+{gov.fee} {store.currency})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("country")}</label>
                  <select
                    disabled
                    name="country"
                    value="EG"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-105 dark:bg-slate-800/80 text-slate-550 dark:text-slate-400 cursor-not-allowed focus:outline-none text-sm font-semibold"
                  >
                    <option value="EG">{isRtl ? "مصر فقط" : "Egypt Only"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800/60 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: store.primaryColor || "#6366f1" }}>3</span>
                {t("paymentMethod")}
              </h2>
              <div 
                className="p-4 rounded-2xl border-2 bg-slate-50/50 dark:bg-slate-850/50 flex items-center gap-3 transition-all"
                style={{ borderColor: store.primaryColor || "#6366f1" }}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-855 dark:text-white">{t("cashOnDelivery")}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{isRtl ? "ادفع نقداً عند استلام شحنتك" : "Pay with cash upon delivery"}</p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800/60 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ backgroundColor: store.primaryColor || "#6366f1" }}>4</span>
                {t("additionalNotes")}
              </h2>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("orderNotesOptional")}</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t("notesPlaceholder")}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dynamic-focus-input transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 px-4 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: store.primaryColor || "#6366f1" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {t("placingOrder")}
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5 animate-pulse" /> {t("placeOrder")} ({formatCurrency(cartTotal + selectedGov.fee, store.currency)})
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-850 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3 flex items-center justify-between">
              {t("orderSummary")}
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-650 px-2 py-0.5 rounded-full font-bold">
                {cartItems.length} {isRtl ? "منتجات" : "items"}
              </span>
            </h2>

            {/* Cart Items List */}
            <div className="max-h-72 overflow-y-auto pr-1 space-y-4 no-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-1.5">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-450">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">
                      {isRtl ? "الكمية" : "Quantity"}: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(item.price * item.quantity, store.currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="border-t border-slate-50 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex justify-between text-xs text-slate-450 font-semibold">
                <span>{t("subtotal")}</span>
                <span className="text-slate-750 dark:text-slate-350">
                  {formatCurrency(cartTotal, store.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-450 font-semibold">
                <span>{t("shippingFee")}</span>
                <span className="text-brand-500 font-extrabold">
                  {formatCurrency(selectedGov.fee, store.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-800 dark:text-white font-extrabold border-t border-slate-50 dark:border-slate-800 pt-3">
                <span>{t("totalAmount")}</span>
                <span>{formatCurrency(cartTotal + selectedGov.fee, store.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faArrowLeft,
  faArrowRight,
  faCircleNotch,
  faCircleCheck,
  faMoneyBillWave,
  faChevronRight,
  faChevronLeft,
  faTruck,
  faUser,
  faLocationDot,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
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
  const [selectedGov, setSelectedGov] = useState(GOVERNORATES[0]);

  const isRtl = language === "ar";

  const { data: store, isLoading: isStoreLoading } = useQuery({
    queryKey: ["store", slug],
    queryFn: () => api.get(`/api/store/${slug}`).then((r) => r.data.store),
    enabled: !!slug,
  });

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
          productId: item.productId,
          variantId: item.variantId,
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

  if (isStoreLoading || !store) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 animate-spin text-[#0066cc]" />
        <p className="text-xs font-semibold text-[#86868b] mt-3">
          {isRtl ? "جاري تجهيز صفحة الدفع..." : "Loading checkout..."}
        </p>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="apple-card p-8 sm:p-12 shadow-apple-modal space-y-4"
        >
          <div className="flex justify-center mb-4 text-emerald-500">
            <FontAwesomeIcon icon={faCircleCheck} className="w-14 h-14" />
          </div>
          
          <h1 className="text-2xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
            {t("orderConfirmed")}
          </h1>
          <p className="text-xs text-[#86868b] max-w-sm mx-auto">
            {isRtl ? (
              <>شكراً لتسوقك من متجر <span className="font-semibold text-[#1d1d1f] dark:text-white">{store.name}</span>. تم تأكيد طلبك بنجاح وسنتواصل معك للشحن.</>
            ) : (
              <>Thank you for shopping with <span className="font-semibold text-[#1d1d1f] dark:text-white">{store.name}</span>. Your order has been placed successfully.</>
            )}
          </p>

          <div className="mt-6 p-5 bg-[#f5f5f7] dark:bg-[#272729] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-left space-y-3" dir={isRtl ? "rtl" : "ltr"}>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#86868b]">{t("orderNumber")}</span>
              <span className="text-[#1d1d1f] dark:text-white font-mono">{placedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#86868b]">{t("status")}</span>
              <span className="badge-apple-amber px-2 py-0.5 rounded-full text-[10px]">
                {isRtl && placedOrder.status === "PENDING" ? "قيد المعالجة" : placedOrder.status}
              </span>
            </div>
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#86868b]">{t("totalPaid")}</span>
              <span className="text-[#0066cc] dark:text-[#2997ff] text-sm">
                {formatCurrency(Number(placedOrder.total), store.currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs border-t border-black/[0.04] dark:border-white/[0.06] pt-3">
              <span className="text-[#86868b]">{t("shippingTo")}</span>
              <span className="text-[#1d1d1f] dark:text-white text-right truncate max-w-[200px]">
                {placedOrder.shippingAddress?.address}، {placedOrder.shippingAddress?.city}
              </span>
            </div>
          </div>

          <Link
            href={`/store/${slug}`}
            className="btn-apple-primary text-xs mt-6 inline-flex"
          >
            <span>{t("continueShopping")}</span>
            <FontAwesomeIcon icon={isRtl ? faChevronLeft : faChevronRight} className="w-2.5 h-2.5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 apple-card mt-8 space-y-3">
        <div className="w-14 h-14 rounded-full bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center mx-auto mb-2 text-[#86868b]">
          <FontAwesomeIcon icon={faBagShopping} className="w-6 h-6 opacity-40" />
        </div>
        <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white">{t("cartIsEmpty")}</h2>
        <p className="text-xs text-[#86868b] max-w-xs mx-auto">
          {t("cartIsEmptyDesc")}
        </p>
        <Link
          href={`/store/${slug}`}
          className="btn-apple-primary text-xs mt-4 inline-flex"
        >
          <FontAwesomeIcon icon={isRtl ? faArrowRight : faArrowLeft} className="w-3 h-3" />
          <span>{t("backToStore")}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <div>
        <Link
          href={`/store/${slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#0066cc] dark:hover:text-[#2997ff] transition-colors"
        >
          <FontAwesomeIcon icon={isRtl ? faArrowRight : faArrowLeft} className="w-3 h-3" />
          <span>{t("continueShopping")}</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight mt-3">
          {t("checkoutSecurely")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleCheckoutSubmit}
            className="apple-card space-y-6"
          >
            {/* Contact info */}
            <div className="space-y-3.5">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0066cc] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                <span>{t("contactInfo")}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#86868b]">{t("fullName")}</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={t("fullNamePlaceholder")}
                    className="apple-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#86868b]">{t("phoneNumber")}</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t("phoneNumberPlaceholder")}
                    className="apple-input text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#86868b]">{t("emailAddress")}</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t("emailAddressPlaceholder")}
                  className="apple-input text-xs"
                />
              </div>
            </div>

            {/* Shipping address */}
            <div className="space-y-3.5 pt-2">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0066cc] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                <span>{t("shippingAddress")}</span>
              </h2>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#86868b]">{t("addressLine")}</label>
                <input
                  required
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t("addressPlaceholder")}
                  className="apple-input text-xs"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#86868b]">{t("city")}</label>
                  <select
                    name="city"
                    value={selectedGov.nameEn}
                    onChange={handleGovChange}
                    className="apple-input text-xs"
                  >
                    {GOVERNORATES.map((gov) => (
                      <option key={gov.nameEn} value={gov.nameEn}>
                        {isRtl ? gov.nameAr : gov.nameEn} (+{gov.fee} {store.currency})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#86868b]">{t("country")}</label>
                  <select
                    disabled
                    name="country"
                    value="EG"
                    className="apple-input text-xs opacity-60 cursor-not-allowed"
                  >
                    <option value="EG">{isRtl ? "مصر (Egypt)" : "Egypt Only"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3.5 pt-2">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0066cc] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                <span>{t("paymentMethod")}</span>
              </h2>
              <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1d1d1f] dark:text-white">{t("cashOnDelivery")}</p>
                  <p className="text-[11px] text-[#86868b] mt-0.5">{isRtl ? "الدفع نقداً عند استلام شحنتك" : "Pay with cash upon delivery"}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3.5 pt-2">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-2.5 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0066cc] text-white text-[10px] font-bold flex items-center justify-center">4</span>
                <span>{t("additionalNotes")}</span>
              </h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                placeholder={t("notesPlaceholder")}
                className="apple-input text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-apple-primary w-full py-3.5 text-xs justify-center shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="w-4 h-4 animate-spin" />
                  <span>{t("placingOrder")}</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4" />
                  <span>{t("placeOrder")} ({formatCurrency(cartTotal + selectedGov.fee, store.currency)})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="apple-card space-y-4">
            <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-2 flex items-center justify-between">
              <span>{t("orderSummary")}</span>
              <span className="badge-apple-gray px-2 py-0.5 rounded-full text-[10px] font-semibold">
                {cartItems.length} {isRtl ? "منتجات" : "items"}
              </span>
            </h2>

            {/* Cart items */}
            <div className="max-h-72 overflow-y-auto divide-y divide-black/[0.03] dark:divide-white/[0.04] no-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover bg-[#f5f5f7] border border-black/[0.04]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center text-[#86868b]">
                      <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#1d1d1f] dark:text-white line-clamp-1">
                      {item.name}
                    </h4>
                    {item.variantName && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold badge-apple-gray mt-0.5">
                        {item.variantName}
                      </span>
                    )}
                    <p className="text-[11px] text-[#86868b] mt-0.5">
                      {isRtl ? "الكمية" : "Quantity"}: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white">
                    {formatCurrency(item.price * item.quantity, store.currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="border-t border-black/[0.04] dark:border-white/[0.06] pt-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-[#86868b]">
                <span>{t("subtotal")}</span>
                <span className="text-[#1d1d1f] dark:text-white font-medium">
                  {formatCurrency(cartTotal, store.currency)}
                </span>
              </div>
              <div className="flex justify-between text-[#86868b]">
                <span>{t("shippingFee")}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {formatCurrency(selectedGov.fee, store.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#1d1d1f] dark:text-white border-t border-black/[0.04] dark:border-white/[0.06] pt-3">
                <span>{t("totalAmount")}</span>
                <span className="text-[#0066cc] dark:text-[#2997ff]">
                  {formatCurrency(cartTotal + selectedGov.fee, store.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCircleNotch,
  faCalendar,
  faUser,
  faPhone,
  faEnvelope,
  faLocationDot,
  faListCheck,
  faBagShopping,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import { useLanguage } from "@/contexts/language.context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { id } = params as { id: string };

  const isRtl = language === "ar";

  // Fetch Order Details
  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get(`/api/orders/${id}`).then((r) => r.data.order),
    enabled: !!id,
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      api.put(`/api/orders/${id}/status`, { status: newStatus }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: isRtl ? "تمت تحديث الحالة بنجاح" : "Status Updated",
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: isRtl ? "فشل التحديث" : "Update Failed",
        description: err.response?.data?.error || "Failed to update order status.",
      });
    },
  });

  // Update Payment Status Mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: (newPaymentStatus: string) =>
      api.put(`/api/orders/${id}/payment`, {
        paymentStatus: newPaymentStatus,
        method: data?.payments?.[0]?.method || "COD",
        notes: "Updated from dashboard",
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: isRtl ? "تم تحديث حالة الدفع بنجاح" : "Payment Status Updated",
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: isRtl ? "فشل تحديث الدفع" : "Update Failed",
        description: err.response?.data?.error || "Failed to update payment status.",
      });
    },
  });

  const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePaymentStatusMutation.mutate(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatusMutation.mutate(e.target.value);
  };

  const getArabicStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "قيد الانتظار";
      case "CONFIRMED": return "تم التأكيد";
      case "PROCESSING": return "جاري التجهيز";
      case "SHIPPED": return "تم الشحن";
      case "DELIVERED": return "تم التوصيل";
      case "CANCELED": return "ملغي";
      case "REFUNDED": return "مسترجع";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 animate-spin text-[#0066cc]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white">
          {isRtl ? "الطلب غير موجود" : "Order Not Found"}
        </h2>
        <p className="text-[#86868b] mt-2 text-sm">
          {isRtl ? "الطلب الذي تبحث عنه قد يكون تم حذفه أو غير متوفر." : "The order you are looking for does not exist or has been removed."}
        </p>
        <Link
          href="/dashboard/orders"
          className="btn-apple-primary text-sm mt-4 inline-flex"
        >
          {isRtl ? "العودة للطلبات" : "Back to Orders"}
        </Link>
      </div>
    );
  }

  const order = data;

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Back & Header */}
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#0066cc] dark:hover:text-[#2997ff] transition-colors"
        >
          <FontAwesomeIcon icon={isRtl ? faArrowRight : faArrowLeft} className="w-3 h-3" />
          <span>{isRtl ? "العودة لقائمة الطلبات" : "Back to Orders"}</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight font-mono">
                {order.orderNumber}
              </h1>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                {isRtl ? getArabicStatusLabel(order.status) : ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="text-xs text-[#86868b] mt-1 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
              <span>{formatDate(order.createdAt)}</span>
            </p>
          </div>

          {/* Quick status switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#86868b]">
              {isRtl ? "تغيير حالة الطلب:" : "Change Status:"}
            </span>
            <select
              value={order.status}
              onChange={handleStatusChange}
              disabled={updateStatusMutation.isPending}
              className="px-3.5 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-white text-xs font-semibold focus:outline-none focus:border-[#0066cc] transition-all"
            >
              <option value="PENDING">{isRtl ? "قيد الانتظار" : "Pending"}</option>
              <option value="CONFIRMED">{isRtl ? "تم التأكيد" : "Confirmed"}</option>
              <option value="PROCESSING">{isRtl ? "جاري التجهيز" : "Processing"}</option>
              <option value="SHIPPED">{isRtl ? "تم الشحن" : "Shipped"}</option>
              <option value="DELIVERED">{isRtl ? "تم التوصيل" : "Delivered"}</option>
              <option value="CANCELED">{isRtl ? "ملغي" : "Canceled"}</option>
              <option value="REFUNDED">{isRtl ? "مسترجع" : "Refunded"}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order summary and items list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items card */}
          <div className="apple-card space-y-6">
            <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-3 flex items-center gap-2 tracking-tight">
              <FontAwesomeIcon icon={faListCheck} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
              <span>{isRtl ? "المنتجات المطلوبة" : "Ordered Items"}</span>
            </h2>

            <div className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center text-[#86868b]">
                      <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">
                        {item.product?.name || item.name}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-[#86868b] mt-0.5">
                          {isRtl ? "الخيار" : "Variant"}: {item.variant.name}
                        </p>
                      )}
                      <p className="text-xs text-[#86868b] mt-0.5">
                        {formatCurrency(Number(item.price), order.currency)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#1d1d1f] dark:text-white">
                    {formatCurrency(Number(item.total), order.currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-black/[0.04] dark:border-white/[0.06] pt-4 space-y-2.5">
              <div className="flex justify-between text-[13px] text-[#86868b]">
                <span>{isRtl ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="text-[#1d1d1f] dark:text-white font-medium">
                  {formatCurrency(Number(order.subtotal), order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-[13px] text-[#86868b]">
                <span>{isRtl ? "رسوم الشحن" : "Shipping"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {Number(order.shippingAmount) === 0 ? (isRtl ? "مجاني" : "Free") : formatCurrency(Number(order.shippingAmount), order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-base text-[#1d1d1f] dark:text-white font-semibold border-t border-black/[0.04] dark:border-white/[0.06] pt-3">
                <span>{isRtl ? "الإجمالي الكلي" : "Grand Total"}</span>
                <span className="text-[#0066cc] dark:text-[#2997ff]">
                  {formatCurrency(Number(order.total), order.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer details & shipping */}
        <div className="space-y-6">
          {/* Payment Details card */}
          <div className="apple-card space-y-4">
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faCreditCard} className="w-3.5 h-3.5 text-[#0066cc] dark:text-[#2997ff]" />
              <span>{isRtl ? "تفاصيل وحالة الدفع" : "Payment Details"}</span>
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#86868b]">{isRtl ? "طريقة الدفع" : "Payment Method"}</p>
                <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white mt-0.5">
                  {order.payments?.[0]?.method === "CARD" 
                    ? (isRtl ? "بطاقة ائتمانية / دفع إلكتروني" : "Credit Card / Online")
                    : (isRtl ? "الدفع عند الاستلام (كاش)" : "Cash on Delivery (COD)")}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#86868b] mb-1.5">{isRtl ? "حالة الدفع الحالية" : "Current Payment Status"}</p>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  order.paymentStatus === "PAID"
                    ? "badge-apple-green"
                    : order.paymentStatus === "FAILED"
                    ? "badge-apple-red"
                    : "badge-apple-amber"
                }`}>
                  {order.paymentStatus === "PAID" 
                    ? (isRtl ? "تم الدفع" : "Paid")
                    : order.paymentStatus === "FAILED"
                    ? (isRtl ? "فشلت العملية" : "Failed")
                    : order.paymentStatus === "REFUNDED"
                    ? (isRtl ? "مسترجع" : "Refunded")
                    : (isRtl ? "قيد الانتظار" : "Pending")}
                </span>
              </div>

              {/* Edit Payment Status Selector */}
              <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] space-y-1.5">
                <label className="text-xs font-medium text-[#86868b] block">
                  {isRtl ? "تعديل حالة الدفع:" : "Change Payment Status:"}
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={handlePaymentStatusChange}
                  disabled={updatePaymentStatusMutation.isPending}
                  className="w-full px-3 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-white text-xs font-medium focus:outline-none focus:border-[#0066cc]"
                >
                  <option value="PENDING">{isRtl ? "قيد الانتظار" : "Pending"}</option>
                  <option value="PAID">{isRtl ? "تم الدفع" : "Paid"}</option>
                  <option value="FAILED">{isRtl ? "فشلت" : "Failed"}</option>
                  <option value="REFUNDED">{isRtl ? "مسترجع" : "Refunded"}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer info card */}
          <div className="apple-card space-y-4">
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-[#0066cc] dark:text-[#2997ff]" />
              <span>{isRtl ? "بيانات العميل" : "Customer Details"}</span>
            </h3>

            {order.customer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center text-[#86868b] flex-shrink-0">
                    <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#86868b]">{isRtl ? "الاسم" : "Name"}</p>
                    <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white truncate">{order.customer.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center text-[#86868b] flex-shrink-0">
                    <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#86868b]">{isRtl ? "الهاتف" : "Phone"}</p>
                    <a href={`tel:${order.customer.phone}`} className="text-sm font-semibold text-[#0066cc] dark:text-[#2997ff] hover:underline">
                      {order.customer.phone || "N/A"}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center text-[#86868b] flex-shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#86868b]">{isRtl ? "البريد الإلكتروني" : "Email"}</p>
                    <a href={`mailto:${order.customer.email}`} className="text-sm font-semibold text-[#0066cc] dark:text-[#2997ff] hover:underline truncate block">
                      {order.customer.email}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#86868b]">{isRtl ? "عميل زائر (Guest)" : "Guest Customer"}</p>
            )}
          </div>

          {/* Shipping Address card */}
          <div className="apple-card space-y-4">
            <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-[#0066cc] dark:text-[#2997ff]" />
              <span>{isRtl ? "عنوان التوصيل" : "Shipping Address"}</span>
            </h3>

            {order.shippingAddress ? (
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-[#1d1d1f] dark:text-white">
                  {order.shippingAddress.city}
                </p>
                <p className="text-xs text-[#86868b]">
                  {order.shippingAddress.address}
                </p>
                <p className="text-[11px] font-semibold text-[#86868b] uppercase">
                  {order.shippingAddress.country}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#86868b]">{isRtl ? "لا يوجد عنوان شحن متوفر" : "No shipping address provided"}</p>
            )}
          </div>

          {/* Notes card */}
          {order.notes && (
            <div className="apple-card space-y-2">
              <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-2">
                {isRtl ? "ملاحظات إضافية" : "Additional Notes"}
              </h3>
              <p className="text-xs text-[#86868b] italic bg-[#f5f5f7] dark:bg-[#272729] p-3 rounded-xl">
                &ldquo;{order.notes}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

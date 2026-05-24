"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Calendar, User, Phone, Mail, MapPin, ClipboardList, CheckCircle, ShoppingBag, CreditCard } from "lucide-react";
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
        title: isRtl ? "تمت تحديث الحالة!" : "Status Updated!",
        description: isRtl ? "تم تحديث حالة الطلب بنجاح." : "Order status has been updated successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: isRtl ? "فشل التحديث" : "Update Failed",
        description: err.response?.data?.error || (isRtl ? "حدث خطأ أثناء التحديث." : "Failed to update order status."),
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
        title: isRtl ? "تم تحديث حالة الدفع!" : "Payment Status Updated!",
        description: isRtl ? "تم تحديث حالة دفع الطلب بنجاح." : "Order payment status has been updated successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: isRtl ? "فشل تحديث الدفع" : "Update Failed",
        description: err.response?.data?.error || (isRtl ? "حدث خطأ أثناء تحديث حالة الدفع." : "Failed to update payment status."),
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
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          {isRtl ? "الطلب غير موجود" : "Order Not Found"}
        </h2>
        <p className="text-slate-400 mt-2">
          {isRtl ? "الطلب الذي تبحث عنه قد يكون تم حذفه أو غير متوفر." : "The order you are looking for does not exist or has been removed."}
        </p>
        <Link
          href="/dashboard/orders"
          className="inline-block mt-4 text-brand-500 font-semibold hover:underline"
        >
          {isRtl ? "العودة للطلبات" : "Back to Orders"}
        </Link>
      </div>
    );
  }

  const order = data;

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-450 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {isRtl ? "العودة لقائمة الطلبات" : "Back to Orders"}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-850 dark:text-white font-mono">
                {order.orderNumber}
              </h1>
              <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                {isRtl ? getArabicStatusLabel(order.status) : ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(order.createdAt)}
            </p>
          </div>

          {/* Quick status switcher */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">
              {isRtl ? "تغيير حالة الطلب:" : "Change Status:"}
            </span>
            <select
              value={order.status}
              onChange={handleStatusChange}
              disabled={updateStatusMutation.isPending}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-slate-500" />
              {isRtl ? "المنتجات المطلوبة" : "Ordered Items"}
            </h2>

            <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-450 border border-slate-100 dark:border-slate-750">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {item.product?.name || item.name}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isRtl ? "النوع" : "Variant"}: {item.variant.name}
                        </p>
                      )}
                      <p className="text-xs text-slate-450 mt-0.5">
                        {formatCurrency(Number(item.price), order.currency)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                    {formatCurrency(Number(item.total), order.currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
              <div className="flex justify-between text-sm text-slate-450">
                <span>{isRtl ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="text-slate-800 dark:text-white font-medium">
                  {formatCurrency(Number(order.subtotal), order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-450">
                <span>{isRtl ? "رسوم الشحن" : "Shipping"}</span>
                <span className="text-emerald-500 font-extrabold">
                  {Number(order.shippingAmount) === 0 ? (isRtl ? "مجاني" : "Free") : formatCurrency(Number(order.shippingAmount), order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-base text-slate-850 dark:text-white font-extrabold border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>{isRtl ? "الإجمالي الكلي" : "Grand Total"}</span>
                <span className="text-brand-600 dark:text-brand-400">
                  {formatCurrency(Number(order.total), order.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer details & shipping */}
        <div className="space-y-6">
          {/* Payment Details card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              {isRtl ? "تفاصيل وحالة الدفع" : "Payment Details"}
            </h3>

            <div className="space-y-3.5">
              <div>
                <p className="text-xs text-slate-400">{isRtl ? "طريقة الدفع" : "Payment Method"}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {order.payments?.[0]?.method === "CARD" 
                    ? (isRtl ? "بطاقة ائتمانية / أونلاين" : "Credit Card / Online")
                    : (isRtl ? "الدفع عند الاستلام (كاش)" : "Cash on Delivery (COD)")}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1.5">{isRtl ? "حالة الدفع الحالية" : "Current Payment Status"}</p>
                <span className={`badge ${
                  order.paymentStatus === "PAID"
                    ? "badge-green"
                    : order.paymentStatus === "FAILED"
                    ? "badge-red"
                    : "badge-yellow"
                }`}>
                  {order.paymentStatus === "PAID" 
                    ? (isRtl ? "تم الدفع" : "Paid")
                    : order.paymentStatus === "FAILED"
                    ? (isRtl ? "فشلت" : "Failed")
                    : order.paymentStatus === "REFUNDED"
                    ? (isRtl ? "مسترجعة" : "Refunded")
                    : (isRtl ? "قيد الانتظار" : "Pending")}
                </span>
              </div>

              {/* Edit Payment Status Selector */}
              <div className="pt-2 border-t border-slate-50 dark:border-slate-800/60 space-y-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-405 block">
                  {isRtl ? "تعديل حالة الدفع:" : "Change Payment Status:"}
                </label>
                <select
                  value={order.paymentStatus}
                  onChange={handlePaymentStatusChange}
                  disabled={updatePaymentStatusMutation.isPending}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-semibold"
                >
                  <option value="PENDING">{isRtl ? "قيد الانتظار" : "Pending"}</option>
                  <option value="PAID">{isRtl ? "تم الدفع" : "Paid"}</option>
                  <option value="FAILED">{isRtl ? "فشلت" : "Failed"}</option>
                  <option value="REFUNDED">{isRtl ? "مسترجعة" : "Refunded"}</option>
                </select>
              </div>
            </div>
          </div>
          {/* Customer info card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-2">
              {isRtl ? "بيانات العميل" : "Customer Details"}
            </h3>

            {order.customer ? (
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{isRtl ? "الاسم" : "Name"}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{order.customer.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{isRtl ? "الهاتف" : "Phone"}</p>
                    <a href={`tel:${order.customer.phone}`} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                      {order.customer.phone || "N/A"}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{isRtl ? "البريد الإلكتروني" : "Email"}</p>
                    <a href={`mailto:${order.customer.email}`} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline truncate block">
                      {order.customer.email}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">{isRtl ? "عميل مجهول (زائر)" : "Guest Customer"}</p>
            )}
          </div>

          {/* Shipping Address card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-2">
              {isRtl ? "عنوان التوصيل" : "Shipping Address"}
            </h3>

            {order.shippingAddress ? (
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-350">
                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-850 dark:text-white">
                      {order.shippingAddress.city}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-[11px] font-bold text-slate-450 uppercase mt-1">
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">{isRtl ? "لا يوجد عنوان شحن متوفر" : "No shipping address provided"}</p>
            )}
          </div>

          {/* Notes card */}
          {order.notes && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold text-slate-850 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-2">
                {isRtl ? "ملاحظات إضافية" : "Additional Notes"}
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-850 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                &ldquo;{order.notes}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faMagnifyingGlass,
  faCircleNotch,
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import {
  formatCurrency, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS,
} from "@/lib/utils";
import Link from "next/link";

const STATUS_FILTERS = [
  { value: "", label: "الكل (All)" },
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "CONFIRMED", label: "تم التأكيد" },
  { value: "PROCESSING", label: "جاري التجهيز" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "DELIVERED", label: "تم التوصيل" },
  { value: "CANCELED", label: "ملغي" },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page, search, status],
    queryFn: () =>
      api.get("/api/orders", { params: { page, limit: 20, search, status } }).then((r) => r.data),
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Orders</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">{pagination?.total ?? 0} orders recorded</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setStatus(filter.value); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all active:scale-95 ${
              status === filter.value
                ? "bg-[#0066cc] text-white shadow-none"
                : "bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#ebebee] dark:hover:bg-[#333336]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b]" />
        <input
          type="text"
          placeholder="Search by order # or customer..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="apple-search-pill pl-9 pr-4"
        />
      </div>

      {/* Orders table */}
      <div className="apple-card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <FontAwesomeIcon icon={faCircleNotch} className="w-6 h-6 animate-spin text-[#0066cc] dark:text-[#2997ff]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3 text-[#86868b]">
            <FontAwesomeIcon icon={faReceipt} className="w-8 h-8 opacity-30" />
            <p className="text-[14px]">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.04] dark:border-white/[0.06] text-left">
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Payment</th>
                    <th className="relative px-6 py-3.5"><span className="sr-only">View</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                  {orders.map((order: {
                    id: string;
                    orderNumber: string;
                    status: string;
                    paymentStatus: string;
                    total: number;
                    currency: string;
                    createdAt: string;
                    customer?: { name: string; email: string };
                    items?: unknown[];
                  }, index: number) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-semibold text-[#0066cc] dark:text-[#2997ff]">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                            {order.customer?.name || "Guest"}
                          </p>
                          <p className="text-[11px] text-[#86868b]">{order.customer?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#86868b]">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#86868b]">
                        {Array.isArray(order.items) ? order.items.length : 0} items
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                          {formatCurrency(Number(order.total), order.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            order.paymentStatus === "PAID"
                              ? "badge-apple-green"
                              : order.paymentStatus === "FAILED"
                              ? "badge-apple-red"
                              : "badge-apple-amber"
                          }`}
                        >
                          {order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] inline-flex transition-colors text-[#86868b] hover:text-[#0066cc]"
                        >
                          <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <p className="text-[13px] text-[#86868b]">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-apple-pearl text-xs px-3 py-1.5 disabled:opacity-40"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="w-2.5 h-2.5 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="btn-apple-pearl text-xs px-3 py-1.5 disabled:opacity-40"
                  >
                    Next
                    <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

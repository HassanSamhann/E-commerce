"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Loader2, Eye, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import {
  formatCurrency, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS,
} from "@/lib/utils";
import Link from "next/link";

const STATUS_FILTERS = [
  { value: "", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELED", label: "Canceled" },
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{pagination?.total ?? 0} orders total</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => { setStatus(filter.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              status === filter.value
                ? "bg-brand-500 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by order # or customer..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
        />
      </div>

      {/* Orders table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <ShoppingCart className="w-12 h-12 opacity-30" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                    <th className="relative px-6 py-3.5"><span className="sr-only">View</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
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
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-medium text-brand-600 dark:text-brand-400">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {order.customer?.name || "Guest"}
                          </p>
                          <p className="text-xs text-slate-400">{order.customer?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {Array.isArray(order.items) ? order.items.length : 0} items
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(Number(order.total), order.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`badge ${
                            order.paymentStatus === "PAID"
                              ? "badge-green"
                              : order.paymentStatus === "FAILED"
                              ? "badge-red"
                              : "badge-yellow"
                          }`}
                        >
                          {order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 inline-flex transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Next
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

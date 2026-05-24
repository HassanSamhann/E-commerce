"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus, Search, Package, Edit, Trash2, Filter,
  Loader2, MoreHorizontal, Eye, EyeOff,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, PRODUCT_STATUS_COLORS, cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const STATUS_OPTIONS = ["", "ACTIVE", "DRAFT", "ARCHIVED"];

export default function ProductsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search, status],
    queryFn: () =>
      api
        .get("/api/products", { params: { page, limit: 20, search, status } })
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
    },
    onError: () => toast({ title: "Failed to delete product", variant: "destructive" }),
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {pagination?.total ?? 0} products total
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors shadow-sm shadow-brand-500/25"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <Package className="w-12 h-12 opacity-30" />
            <p className="text-sm">No products found</p>
            <Link
              href="/dashboard/products/new"
              className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
            >
              Add your first product →
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sales</th>
                    <th className="relative px-6 py-3.5"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {products.map((product: {
                    id: string;
                    name: string;
                    price: number;
                    comparePrice?: number;
                    quantity: number;
                    status: string;
                    category?: { name: string };
                    images?: { url: string }[];
                    _count?: { orderItems: number };
                  }, index: number) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400 m-2.5" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {product.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {product.category?.name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {formatCurrency(Number(product.price))}
                        </p>
                        {product.comparePrice && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatCurrency(Number(product.comparePrice))}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            product.quantity === 0
                              ? "text-red-500"
                              : product.quantity < 10
                              ? "text-amber-500"
                              : "text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${PRODUCT_STATUS_COLORS[product.status]}`}>
                          {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {product._count?.orderItems ?? 0} sold
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </button>
                          {activeMenu === product.id && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(null)} />
                              <div className="absolute right-0 top-full mt-1 z-30 w-40 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden">
                                <Link
                                  href={`/dashboard/products/${product.id}/edit`}
                                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <Edit className="w-3.5 h-3.5" /> Edit
                                </Link>
                                <button
                                  onClick={() => {
                                    deleteMutation.mutate(product.id);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
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

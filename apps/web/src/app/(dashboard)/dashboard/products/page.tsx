"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faBoxArchive,
  faPenToSquare,
  faTrashCan,
  faCircleNotch,
  faEllipsis,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import { formatCurrency, PRODUCT_STATUS_COLORS, cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Products</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">
            {pagination?.total ?? 0} products catalogued
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="btn-apple-primary text-[14px]"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="apple-search-pill pl-9 pr-4"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-full bg-[#f5f5f7] dark:bg-[#272729] border border-black/[0.06] dark:border-white/[0.08] text-[13px] font-medium text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0066cc] transition-colors"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="apple-card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <FontAwesomeIcon icon={faCircleNotch} className="w-6 h-6 animate-spin text-[#0066cc] dark:text-[#2997ff]" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3 text-[#86868b]">
            <FontAwesomeIcon icon={faBoxArchive} className="w-8 h-8 opacity-30" />
            <p className="text-[14px]">No products found</p>
            <Link
              href="/dashboard/products/new"
              className="text-[#0066cc] dark:text-[#2997ff] text-[13px] hover:underline font-medium"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.04] dark:border-white/[0.06] text-left">
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Sales</th>
                    <th className="relative px-6 py-3.5"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
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
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-[#f5f5f7] dark:bg-[#272729] overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.name}
                                width={44}
                                height={44}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FontAwesomeIcon icon={faBoxArchive} className="w-4 h-4 text-[#86868b]" />
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                              {product.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#86868b]">
                        {product.category?.name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                          {formatCurrency(Number(product.price))}
                        </p>
                        {product.comparePrice && (
                          <p className="text-[11px] text-[#86868b] line-through">
                            {formatCurrency(Number(product.comparePrice))}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "text-[13px] font-medium",
                            product.quantity === 0
                              ? "text-rose-600 dark:text-rose-400"
                              : product.quantity < 10
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-[#1d1d1f] dark:text-[#f5f5f7]"
                          )}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${PRODUCT_STATUS_COLORS[product.status]}`}>
                          {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#86868b]">
                        {product._count?.orderItems ?? 0} sold
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                          >
                            <FontAwesomeIcon icon={faEllipsis} className="w-3.5 h-3.5" />
                          </button>
                          {activeMenu === product.id && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(null)} />
                              <div className="absolute right-0 top-full mt-1 z-30 w-36 bg-white dark:bg-[#272729] rounded-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-apple-modal overflow-hidden p-1">
                                <Link
                                  href={`/dashboard/products/${product.id}/edit`}
                                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#1d1d1f] dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-xl transition-colors"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5 text-[#86868b]" />
                                  <span>Edit</span>
                                </Link>
                                <button
                                  onClick={() => {
                                    deleteMutation.mutate(product.id);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium text-left"
                                >
                                  <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                                  <span>Delete</span>
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
              <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <p className="text-[13px] text-[#86868b]">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
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

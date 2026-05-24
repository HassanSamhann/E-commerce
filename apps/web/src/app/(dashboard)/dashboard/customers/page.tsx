"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Loader2, ChevronRight, Mail, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, search],
    queryFn: () =>
      api.get("/api/customers", { params: { page, limit: 20, search } }).then((r) => r.data),
  });

  const customers = data?.customers ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{pagination?.total ?? 0} customers</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <Users className="w-12 h-12 opacity-30" />
            <p className="text-sm">No customers yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {customers.map((customer: {
                  id: string;
                  name: string;
                  email: string;
                  phone?: string;
                  createdAt: string;
                  _count?: { orders: number };
                }, index: number) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{customer.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {customer.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {customer.phone}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {customer._count?.orders ?? 0} orders
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(customer.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

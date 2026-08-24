"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faMagnifyingGlass,
  faCircleNotch,
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
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
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Customers</h1>
        <p className="text-[13px] text-[#86868b] mt-0.5">{pagination?.total ?? 0} customers registered</p>
      </div>

      <div className="relative max-w-md">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b]" />
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="apple-search-pill pl-9 pr-4"
        />
      </div>

      <div className="apple-card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <FontAwesomeIcon icon={faCircleNotch} className="w-6 h-6 animate-spin text-[#0066cc] dark:text-[#2997ff]" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3 text-[#86868b]">
            <FontAwesomeIcon icon={faUsers} className="w-8 h-8 opacity-30" />
            <p className="text-[14px]">No customers yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.06] text-left">
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
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
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">{customer.name}</p>
                          <p className="text-[11px] text-[#86868b] flex items-center gap-1.5 mt-0.5">
                            <FontAwesomeIcon icon={faEnvelope} className="w-2.5 h-2.5 text-[#86868b]" /> {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#86868b]">
                      {customer.phone ? (
                        <span className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faPhone} className="w-2.5 h-2.5" /> {customer.phone}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">
                        {customer._count?.orders ?? 0} orders
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#86868b]">
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

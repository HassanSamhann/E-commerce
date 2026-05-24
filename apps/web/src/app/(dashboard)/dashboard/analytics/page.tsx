"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Package, ShoppingCart, Users, DollarSign, Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/dashboard").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const { stats, ordersByStatus, topProducts } = data || {};

  // Build demo chart data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenueData = months.map((month, i) => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 10000,
    orders: Math.floor(Math.random() * 200) + 50,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Store performance overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month Revenue", value: formatCurrency(stats?.thisMonthRevenue ?? 0), icon: DollarSign, color: "text-brand-600 bg-brand-50 dark:bg-brand-950 dark:text-brand-400", trend: `${stats?.revenueGrowth > 0 ? "+" : ""}${stats?.revenueGrowth ?? 0}%` },
          { label: "Total Orders", value: (stats?.totalOrders ?? 0).toLocaleString(), icon: ShoppingCart, color: "text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400", trend: null },
          { label: "Products", value: (stats?.totalProducts ?? 0).toLocaleString(), icon: Package, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400", trend: null },
          { label: "Customers", value: (stats?.totalCustomers ?? 0).toLocaleString(), icon: Users, color: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400", trend: null },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            {kpi.trend && (
              <p className="text-xs mt-1 text-emerald-600">
                <TrendingUp className="w-3 h-3 inline mr-1" />{kpi.trend} vs last month
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
      >
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-6">
          Revenue & Orders (6 months)
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
              formatter={(val: number) => [formatCurrency(val), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products */}
      {topProducts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
        >
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Top Products by Revenue
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProducts.slice(0, 5).map((p: {
              product?: { name: string };
              _sum?: { total: number };
            }) => ({
              name: p.product?.name?.slice(0, 15) || "Unknown",
              revenue: Number(p._sum?.total ?? 0),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                formatter={(val: number) => [formatCurrency(val), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}

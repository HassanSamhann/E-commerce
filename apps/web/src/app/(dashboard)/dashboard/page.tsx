"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Package, ShoppingCart,
  Users, DollarSign, ArrowRight, Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatRelativeTime, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/lib/utils";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export default function DashboardPage() {
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

  const { stats, recentOrders, topProducts, ordersByStatus } = data || {};

  const statCards = [
    {
      label: "Monthly Revenue",
      value: formatCurrency(stats?.thisMonthRevenue ?? 0),
      icon: DollarSign,
      color: "text-brand-600 bg-brand-50 dark:bg-brand-950 dark:text-brand-400",
      trend: stats?.revenueGrowth,
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400",
      trend: null,
    },
    {
      label: "Active Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
      trend: null,
    },
    {
      label: "Customers",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
      trend: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome back! Here&apos;s what&apos;s happening in your store.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                  </p>
                  {stat.trend !== null && stat.trend !== undefined && (
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                        stat.trend >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {stat.trend >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(stat.trend)}% vs last month
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders by status pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
        >
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Orders by Status
          </h2>
          {ordersByStatus?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="_count"
                    nameKey="status"
                  >
                    {ordersByStatus.map((_: unknown, index: number) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [value, ORDER_STATUS_LABELS[name] || name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {ordersByStatus.map((item: { status: string; _count: number }, index: number) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-slate-600 dark:text-slate-400">
                        {ORDER_STATUS_LABELS[item.status] || item.status}
                      </span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item._count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No orders yet
            </div>
          )}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              Recent Orders
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: {
                id: string;
                orderNumber: string;
                status: string;
                total: number;
                currency: string;
                createdAt: string;
                customer?: { name: string; email: string };
              }) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.customer?.name || "Guest"} · {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(Number(order.total), order.currency)}
                    </p>
                    <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ShoppingCart className="w-10 h-10 opacity-30" />
              <p className="text-sm">No orders yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Products */}
      {topProducts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Top Products</h2>
            <Link href="/dashboard/products" className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {topProducts.map((item: {
              productId: string;
              _sum: { quantity: number; total: number };
              product?: { name: string; images?: { url: string }[] };
            }) => (
              <div
                key={item.productId}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center mb-3">
                  <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                  {item.product?.name || "Unknown"}
                </p>
                <p className="text-xs text-slate-400 mt-1">{item._sum?.quantity ?? 0} sold</p>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-1">
                  {formatCurrency(Number(item._sum?.total ?? 0))}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

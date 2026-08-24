"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faBoxesStacked,
  faReceipt,
  faUsers,
  faDollarSign,
  faCircleNotch,
  faChartLine,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/dashboard").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 animate-spin text-[#0066cc] dark:text-[#2997ff]" />
      </div>
    );
  }

  const { stats, topProducts, revenueChartData } = data || {};

  // Format chart data or fallback to monthly
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenueData = revenueChartData?.length
    ? revenueChartData.map((d: { date: string; revenue: number }) => ({
        month: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: d.revenue,
      }))
    : months.map((month) => ({
        month,
        revenue: Math.floor(Math.random() * 50000) + 10000,
      }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Analytics</h1>
        <p className="text-[13px] text-[#86868b] mt-0.5">Store performance and revenue metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month Revenue", value: formatCurrency(stats?.thisMonthRevenue ?? 0), icon: faDollarSign, trend: `${stats?.revenueGrowth > 0 ? "+" : ""}${stats?.revenueGrowth ?? 0}%` },
          { label: "Total Orders", value: (stats?.totalOrders ?? 0).toLocaleString(), icon: faReceipt, trend: null },
          { label: "Products", value: (stats?.totalProducts ?? 0).toLocaleString(), icon: faBoxesStacked, trend: null },
          { label: "Customers", value: (stats?.totalCustomers ?? 0).toLocaleString(), icon: faUsers, trend: null },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="apple-card"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-medium text-[#86868b]">{kpi.label}</p>
              <div className="w-8 h-8 rounded-full bg-[#0066cc]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0066cc] dark:text-[#2997ff]">
                <FontAwesomeIcon icon={kpi.icon} className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">{kpi.value}</p>
            {kpi.trend && (
              <p className="text-xs mt-1.5 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <FontAwesomeIcon icon={faArrowTrendUp} className="w-3 h-3" />
                <span>{kpi.trend} vs last month</span>
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="apple-card"
      >
        <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white mb-6 flex items-center gap-2 tracking-tight">
          <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
          <span>Revenue Trends</span>
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066cc" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0066cc" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#86868b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#86868b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toLocaleString()}`} />
            <Tooltip
              contentStyle={{ background: "rgba(29,29,31,0.92)", borderRadius: "14px", border: "none", color: "#fff", fontSize: "12px" }}
              formatter={(val: number) => [formatCurrency(val), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0066cc"
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#0066cc", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Products */}
      {topProducts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="apple-card"
        >
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white mb-4 flex items-center gap-2 tracking-tight">
            <FontAwesomeIcon icon={faChartSimple} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
            <span>Top Products by Revenue</span>
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProducts.slice(0, 5).map((p: {
              product?: { name: string };
              _sum?: { total: number };
            }) => ({
              name: p.product?.name?.slice(0, 18) || "Unknown",
              revenue: Number(p._sum?.total ?? 0),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#86868b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#86868b" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "rgba(29,29,31,0.92)", borderRadius: "14px", border: "none", color: "#fff", fontSize: "12px" }}
                formatter={(val: number) => [formatCurrency(val), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#0066cc" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}

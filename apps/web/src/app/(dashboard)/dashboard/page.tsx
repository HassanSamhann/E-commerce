"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Package, ShoppingCart,
  Users, DollarSign, ArrowRight, Loader2, AlertTriangle,
  Clock, Plus, BarChart3, Store, Zap, Eye, CheckCircle2,
  ChevronRight, Activity,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  formatCurrency, formatRelativeTime,
  ORDER_STATUS_COLORS, ORDER_STATUS_LABELS,
} from "@/lib/utils";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "@/contexts/auth.context";
import { useLanguage } from "@/contexts/language.context";

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#ec4899", "#f59e0b"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting(lang: "ar" | "en"): string {
  const hour = new Date().getHours();
  if (lang === "ar") {
    if (hour < 12) return "صباح الخير";
    if (hour < 17) return "مساء النور";
    return "مساء الخير";
  }
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color, trend, suffix = "", delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: number | null;
  suffix?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {typeof value === "number" ? value.toLocaleString("ar-EG") : value}{suffix}
          </p>
          {trend !== null && trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}% من الشهر الماضي
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

function QuickActions({ slug }: { slug?: string }) {
  const actions = [
    { label: "منتج جديد", icon: Plus, href: "/dashboard/products/new", color: "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25" },
    { label: "الطلبات", icon: ShoppingCart, href: "/dashboard/orders", color: "bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/25" },
    { label: "التحليلات", icon: BarChart3, href: "/dashboard/analytics", color: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25" },
    { label: "معاينة المتجر", icon: Eye, href: slug ? `/store/${slug}` : "#", color: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25", external: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2"
    >
      {actions.map((a) => {
        const Icon = a.icon;
        const cls = `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all duration-200 hover:scale-105 active:scale-95 ${a.color}`;
        if (a.external) {
          return (
            <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>
              <Icon className="w-4 h-4" />
              {a.label}
            </a>
          );
        }
        return (
          <Link key={a.label} href={a.href} className={cls}>
            <Icon className="w-4 h-4" />
            {a.label}
          </Link>
        );
      })}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/api/dashboard").then((r) => r.data),
    refetchInterval: 60_000, // auto-refresh every minute
  });

  const { user, currentTenant } = useAuth();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        </div>
        <p className="text-sm text-slate-400">جاري تحميل البيانات...</p>
      </div>
    );
  }

  const { stats, recentOrders, topProducts, ordersByStatus, lowStockProducts, revenueChartData } = data || {};

  const greeting = getGreeting(language);
  const todayLabel = new Date().toLocaleDateString("ar-EG", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const statCards = [
    {
      label: "إيرادات هذا الشهر",
      value: formatCurrency(stats?.thisMonthRevenue ?? 0),
      icon: DollarSign,
      color: "text-brand-600 bg-brand-50 dark:bg-brand-950 dark:text-brand-400",
      trend: stats?.revenueGrowth,
    },
    {
      label: "إجمالي الطلبات",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400",
      trend: null,
    },
    {
      label: "المنتجات النشطة",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
      trend: null,
    },
    {
      label: "إجمالي العملاء",
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
      trend: null,
    },
  ];

  // Format chart data for display
  const chartData = (revenueChartData || []).map((d: { date: string; revenue: number }) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("ar-EG", { day: "numeric", month: "short" }),
  }));

  return (
    <div className="space-y-6" dir="rtl">

      {/* ─── Greeting Banner ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {greeting}، {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{todayLabel}</p>
        </div>
        <QuickActions slug={currentTenant?.slug} />
      </motion.div>

      {/* ─── Attention Alerts ─────────────────────────────────── */}
      <AnimatePresence>
        {((stats?.pendingOrdersCount ?? 0) > 0 || (stats?.lowStockCount ?? 0) > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-3"
          >
            {(stats?.pendingOrdersCount ?? 0) > 0 && (
              <Link
                href="/dashboard/orders?status=PENDING"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors group"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <span>
                  <span className="font-black">{stats.pendingOrdersCount}</span> طلب في انتظار التنفيذ
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -me-1" />
              </Link>
            )}
            {(stats?.lowStockCount ?? 0) > 0 && (
              <Link
                href="/dashboard/products"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors group"
              >
                <div className="w-7 h-7 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <span>
                  <span className="font-black">{stats.lowStockCount}</span> منتج على وشك النفاد
                </span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -me-1" />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.08} />
        ))}
      </div>

      {/* ─── Customer Growth Mini Cards ───────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-brand-500/20"
        >
          <p className="text-xs font-semibold opacity-75">عملاء اليوم</p>
          <p className="text-3xl font-black mt-1">{stats?.newCustomersToday ?? 0}</p>
          <p className="text-xs opacity-60 mt-0.5">جديد</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.42 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <p className="text-xs font-semibold text-slate-500">عملاء الأسبوع</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats?.newCustomersWeek ?? 0}</p>
          <p className="text-xs text-slate-400 mt-0.5">آخر 7 أيام</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.49 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <p className="text-xs font-semibold text-slate-500">طلبات معلقة</p>
          <p className={`text-3xl font-black mt-1 ${(stats?.pendingOrdersCount ?? 0) > 0 ? "text-amber-600" : "text-slate-900 dark:text-white"}`}>
            {stats?.pendingOrdersCount ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">تحتاج تنفيذ</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.56 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm"
        >
          <p className="text-xs font-semibold text-slate-500">منتجات نافدة</p>
          <p className={`text-3xl font-black mt-1 ${(stats?.lowStockCount ?? 0) > 0 ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
            {stats?.lowStockCount ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">كمية ≤ 5</p>
        </motion.div>
      </div>

      {/* ─── Revenue Chart ────────────────────────────────────── */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-500" />
                الإيرادات – آخر 30 يوم
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                إجمالي:{" "}
                <span className="font-black text-brand-600 dark:text-brand-400">
                  {formatCurrency(chartData.reduce((s: number, d: { revenue: number }) => s + d.revenue, 0))}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {(stats?.revenueGrowth ?? 0) >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3 h-3" /> +{stats?.revenueGrowth}%
                </span>
              ) : (
                <span className="text-red-500 dark:text-red-400 flex items-center gap-1 bg-red-50 dark:bg-red-950/40 px-2 py-1 rounded-lg">
                  <TrendingDown className="w-3 h-3" /> {stats?.revenueGrowth}%
                </span>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v.toLocaleString()}`}
              />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val), "الإيرادات"]}
                contentStyle={{
                  background: "rgba(15,23,42,0.9)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#f1f5f9",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ─── Low Stock Alert ──────────────────────────────────── */}
      {(lowStockProducts?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-900/40 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              تحذير المخزون — منتجات على وشك النفاد
            </h2>
            <Link href="/dashboard/products" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1">
              إدارة المنتجات <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {lowStockProducts.map((p: { id: string; name: string; quantity: number; images?: { url: string }[] }) => (
              <Link
                key={p.id}
                href={`/dashboard/products/${p.id}/edit`}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                  <p className={`text-xs font-bold mt-0.5 ${p.quantity === 0 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {p.quantity === 0 ? "⛔ نفدت الكمية" : `⚠️ متبقي ${p.quantity} فقط`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Charts + Orders Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders by Status Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
        >
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            الطلبات حسب الحالة
          </h2>
          {ordersByStatus?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
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
                    contentStyle={{ background: "rgba(15,23,42,0.9)", border: "none", borderRadius: "10px", color: "#f1f5f9", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {ordersByStatus.map((item: { status: string; _count: number }, index: number) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-400">{ORDER_STATUS_LABELS[item.status] || item.status}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item._count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ShoppingCart className="w-8 h-8 opacity-30" />
              <p className="text-sm">لا توجد طلبات بعد</p>
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
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              </div>
              آخر الطلبات
            </h2>
            <Link href="/dashboard/orders" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              عرض الكل <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders?.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order: {
                id: string;
                orderNumber: string;
                status: string;
                total: number;
                currency: string;
                createdAt: string;
                customer?: { name: string; email: string };
              }) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-slate-400">
                        {order.customer?.name || "زائر"} · {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {formatCurrency(Number(order.total), order.currency)}
                    </p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ShoppingCart className="w-10 h-10 opacity-30" />
              <p className="text-sm">لا توجد طلبات حتى الآن</p>
              <Link href="/dashboard/products" className="text-xs text-brand-500 hover:underline font-semibold">
                أضف منتجاتك وابدأ البيع →
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── Top Products ─────────────────────────────────────── */}
      {topProducts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              أفضل المنتجات مبيعاً
            </h2>
            <Link href="/dashboard/products" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              كل المنتجات <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((item: {
              productId: string;
              _sum: { quantity: number; total: number };
              product?: { id: string; name: string; images?: { url: string }[] };
            }, rank: number) => {
              const maxTotal = topProducts[0]?._sum?.total ?? 1;
              const pct = ((item._sum?.total ?? 0) / maxTotal) * 100;
              return (
                <div key={item.productId} className="flex items-center gap-4">
                  <span className="text-sm font-black text-slate-300 dark:text-slate-600 w-5 text-center flex-shrink-0">
                    {rank + 1}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400 m-auto mt-2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.product?.name || "منتج محذوف"}
                      </p>
                      <p className="text-sm font-black text-brand-600 dark:text-brand-400 flex-shrink-0 ms-2">
                        {formatCurrency(Number(item._sum?.total ?? 0))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{item._sum?.quantity ?? 0} مبيع</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ─── Empty State if no data ───────────────────────────── */}
      {!topProducts?.length && !recentOrders?.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-950/30 dark:to-purple-950/30 rounded-3xl border border-brand-100 dark:border-brand-900 p-10 text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-brand-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">متجرك جاهز! 🎉</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
            ابدأ بإضافة منتجاتك وشاركها مع عملائك. ستظهر الإحصائيات هنا تلقائياً بعد أول طلب.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/dashboard/products/new" className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors shadow-md shadow-brand-500/25">
              ➕ إضافة منتج
            </Link>
            <Link href="/dashboard/categories" className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              🗂 إضافة تصنيف
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

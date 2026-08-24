"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faBoxesStacked,
  faReceipt,
  faUsers,
  faDollarSign,
  faCircleNotch,
  faTriangleExclamation,
  faClock,
  faPlus,
  faChartLine,
  faEye,
  faChevronLeft,
  faChevronRight,
  faBolt,
  faBoxArchive,
  faArrowLeft,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
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

const PIE_COLORS = ["#0066cc", "#2997ff", "#5e5ce6", "#64d2ff", "#86868b"];

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
  label, value, icon, trend, suffix = "", delay = 0,
}: {
  label: string;
  value: string | number;
  icon: any;
  trend?: number | null;
  suffix?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="apple-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-[#86868b] dark:text-[#a1a1a6]">{label}</p>
          <p className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white mt-1.5 tracking-tight">
            {typeof value === "number" ? value.toLocaleString("ar-EG") : value}{suffix}
          </p>
          {trend !== null && trend !== undefined && (
            <div className={`flex items-center gap-1.5 mt-2 text-[12px] font-semibold ${trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              <FontAwesomeIcon icon={trend >= 0 ? faArrowTrendUp : faArrowTrendDown} className="w-3 h-3" />
              <span>{Math.abs(trend)}% مقارنة بالشهر السابق</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 dark:bg-[#2997ff]/15 flex items-center justify-center flex-shrink-0 text-[#0066cc] dark:text-[#2997ff]">
          <FontAwesomeIcon icon={icon} className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

function QuickActions({ slug }: { slug?: string }) {
  const actions = [
    { label: "منتج جديد", icon: faPlus, href: "/dashboard/products/new", primary: true },
    { label: "الطلبات", icon: faReceipt, href: "/dashboard/orders" },
    { label: "التحليلات", icon: faChartLine, href: "/dashboard/analytics" },
    { label: "معاينة المتجر", icon: faEye, href: slug ? `/store/${slug}` : "#", external: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2"
    >
      {actions.map((a) => {
        const cls = a.primary
          ? "btn-apple-primary text-[13px] px-4 py-2"
          : "btn-apple-pearl text-[13px] px-3.5 py-2";

        if (a.external) {
          return (
            <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>
              <FontAwesomeIcon icon={a.icon} className="w-3.5 h-3.5" />
              <span>{a.label}</span>
            </a>
          );
        }
        return (
          <Link key={a.label} href={a.href} className={cls}>
            <FontAwesomeIcon icon={a.icon} className="w-3.5 h-3.5" />
            <span>{a.label}</span>
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
    refetchInterval: 60_000,
  });

  const { user, currentTenant } = useAuth();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FontAwesomeIcon icon={faCircleNotch} className="w-6 h-6 animate-spin text-[#0066cc] dark:text-[#2997ff]" />
        <p className="text-[13px] text-[#86868b]">جاري تحميل البيانات...</p>
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
      icon: faDollarSign,
      trend: stats?.revenueGrowth,
    },
    {
      label: "إجمالي الطلبات",
      value: stats?.totalOrders ?? 0,
      icon: faReceipt,
      trend: null,
    },
    {
      label: "المنتجات النشطة",
      value: stats?.totalProducts ?? 0,
      icon: faBoxesStacked,
      trend: null,
    },
    {
      label: "إجمالي العملاء",
      value: stats?.totalCustomers ?? 0,
      icon: faUsers,
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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
            {greeting}، {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">{todayLabel}</p>
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
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[13px] font-medium hover:bg-amber-500/20 transition-all group"
              >
                <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong className="font-semibold">{stats.pendingOrdersCount}</strong> طلب بانتظار المراجعة والتنفيذ
                </span>
                <FontAwesomeIcon icon={faChevronLeft} className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all mr-1" />
              </Link>
            )}
            {(stats?.lowStockCount ?? 0) > 0 && (
              <Link
                href="/dashboard/products"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-[13px] font-medium hover:bg-rose-500/20 transition-all group"
              >
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>
                  <strong className="font-semibold">{stats.lowStockCount}</strong> منتج شارف على النفاد
                </span>
                <FontAwesomeIcon icon={faChevronLeft} className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-all mr-1" />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.05} />
        ))}
      </div>

      {/* ─── Customer Growth Mini Cards ───────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0066cc] rounded-[18px] p-4 text-white"
        >
          <p className="text-[12px] font-medium opacity-85">عملاء اليوم</p>
          <p className="text-2xl sm:text-3xl font-semibold mt-1 tracking-tight">{stats?.newCustomersToday ?? 0}</p>
          <p className="text-[11px] opacity-75 mt-0.5">عميل جديد</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="apple-card p-4"
        >
          <p className="text-[12px] font-medium text-[#86868b]">عملاء الأسبوع</p>
          <p className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white mt-1 tracking-tight">{stats?.newCustomersWeek ?? 0}</p>
          <p className="text-[11px] text-[#86868b] mt-0.5">آخر 7 أيام</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="apple-card p-4"
        >
          <p className="text-[12px] font-medium text-[#86868b]">طلبات معلقة</p>
          <p className={`text-2xl sm:text-3xl font-semibold mt-1 tracking-tight ${(stats?.pendingOrdersCount ?? 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-[#1d1d1f] dark:text-white"}`}>
            {stats?.pendingOrdersCount ?? 0}
          </p>
          <p className="text-[11px] text-[#86868b] mt-0.5">بانتظار الإجراء</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="apple-card p-4"
        >
          <p className="text-[12px] font-medium text-[#86868b]">مخزون منخفض</p>
          <p className={`text-2xl sm:text-3xl font-semibold mt-1 tracking-tight ${(stats?.lowStockCount ?? 0) > 0 ? "text-rose-600 dark:text-rose-400" : "text-[#1d1d1f] dark:text-white"}`}>
            {stats?.lowStockCount ?? 0}
          </p>
          <p className="text-[11px] text-[#86868b] mt-0.5">كمية ≤ 5</p>
        </motion.div>
      </div>

      {/* ─── Revenue Chart ────────────────────────────────────── */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="apple-card"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2 tracking-tight">
                <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
                <span>الإيرادات – آخر 30 يوم</span>
              </h2>
              <p className="text-[13px] text-[#86868b] mt-0.5">
                إجمالي المبيعات:{" "}
                <span className="font-semibold text-[#1d1d1f] dark:text-white">
                  {formatCurrency(chartData.reduce((s: number, d: { revenue: number }) => s + d.revenue, 0))}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium">
              {(stats?.revenueGrowth ?? 0) >= 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <FontAwesomeIcon icon={faArrowTrendUp} className="w-3 h-3" /> +{stats?.revenueGrowth}%
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-full">
                  <FontAwesomeIcon icon={faArrowTrendDown} className="w-3 h-3" /> {stats?.revenueGrowth}%
                </span>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066cc" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0066cc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#86868b" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#86868b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v.toLocaleString()}`}
              />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val), "الإيرادات"]}
                contentStyle={{
                  background: "rgba(29,29,31,0.92)",
                  border: "none",
                  borderRadius: "14px",
                  color: "#f5f5f7",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                }}
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
      )}

      {/* ─── Low Stock Alert ──────────────────────────────────── */}
      {(lowStockProducts?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="apple-card border-rose-500/20 dark:border-rose-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              </div>
              <span>تحذير المخزون — منتجات على وشك النفاد</span>
            </h2>
            <Link href="/dashboard/products" className="text-[13px] text-[#0066cc] dark:text-[#2997ff] hover:underline font-medium flex items-center gap-1">
              <span>إدارة المنتجات</span>
              <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {lowStockProducts.map((p: { id: string; name: string; quantity: number; images?: { url: string }[] }) => (
              <Link
                key={p.id}
                href={`/dashboard/products/${p.id}/edit`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#f5f5f7] dark:bg-[#272729] hover:bg-[#ebebee] dark:hover:bg-[#333336] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#1f1f21] border border-black/[0.04] dark:border-white/[0.06] flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <FontAwesomeIcon icon={faBoxArchive} className="w-4 h-4 text-[#86868b]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white truncate">{p.name}</p>
                  <p className={`text-[11px] font-semibold mt-0.5 ${p.quantity === 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {p.quantity === 0 ? "نفدت الكمية تماماً" : `متبقي ${p.quantity} قطع فقط`}
                  </p>
                </div>
                <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3 text-[#86868b] group-hover:text-[#0066cc] dark:group-hover:text-[#2997ff] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Charts + Orders Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders by Status Pie */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="apple-card"
        >
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white mb-4 tracking-tight">
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
                    innerRadius={52}
                    outerRadius={72}
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
                    contentStyle={{
                      background: "rgba(29,29,31,0.92)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#f5f5f7",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {ordersByStatus.map((item: { status: string; _count: number }, index: number) => (
                  <div key={item.status} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-[#86868b]">{ORDER_STATUS_LABELS[item.status] || item.status}</span>
                    </div>
                    <span className="font-semibold text-[#1d1d1f] dark:text-white">{item._count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-[#86868b]">
              <FontAwesomeIcon icon={faReceipt} className="w-7 h-7 opacity-30" />
              <p className="text-[13px]">لا توجد طلبات بعد</p>
            </div>
          )}
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 apple-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2 tracking-tight">
              <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5 text-[#0066cc] dark:text-[#2997ff]" />
              <span>أحدث الطلبات</span>
            </h2>
            <Link href="/dashboard/orders" className="text-[13px] font-medium text-[#0066cc] dark:text-[#2997ff] hover:underline flex items-center gap-1">
              <span>عرض الكل</span>
              <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders?.length > 0 ? (
            <div className="space-y-1.5">
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
                  className="flex items-center justify-between py-2.5 px-3 rounded-2xl hover:bg-[#f5f5f7] dark:hover:bg-[#272729] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faReceipt} className="w-3.5 h-3.5 text-[#86868b]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">
                        {order.orderNumber}
                      </p>
                      <p className="text-[11px] text-[#86868b]">
                        {order.customer?.name || "زائر"} · {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">
                      {formatCurrency(Number(order.total), order.currency)}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-[#86868b]">
              <FontAwesomeIcon icon={faReceipt} className="w-8 h-8 opacity-30" />
              <p className="text-[13px]">لا توجد طلبات حتى الآن</p>
              <Link href="/dashboard/products" className="text-[13px] text-[#0066cc] hover:underline font-medium">
                أضف منتجاتك وابدأ البيع
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── Top Products ─────────────────────────────────────── */}
      {topProducts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="apple-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2 tracking-tight">
              <FontAwesomeIcon icon={faBolt} className="w-3.5 h-3.5 text-amber-500" />
              <span>أفضل المنتجات مبيعاً</span>
            </h2>
            <Link href="/dashboard/products" className="text-[13px] font-medium text-[#0066cc] dark:text-[#2997ff] hover:underline flex items-center gap-1">
              <span>كل المنتجات</span>
              <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
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
                  <span className="text-[13px] font-semibold text-[#86868b] w-5 text-center flex-shrink-0">
                    {rank + 1}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] dark:bg-[#272729] flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FontAwesomeIcon icon={faBoxArchive} className="w-4 h-4 text-[#86868b]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white truncate">
                        {item.product?.name || "منتج محذوف"}
                      </p>
                      <p className="text-[13px] font-semibold text-[#0066cc] dark:text-[#2997ff] flex-shrink-0 ms-2">
                        {formatCurrency(Number(item._sum?.total ?? 0))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#f5f5f7] dark:bg-[#272729] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0066cc] dark:bg-[#2997ff] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-[#86868b] flex-shrink-0">{item._sum?.quantity ?? 0} مبيع</span>
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="apple-card text-center p-8 sm:p-12"
        >
          <div className="w-14 h-14 rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faStore} className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-2 tracking-tight">متجرك جاهز للانطلاق</h3>
          <p className="text-[#86868b] text-[14px] mb-6 max-w-md mx-auto">
            أضف أول منتجاتك وشارك رابط متجرك مع عملائك، وستظهر تقارير المبيعات والأداء هنا مباشرة.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/dashboard/products/new" className="btn-apple-primary text-[14px]">
              <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
              <span>إضافة منتج جديد</span>
            </Link>
            <Link href="/dashboard/categories" className="btn-apple-pearl text-[14px]">
              <span>إدارة التصنيفات</span>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Store, Users, ToggleLeft, ToggleRight,
  Plus, X, Loader2, Building2, CheckCircle2, XCircle,
  Eye, EyeOff, ChevronRight, Package, ShoppingCart,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────
interface TenantOwner {
  user: { id: string; name: string; email: string };
}
interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  members: TenantOwner[];
  _count: { products: number; orders: number; customers: number };
}
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  tenantMembers: { role: string; tenant: { name: string; slug: string } }[];
}

// ─── Create Store Schema ──────────────────────────────────────────────────────
const createStoreSchema = z.object({
  ownerName: z.string().min(2, "اسم المالك مطلوب"),
  ownerEmail: z.string().email("بريد إلكتروني غير صالح"),
  ownerPassword: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
  storeName: z.string().min(2, "اسم المتجر مطلوب"),
  storeSlug: z
    .string()
    .min(3, "الرابط السريع 3 أحرف على الأقل")
    .regex(/^[a-z0-9-]+$/, "أحرف صغيرة وأرقام وشرطات فقط"),
});
type CreateStoreData = z.infer<typeof createStoreSchema>;

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"stores" | "users">("stores");
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Guard: redirect if not super admin
  useEffect(() => {
    if (!authLoading && user && user.email !== "demo@shop.com") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Fetch tenants
  const { data: tenantsData, isLoading: tenantsLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => api.get("/api/admin/tenants").then((r) => r.data),
    enabled: !!user && user.email === "demo@shop.com",
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/api/admin/users").then((r) => r.data),
    enabled: !!user && user.email === "demo@shop.com",
  });

  const tenants: Tenant[] = tenantsData?.tenants || [];
  const users: User[] = usersData?.users || [];
  const activeStores = tenants.filter((t) => t.isActive).length;

  // Create store mutation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateStoreData>({ resolver: zodResolver(createStoreSchema) });

  const createMutation = useMutation({
    mutationFn: (data: CreateStoreData) => api.post("/api/admin/tenants", data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: "✅ تم إنشاء المتجر بنجاح!",
        description: `متجر "${res.data.tenant.name}" جاهز للعمل.`,
      });
      setShowModal(false);
      reset();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "فشل إنشاء المتجر";
      toast({ title: "خطأ", description: msg, variant: "destructive" });
    },
  });

  // Toggle store active status
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/api/admin/tenants/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      toast({ title: "تم تحديث حالة المتجر" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل تحديث الحالة", variant: "destructive" });
    },
  });

  // Auto generate slug from store name
  const storeName = watch("storeName");
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setValue("storeSlug", slug);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user || user.email !== "demo@shop.com") return null;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              لوحة المدير العام
            </h1>
            <p className="text-sm text-slate-500">Super Admin Control Panel</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          إضافة متجر جديد
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Building2} label="إجمالي المتاجر" value={tenants.length} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <StatCard icon={CheckCircle2} label="المتاجر النشطة" value={activeStores} color="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard icon={Users} label="إجمالي المستخدمين" value={users.length} color="bg-gradient-to-br from-amber-500 to-orange-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { key: "stores", label: "المتاجر", icon: Store },
          { key: "users", label: "المستخدمون", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "stores" | "users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stores Tab */}
      {activeTab === "stores" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          {tenantsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">لا توجد متاجر مسجلة بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">المتجر</th>
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">المالك</th>
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">المنتجات</th>
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">الطلبات</th>
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">الحالة</th>
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {tenants.map((tenant) => {
                    const owner = tenant.members?.[0]?.user;
                    return (
                      <motion.tr
                        key={tenant.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Store name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                              {tenant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{tenant.name}</p>
                              <a
                                href={`/store/${tenant.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-brand-500 hover:underline flex items-center gap-0.5"
                              >
                                /{tenant.slug} <ChevronRight className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </td>
                        {/* Owner */}
                        <td className="px-5 py-4">
                          {owner ? (
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{owner.name}</p>
                              <p className="text-xs text-slate-400">{owner.email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        {/* Products */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <Package className="w-3.5 h-3.5 text-slate-400" />
                            {tenant._count.products}
                          </span>
                        </td>
                        {/* Orders */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                            <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                            {tenant._count.orders}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${
                              tenant.isActive
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {tenant.isActive ? (
                              <><CheckCircle2 className="w-3 h-3" /> نشط</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> معطل</>
                            )}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              toggleMutation.mutate({
                                id: tenant.id,
                                isActive: !tenant.isActive,
                              })
                            }
                            disabled={toggleMutation.isPending}
                            title={tenant.isActive ? "تعطيل المتجر" : "تفعيل المتجر"}
                            className="flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
                          >
                            {tenant.isActive ? (
                              <ToggleRight className="w-7 h-7 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-7 h-7 text-slate-400" />
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          {usersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">المستخدم</th>
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">البريد الإلكتروني</th>
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">المتاجر والأدوار</th>
                    <th className="text-right px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {users.map((u) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{u.email}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {u.tenantMembers.map((m, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-xs font-bold">
                              {m.tenant.name} · {m.role === "OWNER" ? "مالك" : m.role === "ADMIN" ? "مشرف" : "موظف"}
                            </span>
                          ))}
                          {u.tenantMembers.length === 0 && (
                            <span className="text-xs text-slate-400">لا توجد متاجر</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString("ar-EG", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Store Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">إضافة متجر جديد</h2>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Modal Body */}
                <form
                  onSubmit={handleSubmit((d) => createMutation.mutate(d))}
                  className="p-6 space-y-4"
                >
                  {/* Section: Owner */}
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                      👤 بيانات المالك
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          اسم المالك <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("ownerName")}
                          placeholder="مثال: أحمد محمد"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                        />
                        {errors.ownerName && <p className="mt-1 text-xs text-red-500">{errors.ownerName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          البريد الإلكتروني <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("ownerEmail")}
                          type="email"
                          placeholder="owner@example.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                          dir="ltr"
                        />
                        {errors.ownerEmail && <p className="mt-1 text-xs text-red-500">{errors.ownerEmail.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          كلمة المرور <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register("ownerPassword")}
                            type={showPassword ? "text" : "password"}
                            placeholder="8 أحرف على الأقل"
                            className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.ownerPassword && <p className="mt-1 text-xs text-red-500">{errors.ownerPassword.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 dark:border-slate-800 my-2" />

                  {/* Section: Store */}
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                      🏪 بيانات المتجر
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          اسم المتجر <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("storeName", { onChange: handleStoreNameChange })}
                          placeholder="مثال: متجر حسن"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm"
                        />
                        {errors.storeName && <p className="mt-1 text-xs text-red-500">{errors.storeName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          الرابط السريع (Slug) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all">
                          <span className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs border-l border-slate-200 dark:border-slate-700 flex items-center whitespace-nowrap" dir="ltr">
                            /store/
                          </span>
                          <input
                            {...register("storeSlug")}
                            placeholder="my-store"
                            className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none text-sm"
                            dir="ltr"
                          />
                        </div>
                        {errors.storeSlug && <p className="mt-1 text-xs text-red-500">{errors.storeSlug.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); reset(); }}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> إنشاء المتجر
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

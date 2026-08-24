"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faStore,
  faUsers,
  faToggleOn,
  faToggleOff,
  faPlus,
  faXmark,
  faCircleNotch,
  faBuilding,
  faCheck,
  faEye,
  faEyeSlash,
  faChevronLeft,
  faBoxArchive,
  faReceipt,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth.context";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="apple-card p-5 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#0066cc]/10 dark:bg-[#2997ff]/15 text-[#0066cc] dark:text-[#2997ff] flex-shrink-0">
        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">{value}</p>
        <p className="text-[13px] text-[#86868b] font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"stores" | "users">("stores");
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.email !== "hassan700019@gmail.com") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const { data: tenantsData, isLoading: tenantsLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => api.get("/api/admin/tenants").then((r) => r.data),
    enabled: !!user && user.email === "hassan700019@gmail.com",
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/api/admin/users").then((r) => r.data),
    enabled: !!user && user.email === "hassan700019@gmail.com",
  });

  const tenants: Tenant[] = tenantsData?.tenants || [];
  const users: User[] = usersData?.users || [];
  const activeStores = tenants.filter((t) => t.isActive).length;

  const {
    register,
    handleSubmit,
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
        title: "تم إنشاء المتجر بنجاح",
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
        <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 animate-spin text-[#0066cc]" />
      </div>
    );
  }

  if (!user || user.email !== "hassan700019@gmail.com") return null;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0066cc] flex items-center justify-center shadow-sm text-white">
            <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
              لوحة المدير العام
            </h1>
            <p className="text-[13px] text-[#86868b]">Super Admin Platform Controls</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-apple-primary text-[14px]"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          <span>إضافة متجر جديد</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={faBuilding} label="إجمالي المتاجر" value={tenants.length} />
        <StatCard icon={faStore} label="المتاجر النشطة" value={activeStores} />
        <StatCard icon={faUsers} label="إجمالي المستخدمين" value={users.length} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#f5f5f7] dark:bg-[#272729] p-1 rounded-full w-fit">
        {[
          { key: "stores", label: "المتاجر", icon: faStore },
          { key: "users", label: "المستخدمون", icon: faUsers },
        ].map((tab) => {
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "stores" | "users")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-white shadow-sm"
                  : "text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stores Tab */}
      {activeTab === "stores" && (
        <div className="apple-card p-0 overflow-hidden">
          {tenantsLoading ? (
            <div className="flex items-center justify-center py-16">
              <FontAwesomeIcon icon={faCircleNotch} className="w-7 h-7 animate-spin text-[#0066cc]" />
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-16 text-[#86868b]">
              <FontAwesomeIcon icon={faStore} className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد متاجر مسجلة بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.04] dark:border-white/[0.06]">
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">المتجر</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">المالك</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">المنتجات</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">الطلبات</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">الحالة</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                  {tenants.map((tenant) => {
                    const owner = tenant.members?.[0]?.user;
                    return (
                      <motion.tr
                        key={tenant.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {tenant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1d1d1f] dark:text-white text-sm">{tenant.name}</p>
                              <a
                                href={`/store/${tenant.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#0066cc] dark:text-[#2997ff] hover:underline flex items-center gap-1 font-mono"
                              >
                                <span>/{tenant.slug}</span>
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {owner ? (
                            <div>
                              <p className="text-sm font-semibold text-[#1d1d1f] dark:text-white">{owner.name}</p>
                              <p className="text-xs text-[#86868b]">{owner.email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-[#86868b]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#1d1d1f] dark:text-white">
                            <FontAwesomeIcon icon={faBoxArchive} className="w-3 h-3 text-[#86868b]" />
                            <span>{tenant._count.products}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#1d1d1f] dark:text-white">
                            <FontAwesomeIcon icon={faReceipt} className="w-3 h-3 text-[#86868b]" />
                            <span>{tenant._count.orders}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              tenant.isActive
                                ? "badge-apple-green"
                                : "badge-apple-red"
                            }`}
                          >
                            <span>{tenant.isActive ? "نشط" : "معطل"}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              toggleMutation.mutate({
                                id: tenant.id,
                                isActive: !tenant.isActive,
                              })
                            }
                            disabled={toggleMutation.isPending}
                            className="text-lg transition-transform hover:scale-105 disabled:opacity-50"
                            title={tenant.isActive ? "تعطيل المتجر" : "تفعيل المتجر"}
                          >
                            <FontAwesomeIcon
                              icon={tenant.isActive ? faToggleOn : faToggleOff}
                              className={tenant.isActive ? "text-emerald-500 text-2xl" : "text-[#86868b] text-2xl"}
                            />
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
        <div className="apple-card p-0 overflow-hidden">
          {usersLoading ? (
            <div className="flex items-center justify-center py-16">
              <FontAwesomeIcon icon={faCircleNotch} className="w-7 h-7 animate-spin text-[#0066cc]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/[0.04] dark:border-white/[0.06]">
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">المستخدم</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">البريد الإلكتروني</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">المتاجر والأدوار</th>
                    <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                  {users.map((u) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#1d1d1f] dark:text-white text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-[#86868b]">{u.email}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {u.tenantMembers.map((m, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full badge-apple-blue text-xs font-semibold">
                              {m.tenant.name} · {m.role === "OWNER" ? "مالك" : m.role === "ADMIN" ? "مشرف" : "موظف"}
                            </span>
                          ))}
                          {u.tenantMembers.length === 0 && (
                            <span className="text-xs text-[#86868b]">لا توجد متاجر</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-[#86868b]">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-[#1d1d1f] rounded-[24px] shadow-apple-modal w-full max-w-lg border border-black/[0.08] dark:border-white/[0.12] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-black/[0.04] dark:border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white">
                      <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white">إضافة متجر جديد للمنصة</h2>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                  >
                    <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit((d) => createMutation.mutate(d))}
                  className="p-6 space-y-4"
                >
                  <div>
                    <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-2.5">
                      بيانات مالك المتجر
                    </p>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                          اسم المالك <span className="text-rose-500">*</span>
                        </label>
                        <input
                          {...register("ownerName")}
                          placeholder="مثال: أحمد محمد"
                          className="apple-input text-xs"
                        />
                        {errors.ownerName && <p className="mt-1 text-xs text-rose-500">{errors.ownerName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                          البريد الإلكتروني <span className="text-rose-500">*</span>
                        </label>
                        <input
                          {...register("ownerEmail")}
                          type="email"
                          placeholder="owner@example.com"
                          className="apple-input text-xs"
                          dir="ltr"
                        />
                        {errors.ownerEmail && <p className="mt-1 text-xs text-rose-500">{errors.ownerEmail.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                          كلمة المرور <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            {...register("ownerPassword")}
                            type={showPassword ? "text" : "password"}
                            placeholder="8 أحرف على الأقل"
                            className="apple-input text-xs pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
                          >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {errors.ownerPassword && <p className="mt-1 text-xs text-rose-500">{errors.ownerPassword.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-black/[0.04] dark:border-white/[0.06] my-2" />

                  <div>
                    <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-2.5">
                      بيانات المتجر
                    </p>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                          اسم المتجر <span className="text-rose-500">*</span>
                        </label>
                        <input
                          {...register("storeName", { onChange: handleStoreNameChange })}
                          placeholder="مثال: متجر آبل ستور"
                          className="apple-input text-xs"
                        />
                        {errors.storeName && <p className="mt-1 text-xs text-rose-500">{errors.storeName.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                          الرابط السريع (Slug) <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7] dark:bg-[#272729]">
                          <span className="px-3 py-2 text-[#86868b] text-xs flex items-center whitespace-nowrap font-mono" dir="ltr">
                            /store/
                          </span>
                          <input
                            {...register("storeSlug")}
                            placeholder="apple-store"
                            className="flex-1 px-3 py-2 bg-transparent text-[#1d1d1f] dark:text-white focus:outline-none text-xs font-mono"
                            dir="ltr"
                          />
                        </div>
                        {errors.storeSlug && <p className="mt-1 text-xs text-rose-500">{errors.storeSlug.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); reset(); }}
                      className="btn-apple-pearl flex-1 text-xs py-2"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="btn-apple-primary flex-1 text-xs py-2"
                    >
                      {createMutation.isPending ? (
                        <FontAwesomeIcon icon={faCircleNotch} className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                          <span>إنشاء المتجر الآن</span>
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

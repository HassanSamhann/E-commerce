"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faCircleNotch,
  faUsers,
  faPlus,
  faTrashCan,
  faUserPlus,
  faPalette,
  faCheck,
  faEye,
  faEyeSlash,
  faArrowUpRightFromSquare,
  faSparkles,
  faStore,
  faUpload,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth.context";
import { THEME_LIST, type ThemeId } from "@/lib/themes";

export default function SettingsPage() {
  const { toast } = useToast();
  const { currentTenant } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("STAFF");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeId | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post("/api/media/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      updateMutation.mutate({ logoUrl: response.data.url });
      toast({ title: "تم تحديث الشعار بنجاح" });
    } catch (err: any) {
      toast({ title: "خطأ في الرفع", description: err.response?.data?.error || "فشل رفع الشعار", variant: "destructive" });
    } finally {
      setIsUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post("/api/media/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      updateMutation.mutate({ coverUrl: response.data.url });
      toast({ title: "تم تحديث غلاف المتجر بنجاح" });
    } catch (err: any) {
      toast({ title: "خطأ في الرفع", description: err.response?.data?.error || "فشل رفع الغلاف", variant: "destructive" });
    } finally {
      setIsUploadingCover(false);
      e.target.value = "";
    }
  };

  const { data: tenantData, isLoading } = useQuery({
    queryKey: ["tenant"],
    queryFn: () => api.get("/api/tenant").then((r) => r.data),
  });

  const { data: membersData } = useQuery({
    queryKey: ["members"],
    queryFn: () => api.get("/api/tenant/members").then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.put("/api/tenant", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
      toast({ title: "تم حفظ الإعدادات بنجاح" });
    },
    onError: (err: any) => {
      toast({ title: "خطأ", description: err.response?.data?.error || "فشل حفظ الإعدادات", variant: "destructive" });
    },
  });

  const applyThemeMutation = useMutation({
    mutationFn: (themeId: ThemeId) => api.put("/api/tenant", { theme: themeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
      toast({ title: "تم تفعيل القالب بنجاح", description: "واجهة متجرك تعرض الآن القالب المختار." });
    },
    onError: (err: any) => {
      toast({ title: "خطأ", description: err.response?.data?.error || "فشل تطبيق القالب", variant: "destructive" });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      api.post("/api/tenant/members/invite", { email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({ title: "تم إرسال الدعوة بنجاح" });
      setInviteEmail("");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "فشل إرسال الدعوة";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => api.delete(`/api/tenant/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({ title: "تمت إزالة العضو" });
    },
  });

  const tenant = tenantData?.tenant;
  const members = membersData?.members ?? [];
  const activeTheme = (tenant?.theme || "classic") as ThemeId;
  const storeSlug = tenant?.slug;

  const tabs = [
    { id: "general", label: "General" },
    { id: "themes", label: "Themes & Layout" },
    { id: "team", label: "Team & Permissions" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Settings</h1>
        <p className="text-[13px] text-[#86868b] mt-0.5">Manage store configuration, branding, and themes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all active:scale-95 flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-[#0066cc] text-white shadow-none"
                : "bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#ebebee] dark:hover:bg-[#333336]"
            }`}
          >
            {tab.id === "themes" && <FontAwesomeIcon icon={faPalette} className="w-3 h-3" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══════ GENERAL TAB ══════ */}
      {activeTab === "general" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="apple-card space-y-5">
          {isLoading ? (
            <div className="flex justify-center h-32 items-center">
              <FontAwesomeIcon icon={faCircleNotch} className="w-6 h-6 animate-spin text-[#0066cc]" />
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white">Store Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Store Name</label>
                  <input id="store-name-setting" defaultValue={tenant?.name} onBlur={(e) => updateMutation.mutate({ name: e.target.value })}
                    className="apple-input text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Description</label>
                  <textarea defaultValue={tenant?.description || ""} onBlur={(e) => updateMutation.mutate({ description: e.target.value })} rows={3}
                    className="apple-input text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Email</label>
                  <input type="email" defaultValue={tenant?.email || ""} onBlur={(e) => updateMutation.mutate({ email: e.target.value })}
                    className="apple-input text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Phone</label>
                  <input defaultValue={tenant?.phone || ""} onBlur={(e) => updateMutation.mutate({ phone: e.target.value })}
                    className="apple-input text-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Currency</label>
                  <select defaultValue={tenant?.currency || "EGP"} onChange={(e) => updateMutation.mutate({ currency: e.target.value })}
                    className="apple-input text-sm">
                    <option value="EGP">EGP — Egyptian Pound</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="SAR">SAR — Saudi Riyal</option>
                    <option value="AED">AED — UAE Dirham</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Brand Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue={tenant?.primaryColor || "#0066cc"} onChange={(e) => updateMutation.mutate({ primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-full border border-black/[0.08] dark:border-white/[0.12] cursor-pointer p-0 overflow-hidden" />
                    <span className="text-xs font-mono text-[#86868b]">{tenant?.primaryColor || "#0066cc"}</span>
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div className="pt-5 border-t border-black/[0.04] dark:border-white/[0.06] space-y-4">
                <h3 className="text-base font-semibold text-[#1d1d1f] dark:text-white">Store Branding & Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-[#f5f5f7] dark:bg-[#272729] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden flex items-center justify-center relative flex-shrink-0">
                      {tenant?.logoUrl ? <img src={tenant.logoUrl} alt="Store Logo" className="w-full h-full object-cover" /> : <span className="text-xs font-semibold text-[#86868b]">No Logo</span>}
                      {isUploadingLogo && <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center"><FontAwesomeIcon icon={faCircleNotch} className="w-5 h-5 animate-spin text-[#0066cc]" /></div>}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Store Logo</h4>
                      <p className="text-[11px] text-[#86868b] mt-0.5 mb-2.5">Upload a square logo for your store header</p>
                      <input type="file" ref={logoInputRef} accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} className="hidden" />
                      <button type="button" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo}
                        className="btn-apple-pearl text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faUpload} className="w-3 h-3" />
                        <span>Upload Logo</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-[#f5f5f7] dark:bg-[#272729] rounded-2xl border border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-32 h-20 rounded-2xl bg-white dark:bg-[#1d1d1f] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden flex items-center justify-center relative flex-shrink-0">
                      {tenant?.coverUrl ? <img src={tenant.coverUrl} alt="Cover" className="w-full h-full object-cover" /> : <span className="text-xs font-semibold text-[#86868b]">No Cover</span>}
                      {isUploadingCover && <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center"><FontAwesomeIcon icon={faCircleNotch} className="w-5 h-5 animate-spin text-[#0066cc]" /></div>}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">Cover Banner</h4>
                      <p className="text-[11px] text-[#86868b] mt-0.5 mb-2.5">Upload a landscape header image</p>
                      <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} className="hidden" />
                      <button type="button" onClick={() => coverInputRef.current?.click()} disabled={isUploadingCover}
                        className="btn-apple-pearl text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faUpload} className="w-3 h-3" />
                        <span>Upload Cover</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-[13px] text-[#86868b]">
                    Storefront Live URL: <span className="font-mono text-[#0066cc] dark:text-[#2997ff]">/store/{tenant?.slug}</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ══════ THEMES TAB ══════ */}
      {activeTab === "themes" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Header banner */}
          <div className="bg-[#1d1d1f] dark:bg-[#272729] rounded-2xl p-6 text-white border border-black/[0.08] dark:border-white/[0.12]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <FontAwesomeIcon icon={faPalette} className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Storefront Themes</h2>
                <p className="text-xs text-white/70">Select an Apple-grade, high-end theme for your storefront</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-white/70">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Theme: <strong className="font-bold text-white capitalize">{activeTheme}</strong></span>
              {storeSlug && (
                <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 ml-3 hover:text-white transition-colors text-[#2997ff]">
                  <span>Open Store</span>
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          {/* Theme Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {THEME_LIST.map((theme) => {
              const isActive = activeTheme === theme.id;
              const isPreviewing = previewTheme === theme.id;
              return (
                <motion.div
                  key={theme.id}
                  whileHover={{ y: -2 }}
                  className={`relative rounded-[18px] border-2 overflow-hidden transition-all cursor-pointer group apple-card p-0 ${
                    isActive
                      ? "border-[#0066cc] dark:border-[#2997ff]"
                      : "border-black/[0.06] dark:border-white/[0.08]"
                  }`}
                  onClick={() => setPreviewTheme(isPreviewing ? null : theme.id as ThemeId)}
                >
                  {/* Gradient Thumbnail */}
                  <div className={`h-28 bg-gradient-to-br ${theme.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="h-6 w-full bg-white/30" />
                      <div className="flex gap-2 p-3">
                        <div className="h-16 flex-1 bg-white/20 rounded-lg" />
                        <div className="h-16 flex-1 bg-white/20 rounded-lg" />
                        <div className="h-16 flex-1 bg-white/20 rounded-lg" />
                      </div>
                    </div>
                    {/* Color swatches */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {theme.previewColors.map((c, i) => (
                        <div key={i} className="w-3.5 h-3.5 rounded-full border-2 border-white/60 shadow-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {/* Active badge */}
                    {isActive && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#0066cc]">
                        <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />
                        <span>Active</span>
                      </div>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-white">{theme.name}</h3>
                      <span className="text-[10px] text-[#86868b] font-medium">{theme.fontFamily}</span>
                    </div>
                    <p className="text-xs text-[#86868b] leading-relaxed mb-4">{theme.description}</p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPreviewTheme(isPreviewing ? null : theme.id as ThemeId); setIframeKey(k => k + 1); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isPreviewing
                            ? "bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f]"
                            : "btn-apple-pearl"
                        }`}
                      >
                        <FontAwesomeIcon icon={isPreviewing ? faEyeSlash : faEye} className="w-3 h-3" />
                        <span>{isPreviewing ? "Hide" : "Preview"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isActive || applyThemeMutation.isPending}
                        onClick={(e) => { e.stopPropagation(); applyThemeMutation.mutate(theme.id as ThemeId); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default"
                            : "btn-apple-primary"
                        }`}
                      >
                        {applyThemeMutation.isPending ? <FontAwesomeIcon icon={faCircleNotch} className="w-3 h-3 animate-spin" /> : isActive ? <FontAwesomeIcon icon={faCheck} className="w-3 h-3" /> : null}
                        <span>{isActive ? "Applied" : "Apply"}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Live Preview Panel */}
          <AnimatePresence>
            {previewTheme && storeSlug && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="apple-card p-0 overflow-hidden shadow-apple-modal"
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#f5f5f7] dark:bg-[#272729] border-b border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-mono text-[#86868b] bg-white dark:bg-[#1d1d1f] px-3 py-0.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] hidden sm:block">
                      /store/{storeSlug}?preview={previewTheme}
                    </span>
                    <span className="text-xs font-semibold text-[#1d1d1f] dark:text-white capitalize">
                      {previewTheme} Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/store/${storeSlug}?preview=${previewTheme}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-[#0066cc] dark:text-[#2997ff] hover:underline"
                    >
                      <span>Open in New Tab</span>
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5" />
                    </a>
                    <button onClick={() => setPreviewTheme(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors">
                      <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Iframe */}
                <div className="relative" style={{ height: "600px" }}>
                  <iframe
                    key={`${previewTheme}-${iframeKey}`}
                    src={`/store/${storeSlug}?preview=${previewTheme}`}
                    className="w-full h-full border-0"
                    title={`${previewTheme} theme preview`}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>

                {/* Apply from preview */}
                <div className="px-4 py-3 bg-[#f5f5f7] dark:bg-[#272729] border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                  <p className="text-xs text-[#86868b]">
                    Previewing <strong className="font-semibold capitalize text-[#1d1d1f] dark:text-white">{previewTheme}</strong> theme
                  </p>
                  <button
                    disabled={activeTheme === previewTheme || applyThemeMutation.isPending}
                    onClick={() => applyThemeMutation.mutate(previewTheme)}
                    className="btn-apple-primary text-xs px-4 py-2"
                  >
                    {applyThemeMutation.isPending ? <FontAwesomeIcon icon={faCircleNotch} className="w-3 h-3 animate-spin" /> : <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />}
                    <span>{activeTheme === previewTheme ? "Already Applied" : "Apply This Theme"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ══════ TEAM TAB ══════ */}
      {activeTab === "team" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="apple-card space-y-4">
            <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faUserPlus} className="w-3.5 h-3.5 text-[#0066cc]" />
              <span>Invite Team Member</span>
            </h2>
            <div className="flex gap-3 flex-wrap">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@example.com"
                className="flex-1 min-w-[220px] apple-input text-xs" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                className="apple-input text-xs w-auto">
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
              <button onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })} disabled={inviteMutation.isPending || !inviteEmail}
                className="btn-apple-primary text-xs px-4 py-2 disabled:opacity-50">
                {inviteMutation.isPending ? <FontAwesomeIcon icon={faCircleNotch} className="w-3 h-3 animate-spin" /> : <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />}
                <span>Send Invite</span>
              </button>
            </div>
          </div>

          <div className="apple-card p-0 overflow-hidden divide-y divide-black/[0.03] dark:divide-white/[0.04]">
            <div className="px-6 py-4">
              <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="w-3.5 h-3.5 text-[#0066cc]" />
                <span>Team Members ({members.length})</span>
              </h2>
            </div>
            {members.map((member: { id: string; role: string; user: { id: string; name: string; email: string } }) => (
              <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-black/[0.02] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-semibold">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">{member.user.name}</p>
                    <p className="text-[11px] text-[#86868b]">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${member.role === "OWNER" ? "badge-apple-blue" : member.role === "ADMIN" ? "badge-apple-green" : "badge-apple-gray"}`}>
                    {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                  </span>
                  {member.role !== "OWNER" && (
                    <button onClick={() => removeMemberMutation.mutate(member.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-[#86868b] hover:text-rose-600 hover:bg-rose-500/10 transition-colors">
                      <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

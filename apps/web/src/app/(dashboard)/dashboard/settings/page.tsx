"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, Users, Plus, Trash2, UserPlus, Palette, Check, Eye, EyeOff, ExternalLink, Sparkles } from "lucide-react";
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
      toast({ title: "✅ Logo updated successfully!" });
    } catch (err: any) {
      toast({ title: "Upload Error", description: err.response?.data?.error || "Failed to upload logo", variant: "destructive" });
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
      toast({ title: "✅ Cover banner updated successfully!" });
    } catch (err: any) {
      toast({ title: "Upload Error", description: err.response?.data?.error || "Failed to upload cover", variant: "destructive" });
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
      toast({ title: "✅ Settings saved!" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to save settings", variant: "destructive" });
    },
  });

  const applyThemeMutation = useMutation({
    mutationFn: (themeId: ThemeId) => api.put("/api/tenant", { theme: themeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
      toast({ title: "✅ Theme applied!", description: "Your storefront now uses the new theme." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.response?.data?.error || "Failed to apply theme", variant: "destructive" });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      api.post("/api/tenant/members/invite", { email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({ title: "✅ Member invited!" });
      setInviteEmail("");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to invite";
      toast({ title: msg, variant: "destructive" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => api.delete(`/api/tenant/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({ title: "Member removed" });
    },
  });

  const tenant = tenantData?.tenant;
  const members = membersData?.members ?? [];
  const activeTheme = (tenant?.theme || "classic") as ThemeId;
  const storeSlug = tenant?.slug;

  const tabs = [
    { id: "general", label: "General" },
    { id: "themes", label: "Themes" },
    { id: "team", label: "Team" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your store settings and appearance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.id === "themes" && <Palette className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════ GENERAL TAB ══════ */}
      {activeTab === "general" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5">
          {isLoading ? (
            <div className="flex justify-center h-32 items-center"><Loader2 className="w-6 h-6 animate-spin text-brand-500" /></div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Store Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Store Name</label>
                  <input id="store-name-setting" defaultValue={tenant?.name} onBlur={(e) => updateMutation.mutate({ name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                  <textarea defaultValue={tenant?.description || ""} onBlur={(e) => updateMutation.mutate({ description: e.target.value })} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                  <input type="email" defaultValue={tenant?.email || ""} onBlur={(e) => updateMutation.mutate({ email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                  <input defaultValue={tenant?.phone || ""} onBlur={(e) => updateMutation.mutate({ phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                  <select defaultValue={tenant?.currency || "EGP"} onChange={(e) => updateMutation.mutate({ currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors">
                    <option value="EGP">EGP — Egyptian Pound</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="SAR">SAR — Saudi Riyal</option>
                    <option value="AED">AED — UAE Dirham</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue={tenant?.primaryColor || "#6366f1"} onChange={(e) => updateMutation.mutate({ primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">{tenant?.primaryColor || "#6366f1"}</span>
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Store Appearance & Branding</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative flex-shrink-0">
                      {tenant?.logoUrl ? <img src={tenant.logoUrl} alt="Store Logo" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-slate-400">No Logo</span>}
                      {isUploadingLogo && <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-brand-500" /></div>}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Store Logo</h4>
                      <p className="text-[11px] text-slate-450 mt-0.5 mb-2.5">Upload a square logo for your store header</p>
                      <input type="file" ref={logoInputRef} accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} className="hidden" />
                      <button type="button" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo}
                        className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 border border-slate-250 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                        Upload Logo
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-32 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative flex-shrink-0">
                      {tenant?.coverUrl ? <img src={tenant.coverUrl} alt="Cover" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-slate-400">No Cover</span>}
                      {isUploadingCover && <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-brand-500" /></div>}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Cover Banner</h4>
                      <p className="text-[11px] text-slate-450 mt-0.5 mb-2.5">Upload a landscape header image</p>
                      <input type="file" ref={coverInputRef} accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} className="hidden" />
                      <button type="button" onClick={() => coverInputRef.current?.click()} disabled={isUploadingCover}
                        className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-350 border border-slate-250 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                        Upload Cover
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Store URL: <span className="font-mono text-brand-600 dark:text-brand-400">/store/{tenant?.slug}</span>
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
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-brand-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Storefront Themes</h2>
                <p className="text-sm text-white/75">Choose a beautiful design for your customers</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-white/70">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active: <span className="font-bold text-white capitalize">{activeTheme}</span></span>
              {storeSlug && (
                <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 ml-2 hover:text-white transition-colors">
                  <ExternalLink className="w-3 h-3" /> View Store
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
                  whileHover={{ y: -3 }}
                  className={`relative rounded-2xl border-2 overflow-hidden transition-all cursor-pointer group ${
                    isActive
                      ? "border-brand-500 shadow-lg shadow-brand-500/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                  onClick={() => setPreviewTheme(isPreviewing ? null : theme.id as ThemeId)}
                >
                  {/* Gradient Thumbnail */}
                  <div className={`h-28 bg-gradient-to-br ${theme.gradient} relative overflow-hidden`}>
                    {/* Simulated UI elements */}
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
                        <div key={i} className="w-4 h-4 rounded-full border-2 border-white/40 shadow-sm" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {/* Active badge */}
                    {isActive && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black text-white bg-brand-500 shadow-sm">
                        <Check className="w-2.5 h-2.5" /> Active
                      </div>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="p-4 bg-white dark:bg-slate-900">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">{theme.name}</h3>
                      <span className="text-[10px] text-slate-400 font-medium">{theme.fontFamily}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{theme.description}</p>

                    <div className="flex gap-2">
                      {/* Preview button */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPreviewTheme(isPreviewing ? null : theme.id as ThemeId); setIframeKey(k => k + 1); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isPreviewing
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {isPreviewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {isPreviewing ? "Hide" : "Preview"}
                      </button>

                      {/* Apply button */}
                      <button
                        type="button"
                        disabled={isActive || applyThemeMutation.isPending}
                        onClick={(e) => { e.stopPropagation(); applyThemeMutation.mutate(theme.id as ThemeId); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? "bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 cursor-default"
                            : "bg-brand-500 text-white hover:bg-brand-600 shadow-sm"
                        }`}
                      >
                        {applyThemeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isActive ? <Check className="w-3.5 h-3.5" /> : null}
                        {isActive ? "Applied" : "Apply"}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl"
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hidden sm:block">
                      /store/{storeSlug}?preview={previewTheme}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                      {previewTheme} Theme Preview
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/store/${storeSlug}?preview=${previewTheme}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </a>
                    <button onClick={() => setPreviewTheme(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Previewing <span className="font-bold capitalize text-slate-700 dark:text-slate-200">{previewTheme}</span> theme — changes are not saved yet.
                  </p>
                  <button
                    disabled={activeTheme === previewTheme || applyThemeMutation.isPending}
                    onClick={() => applyThemeMutation.mutate(previewTheme)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-default shadow-sm"
                  >
                    {applyThemeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {activeTheme === previewTheme ? "Already Applied" : "Apply This Theme"}
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Invite Team Member
            </h2>
            <div className="flex gap-3">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@example.com"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors text-sm">
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
              <button onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })} disabled={inviteMutation.isPending || !inviteEmail}
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Invite
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800">
            <div className="px-6 py-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4" /> Team Members ({members.length})
              </h2>
            </div>
            {members.map((member: { id: string; role: string; user: { id: string; name: string; email: string } }) => (
              <div key={member.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{member.user.name}</p>
                    <p className="text-xs text-slate-400">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${member.role === "OWNER" ? "badge-blue" : member.role === "ADMIN" ? "badge-green" : "badge-gray"}`}>
                    {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                  </span>
                  {member.role !== "OWNER" && (
                    <button onClick={() => removeMemberMutation.mutate(member.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
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

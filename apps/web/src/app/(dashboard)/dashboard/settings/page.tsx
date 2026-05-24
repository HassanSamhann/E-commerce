"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Save, Loader2, Users, Plus, Trash2, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth.context";

export default function SettingsPage() {
  const { toast } = useToast();
  const { currentTenant } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("STAFF");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/api/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const url = response.data.url;
      updateMutation.mutate({ logoUrl: url });
      toast({ title: "✅ Logo updated successfully!" });
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to upload logo";
      toast({ title: "Upload Error", description: msg, variant: "destructive" });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/api/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const url = response.data.url;
      updateMutation.mutate({ coverUrl: url });
      toast({ title: "✅ Cover banner updated successfully!" });
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to upload cover banner";
      toast({ title: "Upload Error", description: msg, variant: "destructive" });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const { data: tenantData, isLoading } = useQuery({
    queryKey: ["tenant"],
    queryFn: () => api.get("/api/tenant").then((r) => r.data),
    enabled: true,
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
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
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

  const tabs = [
    { id: "general", label: "General" },
    { id: "team", label: "Team" },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your store settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5"
        >
          {isLoading ? (
            <div className="flex justify-center h-32 items-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Store Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Store Name</label>
                  <input
                    id="store-name-setting"
                    defaultValue={tenant?.name}
                    onBlur={(e) => updateMutation.mutate({ name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                  <textarea
                    defaultValue={tenant?.description || ""}
                    onBlur={(e) => updateMutation.mutate({ description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    defaultValue={tenant?.email || ""}
                    onBlur={(e) => updateMutation.mutate({ email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                  <input
                    defaultValue={tenant?.phone || ""}
                    onBlur={(e) => updateMutation.mutate({ phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                  <select
                    defaultValue={tenant?.currency || "EGP"}
                    onChange={(e) => updateMutation.mutate({ currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
                  >
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
                    <input
                      type="color"
                      defaultValue={tenant?.primaryColor || "#6366f1"}
                      onChange={(e) => updateMutation.mutate({ primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                    />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {tenant?.primaryColor || "#6366f1"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logo & Cover Banner Section */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Store Appearance & Branding</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Uploader */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative group flex-shrink-0">
                      {tenant?.logoUrl ? (
                        <img src={tenant.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-600">No Logo</span>
                      )}
                      {isUploadingLogo && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Store Logo</h4>
                      <p className="text-[11px] text-slate-450 mt-0.5 mb-2.5">Upload a square logo for your store header</p>
                      <div className="relative cursor-pointer inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 border border-slate-250 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          Upload Logo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cover Uploader */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-32 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center relative group flex-shrink-0">
                      {tenant?.coverUrl ? (
                        <img src={tenant.coverUrl} alt="Store Cover" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-600">No Cover</span>
                      )}
                      {isUploadingCover && (
                        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Cover Banner</h4>
                      <p className="text-[11px] text-slate-450 mt-0.5 mb-2.5">Upload a landscape header image</p>
                      <div className="relative cursor-pointer inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          disabled={isUploadingCover}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 border border-slate-250 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          Upload Cover
                        </button>
                      </div>
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

      {/* Team Settings */}
      {activeTab === "team" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Invite */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Invite Team Member
            </h2>
            <div className="flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
              >
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
              <button
                onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                disabled={inviteMutation.isPending || !inviteEmail}
                className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Invite
              </button>
            </div>
          </div>

          {/* Members list */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800">
            <div className="px-6 py-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4" /> Team Members ({members.length})
              </h2>
            </div>
            {members.map((member: {
              id: string;
              role: string;
              user: { id: string; name: string; email: string };
            }) => (
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
                    <button
                      onClick={() => removeMemberMutation.mutate(member.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-500 transition-colors"
                    >
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

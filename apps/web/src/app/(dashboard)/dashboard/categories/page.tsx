"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTag,
  faPenToSquare,
  faTrashCan,
  faCircleNotch,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/api/categories").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      api.post("/api/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "تم إضافة التصنيف بنجاح" });
      setNewName("");
      setNewDescription("");
      setShowForm(false);
    },
    onError: () => toast({ title: "فشل إضافة التصنيف", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.put(`/api/categories/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "تم تحديث التصنيف" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "تم حذف التصنيف" });
    },
    onError: () => toast({ title: "فشل حذف التصنيف", variant: "destructive" }),
  });

  const categories = data?.categories ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Categories</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">
            {categories.length} categories configured
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-apple-primary text-[14px]"
        >
          <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-card space-y-3"
        >
          <h2 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">New Category</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              id="category-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name (e.g. Smartphones)"
              className="col-span-2 sm:col-span-1 apple-input text-xs"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              className="col-span-2 sm:col-span-1 apple-input text-xs"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate({ name: newName, description: newDescription })}
              disabled={createMutation.isPending || !newName.trim()}
              className="btn-apple-primary text-xs px-4 py-2"
            >
              {createMutation.isPending ? <FontAwesomeIcon icon={faCircleNotch} className="w-3 h-3 animate-spin" /> : <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />}
              <span>Create Category</span>
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-apple-pearl text-xs px-3.5 py-2"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories list */}
      <div className="apple-card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <FontAwesomeIcon icon={faCircleNotch} className="w-6 h-6 animate-spin text-[#0066cc] dark:text-[#2997ff]" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-[#86868b]">
            <FontAwesomeIcon icon={faTag} className="w-8 h-8 opacity-30" />
            <p className="text-[14px]">No categories yet</p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
            {categories.map((cat: {
              id: string;
              name: string;
              description?: string;
              _count?: { products: number };
            }, index: number) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#0066cc]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0066cc] dark:text-[#2997ff]">
                    <FontAwesomeIcon icon={faTag} className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") updateMutation.mutate({ id: cat.id, name: editName });
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="px-3 py-1 rounded-full border border-[#0066cc] bg-white dark:bg-[#272729] text-[#1d1d1f] dark:text-white text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => updateMutation.mutate({ id: cat.id, name: editName })}
                          className="btn-apple-primary text-xs px-2.5 py-1"
                        >
                          <FontAwesomeIcon icon={faCheck} className="w-2.5 h-2.5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn-apple-pearl text-xs px-2.5 py-1">
                          <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">{cat.name}</p>
                    )}
                    {cat.description && !editingId && (
                      <p className="text-xs text-[#86868b]">{cat.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold badge-apple-gray">
                    {cat._count?.products ?? 0} products
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors text-[#86868b] hover:text-[#0066cc]"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(cat.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-500/10 transition-colors text-[#86868b] hover:text-rose-600"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

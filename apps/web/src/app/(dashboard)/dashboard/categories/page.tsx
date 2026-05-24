"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Tag, Edit, Trash2, Loader2 } from "lucide-react";
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
      toast({ title: "✅ Category created!" });
      setNewName("");
      setNewDescription("");
      setShowForm(false);
    },
    onError: () => toast({ title: "Failed to create category", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.put(`/api/categories/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "✅ Category updated!" });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category deleted" });
    },
    onError: () => toast({ title: "Failed to delete category", variant: "destructive" }),
  });

  const categories = data?.categories ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {categories.length} categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors shadow-sm shadow-brand-500/25"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-200 dark:border-brand-800 p-5 space-y-3"
        >
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Category</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              id="category-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate({ name: newName, description: newDescription })}
              disabled={createMutation.isPending || !newName.trim()}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
            <Tag className="w-12 h-12 opacity-30" />
            <p className="text-sm">No categories yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
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
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
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
                          className="px-3 py-1 rounded-lg border border-brand-300 dark:border-brand-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => updateMutation.mutate({ id: cat.id, name: editName })}
                          className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                        >Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{cat.name}</p>
                    )}
                    {cat.description && !editingId && (
                      <p className="text-xs text-slate-400">{cat.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="badge badge-gray">{cat._count?.products ?? 0} products</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
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

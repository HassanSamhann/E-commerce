"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2, Plus, X, ImagePlus, Languages, Layers } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(1, "اسم المنتج بالعربية مطلوب"),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.coerce.number().min(0, "السعر يجب أن يكون موجباً"),
  comparePrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  sku: z.string().optional(),
  quantity: z.coerce.number().int().min(0).default(0),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Variant {
  id?: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Variant state
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState<Variant>({ name: "", price: 0, quantity: 0 });

  // Fetch product data
  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.get(`/api/products/${id}`).then((r) => r.data.product),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/api/categories").then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) });

  // Reset form when product data is loaded
  useEffect(() => {
    if (productData) {
      reset({
        name: productData.name,
        nameEn: productData.nameEn || "",
        description: productData.description || "",
        descriptionEn: productData.descriptionEn || "",
        price: Number(productData.price),
        comparePrice: productData.comparePrice ? Number(productData.comparePrice) : undefined,
        costPrice: productData.costPrice ? Number(productData.costPrice) : undefined,
        sku: productData.sku || "",
        quantity: productData.quantity,
        status: productData.status,
        isFeatured: productData.isFeatured,
        categoryId: productData.categoryId || "",
      });
      setTags(productData.tags || []);
      setImageUrls(productData.images?.map((img: { url: string }) => img.url) || []);
      setVariants(productData.variants || []);
    }
  }, [productData, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      api.put(`/api/products/${id}`, {
        ...data,
        tags,
        images: imageUrls.map((url) => ({ url })),
        variants: variants.length > 0 ? variants : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["store-products"] });
      toast({ title: "✅ تم تحديث المنتج بنجاح!" });
      router.push("/dashboard/products");
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "فشل تحديث المنتج";
      toast({ title: "خطأ", description: message, variant: "destructive" });
    },
  });

  const addVariant = () => {
    if (!newVariant.name.trim()) {
      toast({ title: "اسم المنتج الفرعي مطلوب", variant: "destructive" });
      return;
    }
    setVariants([...variants, { ...newVariant }]);
    setNewVariant({ name: "", price: 0, quantity: 0 });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/api/media/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.url;
      });
      const urls = await Promise.all(uploadPromises);
      setImageUrls((prev) => [...prev, ...urls]);
      toast({ title: `✅ Uploaded ${urls.length} images successfully!` });
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to upload images";
      toast({ title: "Upload Error", description: message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addImage = () => {
    if (imageUrl.trim() && !imageUrls.includes(imageUrl.trim())) {
      setImageUrls([...imageUrls, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  if (isProductLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-sm font-medium text-slate-400 mt-2">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500 rotate-180" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">تعديل المنتج</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">تحديث بيانات المنتج</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">📦 المعلومات الأساسية</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم المنتج (عربي) <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  {...register("name")}
                  placeholder="مثال: سماعات لاسلكية"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  الوصف (عربي)
                </label>
                <textarea
                  id="product-description"
                  {...register("description")}
                  rows={4}
                  placeholder="وصف مختصر للمنتج..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">الوسوم (Tags)</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-medium"
                    >
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="أضف وسماً..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  />
                  <button type="button" onClick={addTag} className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* English Translation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Languages className="w-4 h-4 text-brand-500" />
                الترجمة الإنجليزية (اختياري)
              </h2>
              <p className="text-xs text-slate-400 -mt-2">يظهر عند تصفح المتجر باللغة الإنجليزية</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Product Name (English)</label>
                <input
                  {...register("nameEn")}
                  placeholder="e.g. Wireless Headphones"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description (English)</label>
                <textarea
                  {...register("descriptionEn")}
                  rows={3}
                  placeholder="A brief description of the product..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none text-sm"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Variants Builder */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" />
                المنتجات الفرعية (مقاسات / ألوان / خيارات)
              </h2>
              <p className="text-xs text-slate-400 -mt-2">كل منتج فرعي له سعر وكمية مستقلة</p>

              {variants.length > 0 && (
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{v.name}</span>
                        <span className="text-xs text-slate-500">{v.price} ج.م</span>
                        <span className="text-xs text-slate-400">كمية: {v.quantity}</span>
                        {v.sku && <span className="text-xs text-slate-400 font-mono">{v.sku}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                        className="w-6 h-6 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3 border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">إضافة منتج فرعي</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">الاسم <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newVariant.name}
                      onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                      placeholder="مثال: مقاس L — أزرق"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">السعر (ج.م)</label>
                    <input
                      type="number" step="0.01" min="0"
                      value={newVariant.price || ""}
                      onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">الكمية</label>
                    <input
                      type="number" min="0"
                      value={newVariant.quantity || ""}
                      onChange={(e) => setNewVariant({ ...newVariant, quantity: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">كود SKU (اختياري)</label>
                    <input
                      type="text"
                      value={newVariant.sku || ""}
                      onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                      placeholder="مثال: SKU-001-L"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="w-full py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  إضافة هذا المنتج الفرعي
                </button>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Images</h2>
              
              {/* Local File Uploader */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-brand-500 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  )}
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isUploading ? "Uploading image..." : "Click or drag image to upload"}
                  </p>
                  <p className="text-xs text-slate-400">Supports PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>

              <div className="relative flex items-center justify-center my-2 text-xs uppercase text-slate-400">
                <span className="bg-white dark:bg-slate-900 px-2 z-10">Or paste URL</span>
                <div className="absolute w-full border-t border-slate-100 dark:border-slate-800" />
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
                <button type="button" onClick={addImage} className="px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Pricing</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    {...register("price")}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                  {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Compare Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("comparePrice")}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("costPrice")}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Status & Visibility */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Status</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Visibility</label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register("isFeatured")} className="w-4 h-4 rounded accent-brand-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured product</p>
                  <p className="text-xs text-slate-400">Show on storefront homepage</p>
                </div>
              </label>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Category</h2>
              <select
                {...register("categoryId")}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
              >
                <option value="">No category</option>
                {categoriesData?.categories?.map((cat: { id: string; name: string }) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Inventory */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Inventory</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">SKU</label>
                <input
                  {...register("sku")}
                  placeholder="e.g. WH-001"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Stock Quantity</label>
                <input
                  type="number"
                  {...register("quantity")}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Update button */}
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-500/25 disabled:opacity-60"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

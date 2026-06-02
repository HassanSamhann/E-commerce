"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Loader2, Plus, X, ImagePlus, Languages, Layers } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// ─── Zod Schema ───────────────────────────────────────────────────────────────
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
  name: string;
  sku?: string;
  price: number;
  quantity: number;
}

// ─── Shared input class ───────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors text-sm";
const labelCls = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewProductPage() {
  const router = useRouter();
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
      toast({ title: `✅ تم رفع ${urls.length} صور بنجاح!` });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "فشل رفع بعض أو كل الصور";
      toast({ title: "خطأ في الرفع", description: message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/api/categories").then((r) => r.data),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      api.post("/api/products", {
        ...data,
        tags,
        images: imageUrls.map((url) => ({ url })),
        variants: variants.length > 0 ? variants : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["store-products"] });
      toast({ title: "✅ تم إضافة المنتج بنجاح!" });
      router.push("/dashboard/products");
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "فشل إضافة المنتج";
      toast({ title: "خطأ", description: message, variant: "destructive" });
    },
  });

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

  const addVariant = () => {
    if (!newVariant.name.trim()) {
      toast({ title: "اسم المنتج الفرعي مطلوب", variant: "destructive" });
      return;
    }
    setVariants([...variants, { ...newVariant }]);
    setNewVariant({ name: "", price: 0, quantity: 0 });
  };

  const cardCls = "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4";

  return (
    <div className="max-w-4xl space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500 rotate-180" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إضافة منتج جديد</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">أدخل بيانات المنتج أدناه</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* ─── Basic Info ─── */}
            <div className={cardCls}>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                📦 المعلومات الأساسية
              </h2>

              {/* Arabic name */}
              <div>
                <label className={labelCls}>
                  اسم المنتج (عربي) <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  {...register("name")}
                  placeholder="مثال: سماعات لاسلكية"
                  className={inputCls}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* Arabic description */}
              <div>
                <label className={labelCls}>الوصف (عربي)</label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="وصف مختصر للمنتج..."
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>

            {/* ─── English Translation ─── */}
            <div className={cardCls}>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Languages className="w-4 h-4 text-brand-500" />
                الترجمة الإنجليزية (اختياري)
              </h2>
              <p className="text-xs text-slate-400 -mt-2">يظهر عند تصفح المتجر باللغة الإنجليزية</p>

              {/* English name */}
              <div>
                <label className={labelCls}>Product Name (English)</label>
                <input
                  {...register("nameEn")}
                  placeholder="e.g. Wireless Headphones"
                  className={inputCls}
                  dir="ltr"
                />
              </div>

              {/* English description */}
              <div>
                <label className={labelCls}>Description (English)</label>
                <textarea
                  {...register("descriptionEn")}
                  rows={3}
                  placeholder="A brief description of the product..."
                  className={inputCls + " resize-none"}
                  dir="ltr"
                />
              </div>
            </div>

            {/* ─── Product Variants ─── */}
            <div className={cardCls}>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" />
                المنتجات الفرعية (مقاسات / ألوان / خيارات)
              </h2>
              <p className="text-xs text-slate-400 -mt-2">
                مثال: مقاس S، مقاس M، أزرق، أحمر — كل منتج فرعي له سعر وكمية مستقلة
              </p>

              {/* Existing variants list */}
              {variants.length > 0 && (
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5"
                    >
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

              {/* Add variant inputs */}
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
                      type="number"
                      step="0.01"
                      min="0"
                      value={newVariant.price || ""}
                      onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">الكمية</label>
                    <input
                      type="number"
                      min="0"
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

            {/* ─── Images ─── */}
            <div className={cardCls}>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">🖼 الصور</h2>

              {/* Uploader */}
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
                    {isUploading ? "جاري رفع الصورة..." : "اضغط أو اسحب صورة للرفع"}
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG, GIF حتى 5MB</p>
                </div>
              </div>

              {/* URL input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="أو الصق رابط الصورة هنا..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  dir="ltr"
                />
                <button type="button" onClick={addImage} className="px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Preview grid */}
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

            {/* ─── Tags ─── */}
            <div className={cardCls}>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">🏷 الوسوم (Tags)</h2>
              <div className="flex gap-2 mb-2 flex-wrap">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-medium">
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

            {/* ─── Pricing ─── */}
            <div className={cardCls}>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">💰 التسعير</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>السعر <span className="text-red-500">*</span></label>
                  <input id="product-price" type="number" step="0.01" {...register("price")} placeholder="0.00" className={inputCls} />
                  {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>السعر قبل الخصم</label>
                  <input type="number" step="0.01" {...register("comparePrice")} placeholder="0.00" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>سعر التكلفة</label>
                  <input type="number" step="0.01" {...register("costPrice")} placeholder="0.00" className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Sidebar panel ─── */}
          <div className="space-y-5">
            {/* Status */}
            <div className={cardCls}>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">الحالة</h2>
              <div>
                <label className={labelCls}>الظهور</label>
                <select {...register("status")} className={inputCls}>
                  <option value="DRAFT">مسودة</option>
                  <option value="ACTIVE">نشط</option>
                  <option value="ARCHIVED">مؤرشف</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register("isFeatured")} className="w-4 h-4 rounded accent-brand-500" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">منتج مميز</p>
                  <p className="text-xs text-slate-400">يظهر في الصفحة الرئيسية للمتجر</p>
                </div>
              </label>
            </div>

            {/* Category */}
            <div className={cardCls}>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">التصنيف</h2>
              <select {...register("categoryId")} className={inputCls}>
                <option value="">بدون تصنيف</option>
                {categoriesData?.categories?.map((cat: { id: string; name: string; children?: { id: string; name: string }[] }) => (
                  <optgroup key={cat.id} label={cat.name}>
                    <option value={cat.id}>{cat.name} (الكل)</option>
                    {cat.children?.map((child) => (
                      <option key={child.id} value={child.id}>　{child.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Inventory */}
            <div className={cardCls}>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">المخزون</h2>
              <div>
                <label className={labelCls}>كود SKU</label>
                <input {...register("sku")} placeholder="مثال: WH-001" className={inputCls} dir="ltr" />
              </div>
              <div>
                <label className={labelCls}>الكمية المتوفرة</label>
                <input type="number" {...register("quantity")} placeholder="0" className={inputCls} />
              </div>
            </div>

            {/* Save */}
            <button
              id="save-product-btn"
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-500/25 disabled:opacity-60"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> حفظ المنتج
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

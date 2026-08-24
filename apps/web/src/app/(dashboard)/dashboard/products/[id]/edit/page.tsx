"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faFloppyDisk,
  faCircleNotch,
  faPlus,
  faXmark,
  faImage,
  faLanguage,
  faLayerGroup,
  faBoxArchive,
  faTag,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";
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

const inputCls = "apple-input text-sm";
const labelCls = "block text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5";

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
      toast({ title: "تم تحديث المنتج بنجاح" });
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
      toast({ title: `تم رفع ${urls.length} صور بنجاح` });
    } catch (err: any) {
      const message = err.response?.data?.error || "فشل رفع الصور";
      toast({ title: "خطأ في الرفع", description: message, variant: "destructive" });
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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 animate-spin text-[#0066cc]" />
        <p className="text-[13px] font-medium text-[#86868b]">جاري تحميل بيانات المنتج...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/products"
          className="w-9 h-9 rounded-full bg-[#f5f5f7] dark:bg-[#272729] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">تعديل المنتج</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">تحديث مواصفات وبيانات المنتج</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Info */}
            <div className="apple-card space-y-4">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faBoxArchive} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
                <span>المعلومات الأساسية</span>
              </h2>

              <div>
                <label className={labelCls}>
                  اسم المنتج (عربي) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="product-name"
                  {...register("name")}
                  placeholder="مثال: سماعات لاسلكية"
                  className={inputCls}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className={labelCls}>
                  الوصف (عربي)
                </label>
                <textarea
                  id="product-description"
                  {...register("description")}
                  rows={4}
                  placeholder="وصف مختصر ومميزات المنتج..."
                  className={inputCls + " resize-none"}
                />
              </div>

              {/* Tags */}
              <div>
                <label className={labelCls}>الوسوم (Tags)</label>
                <div className="flex gap-1.5 mb-2 flex-wrap">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-white text-xs font-medium"
                    >
                      <span>{tag}</span>
                      <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                        <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5 text-[#86868b]" />
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
                    className="flex-1 apple-input text-xs"
                  />
                  <button type="button" onClick={addTag} className="btn-apple-pearl text-xs px-3.5">
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* English Translation */}
            <div className="apple-card space-y-4">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faLanguage} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
                <span>الترجمة الإنجليزية (اختياري)</span>
              </h2>
              <p className="text-xs text-[#86868b] -mt-2">يظهر عند تصفح المتجر باللغة الإنجليزية</p>
              <div>
                <label className={labelCls}>Product Name (English)</label>
                <input
                  {...register("nameEn")}
                  placeholder="e.g. Wireless Headphones"
                  className={inputCls}
                  dir="ltr"
                />
              </div>
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

            {/* Variants Builder */}
            <div className="apple-card space-y-4">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
                <span>المنتجات الفرعية (خيارات ومقاسات وألوان)</span>
              </h2>
              <p className="text-xs text-[#86868b] -mt-2">كل منتج فرعي له سعر وكمية مستقلة</p>

              {variants.length > 0 && (
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 bg-[#f5f5f7] dark:bg-[#272729] rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="font-semibold text-[#1d1d1f] dark:text-white text-sm truncate">{v.name}</span>
                        <span className="text-xs text-[#86868b]">{v.price} ج.م</span>
                        <span className="text-xs text-[#86868b]">كمية: {v.quantity}</span>
                        {v.sku && <span className="text-xs text-[#86868b] font-mono">{v.sku}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                        className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-colors flex-shrink-0"
                      >
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-[#f5f5f7] dark:bg-[#272729] rounded-2xl p-4 space-y-3 border border-black/[0.04] dark:border-white/[0.06]">
                <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">إضافة خيار فرعي</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-white mb-1">الاسم <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={newVariant.name}
                      onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                      placeholder="مثال: مقاس L — أزرق"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-white mb-1">السعر (ج.م)</label>
                    <input
                      type="number" step="0.01" min="0"
                      value={newVariant.price || ""}
                      onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-white mb-1">الكمية</label>
                    <input
                      type="number" min="0"
                      value={newVariant.quantity || ""}
                      onChange={(e) => setNewVariant({ ...newVariant, quantity: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-white mb-1">كود SKU (اختياري)</label>
                    <input
                      type="text"
                      value={newVariant.sku || ""}
                      onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                      placeholder="مثال: SKU-001-L"
                      className={inputCls}
                      dir="ltr"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="btn-apple-pearl w-full text-xs font-semibold py-2"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  <span>إضافة الخيار الفرعي</span>
                </button>
              </div>
            </div>

            {/* Images */}
            <div className="apple-card space-y-4">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faImage} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
                <span>صور المنتج</span>
              </h2>
              
              {/* Local File Uploader */}
              <div className="border-2 border-dashed border-black/[0.08] dark:border-white/[0.12] rounded-2xl p-6 text-center hover:border-[#0066cc] transition-colors relative cursor-pointer group bg-[#fafafc] dark:bg-[#272729]/50">
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
                    <FontAwesomeIcon icon={faCircleNotch} className="w-7 h-7 animate-spin text-[#0066cc]" />
                  ) : (
                    <FontAwesomeIcon icon={faImage} className="w-7 h-7 text-[#86868b] group-hover:text-[#0066cc] transition-colors" />
                  )}
                  <p className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                    {isUploading ? "جاري رفع الصور..." : "اضغط أو اسحب الصور للرفع"}
                  </p>
                  <p className="text-xs text-[#86868b]">PNG, WebP, JPG حتى 5MB</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="أو الصق رابط صورة..."
                  className="flex-1 apple-input text-xs"
                  dir="ltr"
                />
                <button type="button" onClick={addImage} className="btn-apple-primary px-4 text-xs">
                  <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
                </button>
              </div>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden aspect-square bg-[#f5f5f7] dark:bg-[#272729] group border border-black/[0.04] dark:border-white/[0.06]">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="apple-card space-y-4">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faCoins} className="w-4 h-4 text-[#0066cc] dark:text-[#2997ff]" />
                <span>التسعير</span>
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>
                    السعر <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    {...register("price")}
                    placeholder="0.00"
                    className={inputCls}
                  />
                  {errors.price && <p className="mt-1 text-xs text-rose-500">{errors.price.message}</p>}
                </div>
                <div>
                  <label className={labelCls}>السعر قبل الخصم</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("comparePrice")}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>سعر التكلفة</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("costPrice")}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Status & Visibility */}
            <div className="apple-card space-y-4">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white">الحالة</h2>
              <div>
                <label className={labelCls}>الظهور</label>
                <select
                  {...register("status")}
                  className={inputCls}
                >
                  <option value="DRAFT">مسودة</option>
                  <option value="ACTIVE">نشط ومعروض</option>
                  <option value="ARCHIVED">مؤرشف</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl bg-[#f5f5f7] dark:bg-[#272729]">
                <input type="checkbox" {...register("isFeatured")} className="w-4 h-4 rounded accent-[#0066cc]" />
                <div>
                  <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white">منتج مميز</p>
                  <p className="text-[11px] text-[#86868b]">يظهر في الصفحة الرئيسية للمتجر</p>
                </div>
              </label>
            </div>

            {/* Category */}
            <div className="apple-card space-y-3">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white">التصنيف</h2>
              <select
                {...register("categoryId")}
                className={inputCls}
              >
                <option value="">بدون تصنيف</option>
                {categoriesData?.categories?.map((cat: { id: string; name: string }) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Inventory */}
            <div className="apple-card space-y-3">
              <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-white">المخزون</h2>
              <div>
                <label className={labelCls}>كود SKU</label>
                <input
                  {...register("sku")}
                  placeholder="مثال: WH-001"
                  className={inputCls}
                  dir="ltr"
                />
              </div>
              <div>
                <label className={labelCls}>الكمية المتوفرة</label>
                <input
                  type="number"
                  {...register("quantity")}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Update button */}
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn-apple-primary w-full py-3 text-[15px] font-semibold"
            >
              {updateMutation.isPending ? (
                <FontAwesomeIcon icon={faCircleNotch} className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faFloppyDisk} className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// Theme Registry — All storefront themes are defined here
// ============================================================

export type ThemeId = "classic" | "luxury" | "nature";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  gradient: string; // Tailwind gradient for thumbnail in settings
  previewColors: string[]; // 3 hex swatches for preview dots
  fontFamily: string; // Google Font name
  fontUrl: string; // Google Fonts URL
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  classic: {
    id: "classic",
    name: "Classic",
    nameAr: "كلاسيك",
    description: "Clean modern design with a neutral palette. Perfect for any product category.",
    descriptionAr: "تصميم عصري أنيق بألوان محايدة. مناسب لجميع أنواع المتاجر.",
    gradient: "from-indigo-500 via-purple-500 to-blue-600",
    previewColors: ["#6366f1", "#f1f5f9", "#1e293b"],
    fontFamily: "Inter",
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    nameAr: "فاخر",
    description: "Dark, dramatic, gold-accented. Ideal for premium, high-end, or perfume stores.",
    descriptionAr: "تصميم داكن فاخر بلمسات ذهبية. مثالي للمتاجر الراقية والعطور الفاخرة.",
    gradient: "from-yellow-600 via-amber-500 to-yellow-900",
    previewColors: ["#d4af37", "#0a0a0a", "#ffffff"],
    fontFamily: "Playfair Display",
    fontUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;500;600;700&display=swap",
  },
  nature: {
    id: "nature",
    name: "Nature",
    nameAr: "طبيعي",
    description: "Earthy, botanical feel with warm greens and creams. Great for cosmetics and wellness.",
    descriptionAr: "إحساس طبيعي دافئ بألوان خضراء وكريمية. رائع للمستحضرات والعناية الطبيعية.",
    gradient: "from-green-600 via-emerald-500 to-teal-600",
    previewColors: ["#2d7a4f", "#f5f0e8", "#4a3728"],
    fontFamily: "DM Sans",
    fontUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Playfair+Display:wght@400;500;600;700&display=swap",
  },
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(id?: string | null): ThemeConfig {
  return THEMES[(id as ThemeId) || "classic"] ?? THEMES.classic;
}

"use client";

import React from "react";
import { useLanguage } from "@/contexts/language.context";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
      title={language === "ar" ? "Switch to English" : "تغيير إلى العربية"}
    >
      <Globe className="w-3.5 h-3.5 text-slate-450" />
      <span>{language === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}

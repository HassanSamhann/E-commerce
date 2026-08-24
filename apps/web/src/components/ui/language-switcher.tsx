"use client";

import React from "react";
import { useLanguage } from "@/contexts/language.context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-[#f5f5f7]/60 dark:bg-[#272729]/60 hover:bg-[#f5f5f7] dark:hover:bg-[#272729] text-xs font-medium text-[#1d1d1f] dark:text-[#f5f5f7] transition-all duration-150 active:scale-95 shadow-none"
      title={language === "ar" ? "Switch to English" : "تغيير إلى العربية"}
    >
      <FontAwesomeIcon icon={faGlobe} className="w-3.5 h-3.5 text-[#86868b] dark:text-[#a1a1a6]" />
      <span>{language === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}

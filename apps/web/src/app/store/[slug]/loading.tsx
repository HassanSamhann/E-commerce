import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faStore } from "@fortawesome/free-solid-svg-icons";

export default function StorefrontLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-3 p-8 rounded-[24px] apple-card max-w-xs w-full text-center">
        <div className="w-12 h-12 rounded-full bg-[#0066cc]/10 dark:bg-[#2997ff]/15 text-[#0066cc] dark:text-[#2997ff] flex items-center justify-center">
          <FontAwesomeIcon icon={faStore} className="w-5 h-5" />
        </div>
        
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold text-[#1d1d1f] dark:text-white">جاري التحميل...</h3>
          <p className="text-[11px] text-[#86868b]">نعمل على تجهيز الكتالوج</p>
        </div>
        
        <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full badge-apple-gray text-[11px] font-medium mt-1">
          <FontAwesomeIcon icon={faCircleNotch} className="w-3 h-3 animate-spin text-[#0066cc]" />
          <span>يرجى الانتظار</span>
        </div>
      </div>
    </div>
  );
}

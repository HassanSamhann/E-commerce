import React from "react";
import { Loader2, Store } from "lucide-react";

export default function StorefrontLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
      {/* Top glowing progress bar simulation */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 z-50 animate-pulse" />
      
      <div className="flex flex-col items-center gap-4 p-8 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-none max-w-xs w-full text-center transition-all duration-300">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 animate-pulse">
          <Store className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-850 dark:text-white">جاري تحميل الصفحة...</h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">نعمل على تحضير تجربة تسوق رائعة لك</p>
        </div>
        
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-650 dark:text-slate-400 shadow-sm mt-1">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          <span>يرجى الانتظار قليلاً</span>
        </div>
      </div>
    </div>
  );
}

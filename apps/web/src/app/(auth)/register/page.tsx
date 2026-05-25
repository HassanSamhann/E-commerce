"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Lock, Mail, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        {/* Icon */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center shadow-2xl">
              <ShoppingBag className="w-9 h-9 text-slate-400" />
            </div>
            {/* Lock badge */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-slate-900">
              <Lock className="w-4 h-4 text-slate-900" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">منصة متاجر خاصة</h1>
          <p className="text-slate-500 text-sm mt-1.5">StoreFlow Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Status badge */}
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 text-amber-400 text-xs font-black border border-amber-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              التسجيل مغلق حالياً
            </span>
          </div>

          {/* Message */}
          <div className="text-center space-y-3">
            <h2 className="text-lg font-black text-white">
              🔒 هذه المنصة خاصة
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              التسجيل في المنصة متاح فقط من خلال المدير العام.
              إذا كنت تريد إنشاء متجرك، يرجى التواصل مع الإدارة مباشرةً.
            </p>
          </div>

          {/* Contact info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">تواصل مع المدير على</p>
              <p className="text-sm font-black text-white mt-0.5">hassan700019@gmail.com</p>
            </div>
          </div>

          {/* Back to login */}
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02]"
          >
            <span>تسجيل الدخول</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-6">
          StoreFlow © {new Date().getFullYear()} — منصة متاجر إلكترونية احترافية
        </p>
      </motion.div>
    </div>
  );
}

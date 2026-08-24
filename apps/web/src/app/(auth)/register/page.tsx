"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faLock,
  faEnvelope,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0066cc]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header Icon */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative mb-3">
            <div className="w-14 h-14 rounded-full bg-[#1d1d1f] border border-white/[0.12] flex items-center justify-center shadow-lg text-[#86868b]">
              <FontAwesomeIcon icon={faBagShopping} className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-black text-xs font-bold border-2 border-black">
              <FontAwesomeIcon icon={faLock} className="w-3 h-3" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">منصة متاجر خاصة</h1>
          <p className="text-xs text-[#86868b] mt-0.5">StoreFlow Private Enterprise</p>
        </div>

        {/* Card */}
        <div className="bg-[#1d1d1f] border border-white/[0.1] rounded-[24px] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-center">
            <span className="badge-apple-amber px-3 py-1 rounded-full text-xs font-semibold">
              التسجيل مغلق للعامة
            </span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-sm font-semibold text-white">
              الانضمام للمنصة بدعوة فقط
            </h2>
            <p className="text-xs text-[#86868b] leading-relaxed">
              يتم إنشاء المتاجر وتفعيل الحسابات مركزياً من خلال الإدارة العامة.
            </p>
          </div>

          {/* Contact box */}
          <div className="bg-black/[0.4] border border-white/[0.08] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0066cc]/20 flex items-center justify-center text-[#2997ff] flex-shrink-0">
              <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#86868b]">البريد الإلكتروني للإدارة</p>
              <p className="text-xs font-semibold text-white truncate font-mono">hassan700019@gmail.com</p>
            </div>
          </div>

          {/* Return button */}
          <Link
            href="/login"
            className="btn-apple-primary w-full py-2.5 text-xs justify-center"
          >
            <span>تسجيل الدخول</span>
            <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
          </Link>
        </div>

        <p className="text-center text-[11px] text-[#86868b] mt-5">
          StoreFlow © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </p>
      </motion.div>
    </div>
  );
}

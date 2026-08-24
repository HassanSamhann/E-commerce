"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBagShopping,
  faCircleNotch,
  faArrowRight,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/contexts/auth.context";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "فشل تسجيل الدخول";
      toast({ title: "خطأ في تسجيل الدخول", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0066cc]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0066cc] mb-3 shadow-md">
            <FontAwesomeIcon icon={faBagShopping} className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">StoreFlow</h1>
          <p className="text-xs text-[#86868b] mt-1">Sign in to your merchant dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[#1d1d1f] border border-white/[0.1] rounded-[24px] p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#f5f5f7] mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="merchant@storeflow.com"
                {...register("email")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.4] border border-white/[0.12] text-white text-xs placeholder:text-[#86868b] focus:outline-none focus:border-[#0066cc] transition-colors"
                dir="ltr"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#f5f5f7] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-black/[0.4] border border-white/[0.12] text-white text-xs placeholder:text-[#86868b] focus:outline-none focus:border-[#0066cc] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-3.5 h-3.5" />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              className="btn-apple-primary w-full py-3 text-xs justify-center shadow-none disabled:opacity-60"
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faCircleNotch} className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#86868b]">
            Private Platform — Access restricted to authorized merchants.
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
          <p className="text-[11px] text-[#86868b]">
            Admin Demo: <span className="text-white font-mono">hassan700019@gmail.com</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

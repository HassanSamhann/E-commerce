"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const PLAN_ICONS: Record<string, typeof Zap> = {
  starter: Zap,
  professional: Crown,
  enterprise: Crown,
};

const PLAN_COLORS: Record<string, string> = {
  starter: "from-slate-500 to-slate-700",
  professional: "from-brand-500 to-purple-600",
  enterprise: "from-amber-500 to-orange-600",
};

export default function SubscriptionPage() {
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => api.get("/api/subscription").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const { subscription, plans, usage } = data || {};
  const currentPlanId = subscription?.planId;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your plan and billing</p>
      </div>

      {/* Current plan status */}
      {subscription && (
        <div className="bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-100 text-sm font-medium">Current Plan</p>
              <h2 className="text-2xl font-bold mt-1">{subscription.plan?.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`badge ${
                    subscription.status === "ACTIVE" || subscription.status === "TRIALING"
                      ? "bg-white/20 text-white"
                      : "bg-red-500/20 text-red-200"
                  }`}
                >
                  {subscription.status === "TRIALING" ? "🎉 Free Trial" : subscription.status}
                </span>
                {subscription.trialEnd && subscription.status === "TRIALING" && (
                  <span className="text-sm text-brand-100">
                    Trial ends: {new Date(subscription.trialEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">${subscription.plan?.price}</p>
              <p className="text-brand-200 text-sm">per month</p>
            </div>
          </div>

          {/* Usage bars */}
          {usage && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { label: "Products", used: usage.products, max: subscription.plan?.maxProducts },
                { label: "Members", used: usage.members, max: subscription.plan?.maxMembers },
                { label: "Orders", used: usage.orders, max: subscription.plan?.maxOrders },
              ].map((item) => {
                const pct = item.max >= 999999 ? 0 : Math.min(100, (item.used / item.max) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-brand-100 mb-1">
                      <span>{item.label}</span>
                      <span>
                        {item.used} / {item.max >= 999999 ? "∞" : item.max}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans?.map((plan: {
            id: string;
            name: string;
            slug: string;
            price: number;
            description?: string;
            maxProducts: number;
            maxMembers: number;
            maxOrders: number;
            hasAnalytics: boolean;
            hasCustomDomain: boolean;
          }, index: number) => {
            const isCurrentPlan = plan.id === currentPlanId;
            const Icon = PLAN_ICONS[plan.slug] || Zap;
            const gradient = PLAN_COLORS[plan.slug] || "from-slate-500 to-slate-700";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl border-2 p-6 ${
                  isCurrentPlan
                    ? "border-brand-500 dark:border-brand-400"
                    : "border-slate-100 dark:border-slate-800"
                } bg-white dark:bg-slate-900`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{plan.description}</p>

                <div className="mt-4 mb-6">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">${plan.price}</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {[
                    `${plan.maxProducts >= 999999 ? "Unlimited" : plan.maxProducts} products`,
                    `${plan.maxMembers >= 999999 ? "Unlimited" : plan.maxMembers} team members`,
                    `${plan.maxOrders >= 999999 ? "Unlimited" : plan.maxOrders} orders/month`,
                    plan.hasAnalytics && "Advanced analytics",
                    plan.hasCustomDomain && "Custom domain",
                    "24/7 support",
                  ]
                    .filter(Boolean)
                    .map((feature) => (
                      <li key={String(feature)} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                </ul>

                <button
                  disabled={isCurrentPlan}
                  onClick={() =>
                    toast({ title: "Stripe integration needed", description: "Add your Stripe keys to enable payments." })
                  }
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isCurrentPlan
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : `bg-gradient-to-r ${gradient} text-white hover:opacity-90 shadow-sm`
                  }`}
                >
                  {isCurrentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

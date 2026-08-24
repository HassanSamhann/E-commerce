"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faBolt,
  faCrown,
  faCircleNotch,
  faCreditCard,
  faSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const PLAN_ICONS: Record<string, any> = {
  starter: faBolt,
  professional: faCrown,
  enterprise: faSparkles,
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
        <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 animate-spin text-[#0066cc]" />
      </div>
    );
  }

  const { subscription, plans, usage } = data || {};
  const currentPlanId = subscription?.planId;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Subscription</h1>
        <p className="text-[13px] text-[#86868b] mt-0.5">Manage your platform plan, quotas, and billing</p>
      </div>

      {/* Current plan status */}
      {subscription && (
        <div className="bg-[#1d1d1f] dark:bg-[#272729] rounded-[22px] p-6 sm:p-8 text-white border border-black/[0.08] dark:border-white/[0.12]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[#86868b] text-xs font-semibold uppercase tracking-wider">Active Subscription</p>
              <h2 className="text-2xl sm:text-3xl font-semibold mt-1 tracking-tight">{subscription.plan?.name} Plan</h2>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    subscription.status === "ACTIVE" || subscription.status === "TRIALING"
                      ? "badge-apple-green"
                      : "badge-apple-red"
                  }`}
                >
                  {subscription.status === "TRIALING" ? "Free Trial Active" : subscription.status}
                </span>
                {subscription.trialEnd && subscription.status === "TRIALING" && (
                  <span className="text-xs text-[#86868b]">
                    Trial concludes: {new Date(subscription.trialEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-3xl sm:text-4xl font-semibold tracking-tight">${subscription.plan?.price}</p>
              <p className="text-[#86868b] text-xs mt-0.5">billed monthly</p>
            </div>
          </div>

          {/* Usage bars */}
          {usage && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              {[
                { label: "Products Catalogued", used: usage.products, max: subscription.plan?.maxProducts },
                { label: "Team Seats", used: usage.members, max: subscription.plan?.maxMembers },
                { label: "Monthly Orders", used: usage.orders, max: subscription.plan?.maxOrders },
              ].map((item) => {
                const pct = item.max >= 999999 ? 0 : Math.min(100, (item.used / item.max) * 100);
                return (
                  <div key={item.label} className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/[0.06]">
                    <div className="flex justify-between text-xs text-[#86868b] mb-1.5 font-medium">
                      <span>{item.label}</span>
                      <span className="text-white font-semibold">
                        {item.used} / {item.max >= 999999 ? "∞" : item.max}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0066cc] dark:bg-[#2997ff] rounded-full transition-all duration-500"
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
        <h2 className="text-lg font-semibold text-[#1d1d1f] dark:text-white mb-4 tracking-tight">Available Subscription Tiers</h2>
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
            const icon = PLAN_ICONS[plan.slug] || faBolt;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative rounded-[20px] p-6 apple-card flex flex-col justify-between ${
                  isCurrentPlan
                    ? "border-[#0066cc] dark:border-[#2997ff]"
                    : "border-black/[0.06] dark:border-white/[0.08]"
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 rounded-full bg-[#0066cc] text-white text-[11px] font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <div>
                  <div className="w-10 h-10 rounded-full bg-[#0066cc]/10 dark:bg-[#2997ff]/15 flex items-center justify-center mb-4 text-[#0066cc] dark:text-[#2997ff]">
                    <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                  </div>

                  <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white tracking-tight">{plan.name}</h3>
                  <p className="text-[#86868b] text-xs mt-1 leading-relaxed">{plan.description}</p>

                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">${plan.price}</span>
                    <span className="text-[#86868b] text-xs font-normal"> / month</span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {[
                      `${plan.maxProducts >= 999999 ? "Unlimited" : plan.maxProducts} products`,
                      `${plan.maxMembers >= 999999 ? "Unlimited" : plan.maxMembers} team seats`,
                      `${plan.maxOrders >= 999999 ? "Unlimited" : plan.maxOrders} monthly orders`,
                      plan.hasAnalytics && "Advanced analytics",
                      plan.hasCustomDomain && "Custom domain support",
                      "24/7 priority support",
                    ]
                      .filter(Boolean)
                      .map((feature) => (
                        <li key={String(feature)} className="flex items-center gap-2 text-xs text-[#1d1d1f] dark:text-[#f5f5f7]">
                          <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#0066cc] dark:text-[#2997ff] flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <button
                  disabled={isCurrentPlan}
                  onClick={() =>
                    toast({ title: "بوابة الدفع", description: "سيتم تفعيل الدفع الإلكتروني قريباً." })
                  }
                  className={`w-full py-2.5 rounded-full font-semibold text-xs transition-all ${
                    isCurrentPlan
                      ? "btn-apple-pearl opacity-60 cursor-default"
                      : "btn-apple-primary"
                  }`}
                >
                  {isCurrentPlan ? "Active Plan" : `Select ${plan.name}`}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

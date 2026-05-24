import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EGP"): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-yellow",
  CONFIRMED: "badge-blue",
  PROCESSING: "badge-blue",
  SHIPPED: "badge-blue",
  DELIVERED: "badge-green",
  CANCELED: "badge-red",
  REFUNDED: "badge-gray",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELED: "Canceled",
  REFUNDED: "Refunded",
};

export const PRODUCT_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "badge-green",
  DRAFT: "badge-gray",
  ARCHIVED: "badge-red",
};

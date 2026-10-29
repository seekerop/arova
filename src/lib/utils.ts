import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTimeRemaining(deadlineString: string | null | undefined): {
  isExpired: boolean;
  text: string;
  hours: number;
} {
  if (!deadlineString) return { isExpired: true, text: "No deadline", hours: 0 };
  const deadline = new Date(deadlineString).getTime();
  const now = Date.now();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return { isExpired: true, text: "Expired", hours: 0 };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return { isExpired: false, text: `${days}d ${remHours}h remaining`, hours };
  }

  return { isExpired: false, text: `${hours}h ${minutes}m remaining`, hours };
}

export function formatTimeRemainingText(deadlineString: string | null | undefined): string {
  return formatTimeRemaining(deadlineString).text;
}



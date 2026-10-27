import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskApaarId(id: string | null | undefined): string {
  if (!id) return "N/A";
  if (id.length <= 4) return "****";
  return "****-****-" + id.slice(-4);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    VERIFIED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
    COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    SUCCESS: "bg-emerald-100 text-emerald-800 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    PENDING_VERIFICATION: "bg-amber-100 text-amber-800 border-amber-200",
    IN_REVIEW: "bg-blue-100 text-blue-800 border-blue-200",
    VALIDATING: "bg-blue-100 text-blue-800 border-blue-200",
    IMPORTING: "bg-blue-100 text-blue-800 border-blue-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
    SUSPENDED: "bg-red-100 text-red-800 border-red-200",
    CONFLICT: "bg-red-100 text-red-800 border-red-200",
    NEEDS_CORRECTION: "bg-orange-100 text-orange-800 border-orange-200",
    NOT_SUBMITTED: "bg-gray-100 text-gray-600 border-gray-200",
    INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
    GRADUATED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    DROPPED: "bg-gray-200 text-gray-700 border-gray-300",
    TRANSFERRED: "bg-purple-100 text-purple-800 border-purple-200",
    DISMISSED: "bg-gray-100 text-gray-600 border-gray-200",
    CONFIRMED: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-600 border-gray-200";
}

export function getStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return { data, total, totalPages, page, pageSize };
}

export function generateInternalId(prefix: string = "STU"): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

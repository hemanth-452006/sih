import { cn, getStatusColor, getStatusLabel } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        getStatusColor(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

interface GenericBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "destructive" | "success";
  className?: string;
}

const badgeVariants: Record<string, string> = {
  default: "bg-blue-100 text-blue-800 border-blue-200",
  secondary: "bg-gray-100 text-gray-800 border-gray-200",
  outline: "bg-white text-gray-700 border-gray-300",
  destructive: "bg-red-100 text-red-800 border-red-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function Badge({ children, variant = "default", className }: GenericBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

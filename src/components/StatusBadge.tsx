import clsx from "clsx";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

const variants: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-gray-50 text-gray-600 border-gray-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
};

interface Props {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

export default function StatusBadge({ children, variant = "neutral", dot = false }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant]
      )}
    >
      {dot && (
        <span className={clsx(
          "w-1.5 h-1.5 rounded-full",
          variant === "success" && "bg-green-500",
          variant === "warning" && "bg-amber-500",
          variant === "danger" && "bg-red-500",
          variant === "info" && "bg-blue-500",
          variant === "neutral" && "bg-gray-400",
          variant === "purple" && "bg-purple-500"
        )} />
      )}
      {children}
    </span>
  );
}

export function getJobStatusVariant(status: string) {
  const map: Record<string, BadgeVariant> = {
    COMPLETED: "success",
    PAID: "success",
    AUTHORIZED: "success",
    PRINTING: "info",
    QUEUED: "info",
    CREATED: "neutral",
    FILE_UPLOADED: "neutral",
    PRICE_CALCULATED: "neutral",
    AWAITING_PAYMENT: "warning",
    PAYMENT_PROCESSING: "warning",
    PRINT_FAILED: "danger",
    PRINTER_OFFLINE: "danger",
    PRINTER_ERROR: "danger",
    CANCELLED: "neutral",
    REFUND_PENDING: "purple",
    REFUNDED: "purple",
    FAILED: "danger",
    PENDING: "warning",
    SUCCESS: "success",
  };
  return map[status] || "neutral";
}

export function getPaperStatusVariant(status: string) {
  const map: Record<string, BadgeVariant> = {
    OK: "success",
    LOW: "warning",
    EMPTY: "danger",
    UNKNOWN: "neutral",
  };
  return map[status] || "neutral";
}

export function getTonerStatusVariant(status: string) {
  return getPaperStatusVariant(status);
}

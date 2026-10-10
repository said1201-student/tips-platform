import { STATUS_LABELS } from "@/lib/format";

const STYLES = {
  pending: "bg-amber-100 text-amber-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-700",
  void: "bg-gray-100 text-gray-600",
};

const DOTS = {
  pending: "bg-status-pending",
  won: "bg-status-won",
  lost: "bg-status-lost",
  void: "bg-status-void",
};

export default function StatusBadge({ status, className = "" }) {
  const key = (status || "pending").toLowerCase();
  const label = STATUS_LABELS[key] || key;
  return (
    <span className={`chip ${STYLES[key] || STYLES.pending} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[key] || DOTS.pending}`} />
      {label}
    </span>
  );
}

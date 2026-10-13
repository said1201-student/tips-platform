const STYLES = {
  pending_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};

const LABELS = {
  pending_review: "Pending approval",
  approved: "Live",
  rejected: "Rejected",
};

export default function ReviewBadge({ reviewStatus, className = "" }) {
  const key = reviewStatus || "pending_review";
  return (
    <span className={`chip ${STYLES[key] || STYLES.pending_review} ${className}`}>
      {LABELS[key] || key}
    </span>
  );
}
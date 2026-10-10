export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatOdds(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
}

export function formatNumber(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("en-GB");
}

export const STATUS_LABELS = {
  pending: "Pending",
  won: "Won",
  lost: "Lost",
  void: "Void",
};

export default function StatCard({ label, value, hint, accent = false }) {
  return (
    <div className="card p-5">
      <p className={`font-heading text-3xl font-bold ${accent ? "text-accent-dark" : "text-navy"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
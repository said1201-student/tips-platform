export function EmptyState({ title = "Nothing here yet", message, icon = "📭" }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-3 font-heading text-xl font-bold text-navy">
        {title}
      </h3>
      {message && <p className="mt-1 max-w-md text-sm text-muted">{message}</p>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="text-4xl">⚠️</div>
      <h3 className="mt-3 font-heading text-xl font-bold text-navy">
        {title}
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted">
        {message || "Please try again later."}
      </p>
    </div>
  );
}

export function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-navy" />
      {label}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse p-4">
      <div className="h-5 w-2/3 rounded bg-line" />
      <div className="mt-3 h-3 w-1/2 rounded bg-line" />
      <div className="mt-6 flex justify-between">
        <div className="h-8 w-20 rounded bg-line" />
        <div className="h-8 w-24 rounded bg-line" />
      </div>
      <div className="mt-6 h-9 w-full rounded bg-line" />
    </div>
  );
}

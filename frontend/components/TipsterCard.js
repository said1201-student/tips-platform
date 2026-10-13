import Link from "next/link";

export default function TipsterCard({ tipster, showRank = false }) {
  return (
    <Link
      href={`/tipsters/${tipster.username}`}
      className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-card-hover"
    >
      {showRank && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy font-heading text-base font-bold text-white">
          {tipster.rank}
        </span>
      )}
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-50 font-heading text-lg font-bold text-navy">
        {tipster.full_name?.charAt(0) || "T"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-base font-bold text-navy">
          {tipster.full_name}
        </p>
        <p className="truncate text-xs text-muted">
          @{tipster.username} · {tipster.total_tips} tips
        </p>
      </div>
      <div className="text-right">
        {tipster.total_tips > 0 ? (
          <>
            <p className="font-heading text-xl font-bold leading-none text-accent-dark">
              {tipster.win_rate}%
            </p>
            <p className="text-[11px] font-semibold text-muted">Win rate</p>
          </>
        ) : (
          <>
            <p className="font-heading text-xl font-bold leading-none text-accent">New</p>
            <p className="text-[11px] font-semibold text-muted">Just joined</p>
          </>
        )}
      </div>
    </Link>
  );
}

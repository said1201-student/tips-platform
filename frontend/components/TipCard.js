import Link from "next/link";
import StatusBadge from "./StatusBadge";
import CopyButton from "./CopyButton";
import { formatDate, formatOdds, formatNumber } from "@/lib/format";

export default function TipCard({ tip }) {
  return (
    <article className="card flex flex-col p-4 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/tips/${tip.id}`}
          className="font-heading text-lg font-bold leading-tight text-navy hover:text-accent-dark"
        >
          {tip.title}
        </Link>
        <StatusBadge status={tip.status} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <Link
          href={`/tipsters/${tip.tipster_username}`}
          className="font-semibold text-navy hover:text-accent-dark"
        >
          {tip.tipster_name}
        </Link>
        <span className="text-line">•</span>
        <span className="font-semibold">
          {tip.company_name}
        </span>
        <span className="text-line">•</span>
        <span>{formatDate(tip.created_at)}</span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold text-muted">
            Total odds
          </p>
          <p className="font-heading text-3xl font-bold leading-none text-navy">
            {formatOdds(tip.total_odds)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-bold text-muted">
            Slip code
          </p>
          <span className="slip-code mt-1">{tip.slip_code}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span>👁 {formatNumber(tip.views)} views</span>
        <span>📋 {formatNumber(tip.copy_count)} copies</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`/tips/${tip.id}`} className="btn btn-outline">
          View tip
        </Link>
        <CopyButton code={tip.slip_code} tipId={tip.id} label="Copy" />
      </div>
    </article>
  );
}

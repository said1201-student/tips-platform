import Link from "next/link";
import { serverGet } from "@/lib/serverApi";
import SectionHeading from "@/components/SectionHeading";
import { EmptyState, ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Top Tipsters | Leaderboard",
  description: "See which tipsters perform best based on won tips and win rate.",
};

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function LeaderboardPage() {
  const res = await serverGet("/tipsters");
  const tipsters = res.data?.tipsters || [];

  if (!res.ok) {
    return (
      <div className="container-page py-10">
        <ErrorState title="Unable to load tipsters" message="Please try again shortly." />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <SectionHeading title="Top Tipsters" />

      {tipsters.length === 0 ? (
        <EmptyState title="No tipsters yet" message="Tipster rankings will appear here." icon="🏆" />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[64px_1fr_repeat(3,110px)_110px] gap-4 border-b border-line bg-surface px-5 py-3 text-[11px] font-bold text-muted sm:grid">
            <span>Rank</span>
            <span>Tipster</span>
            <span className="text-center">Total</span>
            <span className="text-center">Won</span>
            <span className="text-center">Lost</span>
            <span className="text-right">Win rate</span>
          </div>

          {tipsters.map((t) => (
            <Link
              key={t.id}
              href={`/tipsters/${t.username}`}
              className="grid grid-cols-[48px_1fr_110px] items-center gap-2 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-navy-50 sm:grid-cols-[64px_1fr_repeat(3,110px)_110px] sm:gap-4"
            >
              <span className="flex items-center gap-2 font-heading text-lg font-bold text-navy">
                <span>{MEDALS[t.rank] || t.rank}</span>
              </span>

              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-50 font-heading font-bold text-navy">
                  {t.full_name?.charAt(0) || "T"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-heading text-base font-bold text-navy">
                    {t.full_name}
                  </span>
                  <span className="block truncate text-xs text-muted">@{t.username}</span>
                </span>
              </span>

              <span className="ml-auto text-center text-sm font-bold text-navy sm:ml-0">
                {t.total_tips}
              </span>
              <span className="hidden text-center text-sm font-bold text-status-won sm:block">
                {t.won}
              </span>
              <span className="hidden text-center text-sm font-bold text-status-lost sm:block">
                {t.lost}
              </span>
              <span className="text-right font-heading text-xl font-bold text-accent-dark">
                {t.win_rate}%
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
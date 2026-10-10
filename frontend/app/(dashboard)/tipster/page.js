"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";
import { Spinner, ErrorState, EmptyState } from "@/components/States";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatOdds, formatNumber } from "@/lib/format";

const QUICK_ACTIONS = [
  { href: "/tipster/tips/create", label: "Create Tip", icon: "＋" },
  { href: "/tipster/tips", label: "My Tips", icon: "📋" },
  { href: "/tipster/profile", label: "Edit Profile", icon: "👤" },
  { href: "/tipster/settings", label: "Settings", icon: "⚙️" },
];

export default function TipsterDashboardPage() {
  const [stats, setStats] = useState(null);
  const [tips, setTips] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/tips/stats/me"), api.get("/tips/mine")])
      .then(([statsRes, tipsRes]) => {
        setStats(statsRes.stats);
        setTips(tipsRes.tips);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return <ErrorState title="Unable to load dashboard" />;
  }
  if (!stats || !tips) {
    return <Spinner label="Loading dashboard..." />;
  }

  const recent = tips.slice(0, 5);
  const best = [...tips].sort(
    (a, b) =>
      Number(b.copy_count) * 2 + Number(b.views) - (Number(a.copy_count) * 2 + Number(a.views))
  )[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">An overview of your betting tips.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total tips" value={stats.total_tips} />
        <StatCard label="Won" value={stats.won} />
        <StatCard label="Lost" value={stats.lost} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Win rate" value={`${stats.win_rate}%`} accent />
        <StatCard label="Total views" value={formatNumber(stats.total_views)} />
        <StatCard label="Total copies" value={formatNumber(stats.total_copies)} />
      </div>

      {/* QUICK ACTIONS */}
      <section>
        <h2 className="section-title !text-xl">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href} className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-card-hover">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy text-lg text-white">
                {action.icon}
              </span>
              <span className="text-sm font-bold text-navy">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST PERFORMING */}
      {best && (
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-muted">
                Best performing tip
              </p>
              <Link href={`/tips/${best.id}`} className="font-heading text-xl font-bold text-navy hover:text-accent-dark">
                {best.title}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {formatNumber(best.views)} views · {formatNumber(best.copy_count)} copies ·{" "}
                {formatOdds(best.total_odds)} odds
              </p>
            </div>
            <StatusBadge status={best.status} />
          </div>
        </section>
      )}

      {/* RECENT TIPS */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="section-title !text-xl">Recent Tips</h2>
          <Link href="/tipster/tips" className="text-sm font-bold text-accent-dark hover:text-navy">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="You haven't created any tips yet"
            message="Create your first tip to get started."
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="hidden grid-cols-[1fr_140px_90px_120px_100px] gap-4 border-b border-line bg-surface px-5 py-3 text-[11px] font-bold text-muted md:grid">
              <span>Tip</span>
              <span>Slip code</span>
              <span className="text-center">Odds</span>
              <span className="text-center">Status</span>
              <span className="text-right">Date</span>
            </div>
            {recent.map((tip) => (
              <div key={tip.id} className="grid gap-2 border-b border-line px-5 py-3 last:border-0 md:grid-cols-[1fr_140px_90px_120px_100px] md:items-center md:gap-4 md:text-sm">
                <Link href={`/tips/${tip.id}`} className="font-semibold text-navy hover:text-accent-dark">
                  {tip.title}
                </Link>
                <span className="slip-code !px-2 !py-0.5 !text-xs">{tip.slip_code}</span>
                <span className="text-sm font-bold text-navy md:text-center">{formatOdds(tip.total_odds)}</span>
                <span className="md:justify-self-center">
                  <StatusBadge status={tip.status} />
                </span>
                <span className="text-xs text-muted md:text-right">{formatDate(tip.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";
import { Spinner, ErrorState } from "@/components/States";
import { formatNumber } from "@/lib/format";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.stats))
      .catch(() => setError(true));
  }, []);

  if (error) return <ErrorState title="Unable to load dashboard" />;
  if (!stats) return <Spinner label="Loading dashboard..." />;

  const cards = [
    { label: "Tipsters", value: stats.total_tipsters },
    { label: "Total tips", value: stats.total_tips },
    { label: "Won", value: stats.won },
    { label: "Lost", value: stats.lost },
    { label: "Pending", value: stats.pending },
    { label: "Betting companies", value: stats.total_companies },
    { label: "Total views", value: formatNumber(stats.total_views) },
    { label: "Total copies", value: formatNumber(stats.total_copies) },
  ];

  const statusBreakdown = [
    { label: "Won", value: stats.won, className: "bg-status-won" },
    { label: "Lost", value: stats.lost, className: "bg-status-lost" },
    { label: "Pending", value: stats.pending, className: "bg-status-pending" },
    { label: "Void", value: stats.void, className: "bg-status-void" },
  ];
  const maxValue = Math.max(...statusBreakdown.map((s) => s.value), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Platform overview and management.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} />
        ))}
      </div>

      <section className="card p-6">
        <h2 className="font-heading text-xl font-bold text-navy">Tip Status Breakdown</h2>
        <div className="mt-5 space-y-3">
          {statusBreakdown.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-20 text-sm font-semibold text-muted">
                {s.label}
              </span>
              <div className="h-6 flex-1 overflow-hidden rounded-md bg-surface">
                <div
                  className={`h-full ${s.className}`}
                  style={{ width: `${(s.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="w-12 text-right font-bold text-navy">{s.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/tipsters/create" className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-card-hover">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy text-lg text-white">＋</span>
          <div>
            <p className="font-bold text-navy">Create tipster</p>
            <p className="text-xs text-muted">New tipster + credentials</p>
          </div>
        </Link>
        <Link href="/admin/tips" className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-card-hover">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy text-lg text-white">✓</span>
          <div>
            <p className="font-bold text-navy">Update results</p>
            <p className="text-xs text-muted">Mark tips won / lost / void</p>
          </div>
        </Link>
        <Link href="/admin/companies" className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-card-hover">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy text-lg text-white">🏢</span>
          <div>
            <p className="font-bold text-navy">Betting companies</p>
            <p className="text-xs text-muted">Add or edit companies</p>
          </div>
        </Link>
        <Link href="/admin/home-images" className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-card-hover">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-navy text-lg text-white">▦</span>
          <div>
            <p className="font-bold text-navy">Home images</p>
            <p className="text-xs text-muted">Background sports pictures</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
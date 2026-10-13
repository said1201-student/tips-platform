"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Spinner, ErrorState, EmptyState } from "@/components/States";
import StatusBadge from "@/components/StatusBadge";
import ReviewBadge from "@/components/ReviewBadge";
import { formatDate, formatOdds, formatNumber } from "@/lib/format";

export default function MyTipsPage() {
  const [tips, setTips] = useState(null);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    api
      .get("/tips/mine")
      .then((res) => setTips(res.tips))
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  async function handleDelete(tip) {
    if (!window.confirm(`Delete "${tip.title}"? This cannot be undone.`)) return;
    setBusyId(tip.id);
    try {
      await api.delete(`/tips/${tip.id}`);
      setMessage("Tip deleted.");
      load();
    } catch (err) {
      setMessage(err.message || "Could not delete the tip.");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(t);
  }, [message]);

  if (error) return <ErrorState title="Unable to load your tips" />;
  if (!tips) return <Spinner label="Loading your tips..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy">My Tips</h1>
          <p className="mt-1 text-sm text-muted">Manage the tips you have shared.</p>
        </div>
        <Link href="/tipster/tips/create" className="btn btn-accent">
          ＋ Create Tip
        </Link>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {tips.length === 0 ? (
        <EmptyState
          title="You haven't created any tips yet"
          message="Create your first tip and share a slip code with visitors."
          icon="📝"
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[1fr_120px_80px_100px_100px_120px] gap-3 border-b border-line bg-surface px-5 py-3 text-[11px] font-bold text-muted lg:grid">
            <span>Tip</span>
            <span>Slip code</span>
            <span className="text-center">Odds</span>
            <span className="text-center">Status</span>
            <span className="text-center">Views / Copies</span>
            <span className="text-right">Actions</span>
          </div>
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="border-b border-line px-5 py-4 last:border-0 lg:grid lg:grid-cols-[1fr_120px_80px_100px_100px_120px] lg:items-center lg:gap-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/tipster/tips/${tip.id}/edit`} className="font-semibold text-navy hover:text-accent-dark">
                    {tip.title}
                  </Link>
                  <ReviewBadge reviewStatus={tip.review_status} />
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {tip.company_name} · {formatDate(tip.created_at)}
                </p>
              </div>
              <span className="slip-code mt-2 !px-2 !py-0.5 !text-xs lg:mt-0">{tip.slip_code}</span>
              <span className="mt-1 block text-sm font-bold text-navy lg:text-center">{formatOdds(tip.total_odds)}</span>
              <span className="mt-1 block lg:justify-self-center">
                <StatusBadge status={tip.status} />
              </span>
              <span className="mt-1 block text-xs text-muted lg:text-center">
                {formatNumber(tip.views)} / {formatNumber(tip.copy_count)}
              </span>
              <div className="mt-3 flex gap-2 lg:mt-0 lg:justify-end">
                <Link href={`/tipster/tips/${tip.id}/edit`} className="btn btn-outline !px-3 !py-1.5 !text-xs">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(tip)}
                  disabled={busyId === tip.id}
                  className="btn btn-danger !px-3 !py-1.5 !text-xs"
                >
                  {busyId === tip.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
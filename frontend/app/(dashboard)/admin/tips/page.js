"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Spinner, ErrorState, EmptyState } from "@/components/States";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatOdds, formatNumber } from "@/lib/format";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "viewed", label: "Most viewed" },
  { value: "copied", label: "Most copied" },
  { value: "odds", label: "Highest odds" },
];

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "void", label: "Void" },
];

export default function AdminTipsPage() {
  const [tips, setTips] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    companyId: "",
    sort: "newest",
  });

  const load = useCallback(() => {
    api
      .get(
        `/admin/tips?search=${encodeURIComponent(filters.search)}&status=${filters.status}&company_id=${filters.companyId}&sort=${filters.sort}&per_page=100`
      )
      .then((res) => {
        setTips(res.tips);
        setError(false);
      })
      .catch(() => setError(true));
  }, [filters]);

  useEffect(load, [load]);

  useEffect(() => {
    api.get("/companies?all=1").then((res) => setCompanies(res.companies)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  async function changeStatus(tip, status) {
    try {
      const res = await api.patch(`/admin/tips/${tip.id}/status`, { status });
      setNotice(`"${tip.title}" marked as ${status}.`);
      setTips((list) => list.map((t) => (t.id === tip.id ? { ...t, status } : t)));
    } catch (err) {
      setNotice(err.message || "Could not update status.");
    }
  }

  async function removeTip(tip) {
    if (!window.confirm(`Delete "${tip.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/tips/${tip.id}`);
      setNotice("Tip deleted.");
      load();
    } catch (err) {
      setNotice(err.message || "Could not delete the tip.");
    }
  }

  if (error) return <ErrorState title="Unable to load tips" />;
  if (!tips) return <Spinner label="Loading tips..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Manage Tips</h1>
        <p className="mt-1 text-sm text-muted">Review, edit results and remove tips.</p>
      </div>

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {notice}
        </div>
      )}

      <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Title or slip code"
          />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="companyId">Company</label>
          <select id="companyId" className="input" value={filters.companyId} onChange={(e) => setFilters({ ...filters, companyId: e.target.value })}>
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sort">Sort</label>
          <select id="sort" className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {tips.length === 0 ? (
        <EmptyState title="No tips found" message="Adjust your filters to see more tips." icon="🔍" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-[11px] font-bold text-muted">
                <th className="px-5 py-3">Tip</th>
                <th className="px-3 py-3">Tipster</th>
                <th className="px-3 py-3 text-center">Odds</th>
                <th className="px-3 py-3 text-center">Views / Copied</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tips.map((tip) => (
                <tr key={tip.id} className="border-b border-line last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3">
                    <Link href={`/tips/${tip.id}`} className="font-semibold text-navy hover:text-accent-dark">
                      {tip.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">
                      {tip.company_name} · {formatDate(tip.created_at)}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/tipsters/${tip.tipster_username}`} className="font-medium text-navy hover:text-accent-dark">
                      {tip.tipster_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-navy">{formatOdds(tip.total_odds)}</td>
                  <td className="px-3 py-3 text-center text-xs text-muted">
                    {formatNumber(tip.views)} / {formatNumber(tip.copy_count)}
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="input !w-auto !px-2 !py-1 !text-xs"
                      value={tip.status}
                      onChange={(e) => changeStatus(tip, e.target.value)}
                      aria-label={`Status for ${tip.title}`}
                    >
                      {STATUSES.filter((s) => s.value !== "").map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/tips/${tip.id}/edit`} className="btn btn-outline !px-3 !py-1.5 !text-xs">
                        Edit
                      </Link>
                      <button onClick={() => removeTip(tip)} className="btn btn-danger !px-3 !py-1.5 !text-xs">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
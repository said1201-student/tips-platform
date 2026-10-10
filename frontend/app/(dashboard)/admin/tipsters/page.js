"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Spinner, ErrorState, EmptyState } from "@/components/States";
import { formatDate } from "@/lib/format";

export default function AdminTipstersPage() {
  const [tipsters, setTipsters] = useState(null);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    api
      .get("/admin/tipsters")
      .then((res) => setTipsters(res.tipsters))
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 8000);
    return () => clearTimeout(t);
  }, [notice]);

  async function toggleStatus(tipster) {
    const status = tipster.status === "active" ? "disabled" : "active";
    setBusyId(tipster.id);
    try {
      await api.patch(`/admin/tipsters/${tipster.id}/status`, { status });
      setNotice(
        `${tipster.full_name} ${status === "active" ? "enabled" : "disabled"}.`
      );
      load();
    } catch (err) {
      setNotice(err.message || "Could not update status.");
    } finally {
      setBusyId(null);
    }
  }

  async function resetPassword(tipster) {
    if (!window.confirm(`Reset password for ${tipster.full_name}?`)) return;
    setBusyId(tipster.id);
    try {
      const res = await api.post(`/admin/tipsters/${tipster.id}/reset-password`, {});
      const temp = res.temporaryPassword ? ` Temporary password: ${res.temporaryPassword}` : "";
      setNotice(`Password reset for ${tipster.full_name}.${temp}`);
    } catch (err) {
      setNotice(err.message || "Could not reset password.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeTipster(tipster) {
    if (
      !window.confirm(
        `Delete ${tipster.full_name} and all their tips? This cannot be undone.`
      )
    )
      return;
    setBusyId(tipster.id);
    try {
      await api.delete(`/admin/tipsters/${tipster.id}`);
      setNotice(`${tipster.full_name} deleted.`);
      load();
    } catch (err) {
      setNotice(err.message || "Could not delete tipster.");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <ErrorState title="Unable to load tipsters" />;
  if (!tipsters) return <Spinner label="Loading tipsters..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy">Tipsters</h1>
          <p className="mt-1 text-sm text-muted">Manage tipster accounts.</p>
        </div>
        <Link href="/admin/tipsters/create" className="btn btn-accent">
          ＋ Create Tipster
        </Link>
      </div>

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {notice}
        </div>
      )}

      {tipsters.length === 0 ? (
        <EmptyState title="No tipsters yet" message="Create your first tipster account." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-[11px] font-bold text-muted">
                <th className="px-5 py-3">Tipster</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-center">Tips</th>
                <th className="px-3 py-3 text-center">Won</th>
                <th className="px-3 py-3 text-center">Lost</th>
                <th className="px-3 py-3 text-center">Pending</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tipsters.map((t) => (
                <tr key={t.id} className="border-b border-line last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-navy">{t.full_name}</p>
                    <p className="text-xs text-muted">
                      @{t.username} · {t.email}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`chip ${
                        t.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center font-semibold">{t.total_tips}</td>
                  <td className="px-3 py-3 text-center font-semibold text-status-won">{t.won}</td>
                  <td className="px-3 py-3 text-center font-semibold text-status-lost">{t.lost}</td>
                  <td className="px-3 py-3 text-center font-semibold text-status-pending">{t.pending}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link href={`/admin/tipsters/${t.id}/edit`} className="btn btn-outline !px-3 !py-1.5 !text-xs">
                        Edit
                      </Link>
                      <button
                        onClick={() => toggleStatus(t)}
                        disabled={busyId === t.id}
                        className="btn btn-outline !px-3 !py-1.5 !text-xs"
                      >
                        {t.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => resetPassword(t)}
                        disabled={busyId === t.id}
                        className="btn btn-outline !px-3 !py-1.5 !text-xs"
                      >
                        Reset pwd
                      </button>
                      <button
                        onClick={() => removeTipster(t)}
                        disabled={busyId === t.id}
                        className="btn btn-danger !px-3 !py-1.5 !text-xs"
                      >
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
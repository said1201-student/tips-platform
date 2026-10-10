"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Spinner, ErrorState } from "@/components/States";

export default function AdminEditTipPage() {
  const params = useParams();
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/tips/${params.id}`), api.get("/companies?all=1")])
      .then(([tipRes, companiesRes]) => {
        setCompanies(companiesRes.companies);
        setForm({
          title: tipRes.tip.title,
          companyId: String(tipRes.tip.company_id),
          slipCode: tipRes.tip.slip_code,
          totalOdds: tipRes.tip.total_odds,
          description: tipRes.tip.description || "",
          status: tipRes.tip.status,
        });
      })
      .catch(() => setForm("missing"))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(t);
  }, [message]);

  if (loading) return <Spinner label="Loading tip..." />;
  if (form === "missing") return <ErrorState title="Tip not found" />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.put(`/admin/tips/${params.id}`, {
        title: form.title.trim(),
        companyId: Number(form.companyId),
        slipCode: form.slipCode.trim().toUpperCase(),
        totalOdds: Number(form.totalOdds),
        description: form.description.trim() || undefined,
        status: form.status,
      });
      setMessage(`Tip updated and marked as ${res.tip.status}.`);
    } catch (err) {
      setError(err.message || "Could not update the tip.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTip() {
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api.delete(`/admin/tips/${params.id}`);
      router.push("/admin/tips");
      router.refresh();
    } catch (err) {
      setError(err.message || "Could not delete the tip.");
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-3xl font-bold text-navy">Edit Tip</h1>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="title">Tip title</label>
          <input id="title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={180} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="companyId">Betting company</label>
            <select id="companyId" className="input" value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
              <option value="">Select company...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="void">Void</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="slipCode">Slip code</label>
            <input id="slipCode" className="input font-mono uppercase" value={form.slipCode} onChange={(e) => setForm({ ...form, slipCode: e.target.value })} maxLength={60} required />
          </div>
          <div>
            <label className="label" htmlFor="totalOdds">Total odds</label>
            <input id="totalOdds" type="number" step="0.01" min="1" className="input" value={form.totalOdds} onChange={(e) => setForm({ ...form, totalOdds: e.target.value })} required />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="description">Description (optional)</label>
          <textarea id="description" className="input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="btn btn-accent">
            {busy ? "Saving..." : "Save changes"}
          </button>
          <button type="button" onClick={() => router.push("/admin/tips")} className="btn btn-outline">
            Back to tips
          </button>
          <button type="button" onClick={removeTip} disabled={busy} className="btn btn-danger ml-auto">
            Delete tip
          </button>
        </div>
      </form>
    </div>
  );
}
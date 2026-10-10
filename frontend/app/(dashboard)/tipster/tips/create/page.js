"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Spinner, ErrorState } from "@/components/States";

export default function CreateTipPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState(null);
  const [form, setForm] = useState({
    title: "",
    companyId: "",
    slipCode: "",
    totalOdds: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get("/companies")
      .then((res) => setCompanies(res.companies))
      .catch(() => setCompanies([]));
  }, []);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Please enter a tip title.";
    if (!form.companyId) errs.companyId = "Please choose a betting company.";
    if (!form.slipCode.trim()) errs.slipCode = "Please enter a slip code.";
    if (!form.totalOdds || Number(form.totalOdds) < 1) {
      errs.totalOdds = "Total odds must be at least 1.00.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await api.post("/tips", {
        title: form.title.trim(),
        companyId: Number(form.companyId),
        slipCode: form.slipCode.trim().toUpperCase(),
        totalOdds: Number(form.totalOdds),
        description: form.description.trim() || undefined,
      });
      router.push(`/tipster/tips/${res.tip.id}/edit?created=1`);
      router.refresh();
    } catch (err) {
      setFormError(err.message || "Could not create the tip.");
      setBusy(false);
    }
  }

  if (!companies) return <Spinner label="Loading..." />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Create Tip</h1>
        <p className="mt-1 text-sm text-muted">
          Share a new slip code. It will start as <strong>Pending</strong> until a result is set.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {formError}
          </div>
        )}

        <div>
          <label className="label" htmlFor="title">Tip title</label>
          <input
            id="title"
            className="input"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Mega Weekend"
            maxLength={180}
          />
          {errors.title && <p className="mt-1 text-xs font-medium text-status-lost">{errors.title}</p>}
        </div>

        <div>
          <label className="label" htmlFor="companyId">Betting company</label>
          <select
            id="companyId"
            className="input"
            value={form.companyId}
            onChange={(e) => setField("companyId", e.target.value)}
          >
            <option value="">Select a company...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.companyId && <p className="mt-1 text-xs font-medium text-status-lost">{errors.companyId}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="slipCode">Slip code</label>
            <input
              id="slipCode"
              className="input font-mono uppercase"
              value={form.slipCode}
              onChange={(e) => setField("slipCode", e.target.value)}
              placeholder="e.g. BW8K29X"
              maxLength={60}
            />
            {errors.slipCode && <p className="mt-1 text-xs font-medium text-status-lost">{errors.slipCode}</p>}
          </div>
          <div>
            <label className="label" htmlFor="totalOdds">Total odds</label>
            <input
              id="totalOdds"
              type="number"
              step="0.01"
              min="1"
              className="input"
              value={form.totalOdds}
              onChange={(e) => setField("totalOdds", e.target.value)}
              placeholder="e.g. 18.50"
            />
            {errors.totalOdds && <p className="mt-1 text-xs font-medium text-status-lost">{errors.totalOdds}</p>}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            className="input min-h-[100px]"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Short notes about this tip..."
            maxLength={2000}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="btn btn-accent !px-6">
            {busy ? "Creating tip..." : "Create tip"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
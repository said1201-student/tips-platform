"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", logo: "", websiteUrl: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Company name is required.";
    if (!/^https?:\/\/.+\..+/.test(form.websiteUrl.trim())) {
      errs.websiteUrl = "Please enter a valid URL starting with http(s)://";
    }
    if (form.logo.trim() && !/^https?:\/\/.+\..+/.test(form.logo.trim())) {
      errs.logo = "Logo must be a valid URL.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await api.post("/companies", {
        name: form.name.trim(),
        logo: form.logo.trim() || undefined,
        websiteUrl: form.websiteUrl.trim(),
      });
      router.push("/admin/companies");
      router.refresh();
    } catch (err) {
      setError(err.message || "Could not add the company.");
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-3xl font-bold text-navy">Add Company</h1>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="name">Company name</label>
          <input id="name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Betway" maxLength={120} />
          {errors.name && <p className="mt-1 text-xs font-medium text-status-lost">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="websiteUrl">Website URL</label>
          <input id="websiteUrl" type="url" className="input" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://www.betway.com" maxLength={255} />
          {errors.websiteUrl && <p className="mt-1 text-xs font-medium text-status-lost">{errors.websiteUrl}</p>}
        </div>
        <div>
          <label className="label" htmlFor="logo">Logo URL (optional)</label>
          <input id="logo" type="url" className="input" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://.../logo.png" maxLength={255} />
          {errors.logo && <p className="mt-1 text-xs font-medium text-status-lost">{errors.logo}</p>}
          <p className="mt-1 text-xs text-muted">Paste a publicly hosted logo image URL.</p>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="btn btn-accent !px-6">
            {busy ? "Adding company..." : "Add company"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
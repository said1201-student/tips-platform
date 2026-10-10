"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Spinner, ErrorState } from "@/components/States";

export default function EditCompanyPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/companies/${params.id}`)
      .then((res) => {
        setForm({
          name: res.company.name,
          logo: res.company.logo || "",
          websiteUrl: res.company.website_url,
          status: res.company.status,
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

  if (loading) return <Spinner label="Loading company..." />;
  if (form === "missing") return <ErrorState title="Company not found" />;

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Company name is required.";
    if (!/^https?:\/\/.+\..+/.test(form.websiteUrl.trim())) errs.websiteUrl = "Please enter a valid URL.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setBusy(true);
    try {
      await api.put(`/companies/${params.id}`, {
        name: form.name.trim(),
        logo: form.logo.trim(),
        websiteUrl: form.websiteUrl.trim(),
        status: form.status,
      });
      setMessage("Company updated.");
    } catch (err) {
      setError(err.message || "Could not update the company.");
    } finally {
      setBusy(false);
    }
  }

  async function removeCompany() {
    if (!window.confirm(`Delete "${form.name}"?`)) return;
    setBusy(true);
    try {
      await api.delete(`/companies/${params.id}`);
      router.push("/admin/companies");
      router.refresh();
    } catch (err) {
      setError(err.message || "Could not delete the company.");
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-3xl font-bold text-navy">Edit Company</h1>

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
          <label className="label" htmlFor="name">Company name</label>
          <input id="name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
          {errors.name && <p className="mt-1 text-xs font-medium text-status-lost">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="websiteUrl">Website URL</label>
          <input id="websiteUrl" type="url" className="input" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} maxLength={255} />
          {errors.websiteUrl && <p className="mt-1 text-xs font-medium text-status-lost">{errors.websiteUrl}</p>}
        </div>
        <div>
          <label className="label" htmlFor="logo">Logo URL</label>
          <input id="logo" type="url" className="input" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://.../logo.png" maxLength={255} />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={busy} className="btn btn-accent !px-6">
            {busy ? "Saving..." : "Save changes"}
          </button>
          <button type="button" onClick={() => router.push("/admin/companies")} className="btn btn-outline">
            Back
          </button>
          <button type="button" onClick={removeCompany} disabled={busy} className="btn btn-danger ml-auto">
            Delete company
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CreateTipsterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", username: "", email: "" });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    if (!/^[a-zA-Z0-9_]{3,60}$/.test(form.username.trim())) {
      errs.username = "Username must be 3-60 characters using letters, numbers or underscore.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await api.post("/admin/tipsters", {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
      });
      setResult(res);
    } catch (err) {
      setError(err.message || "Could not create the tipster.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-3xl font-bold text-navy">Create Tipster</h1>

      {result ? (
        <div className="card space-y-4 p-6">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {result.message}
          </div>
          <p className="text-sm text-muted">
            Credentials were sent to the tipster by email
            {result.temporaryPassword
              ? ", and the temporary password is shown below (development mode only)."
              : "."}
          </p>
          {result.temporaryPassword && (
            <div className="rounded-lg bg-surface p-4">
              <p className="text-xs font-bold text-muted">Temporary password</p>
              <p className="mt-1 font-mono text-lg font-bold text-navy">{result.temporaryPassword}</p>
              <p className="mt-1 text-xs text-muted">
                Ask the tipster to change it after their first login.
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setResult(null)} className="btn btn-outline">
              Create another
            </button>
            <button onClick={() => router.push("/admin/tipsters")} className="btn btn-navy">
              View tipsters
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="label" htmlFor="fullName">Full name</label>
            <input id="fullName" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Said Tips" maxLength={120} />
            {errors.fullName && <p className="mt-1 text-xs font-medium text-status-lost">{errors.fullName}</p>}
          </div>
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input id="username" className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. saidtips" maxLength={60} />
            {errors.username && <p className="mt-1 text-xs font-medium text-status-lost">{errors.username}</p>}
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. said@example.com" maxLength={160} />
            {errors.email && <p className="mt-1 text-xs font-medium text-status-lost">{errors.email}</p>}
          </div>

          <p className="rounded-lg bg-surface px-4 py-3 text-xs text-muted">
            A secure temporary password is generated automatically and sent to the tipster by email.
          </p>

          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="btn btn-accent">
              {busy ? "Creating tipster..." : "Create tipster"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
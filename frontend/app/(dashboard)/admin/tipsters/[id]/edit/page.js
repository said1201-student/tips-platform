"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Spinner, ErrorState } from "@/components/States";

export default function EditTipsterPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/admin/tipsters/${params.id}`)
      .then((res) => {
        setForm({
          fullName: res.tipster.full_name,
          username: res.tipster.username,
          email: res.tipster.email,
          status: res.tipster.status,
        });
      })
      .catch(() => setForm("missing"))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(t);
  }, [message]);

  if (loading) return <Spinner label="Loading tipster..." />;
  if (form === "missing") return <ErrorState title="Tipster not found" />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.put(`/admin/tipsters/${params.id}`, {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        status: form.status,
      });
      setMessage("Tipster updated.");
    } catch (err) {
      setError(err.message || "Could not update the tipster.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!window.confirm(`Reset the password for ${form.fullName}?`)) return;
    setBusy(true);
    try {
      const res = await api.post(`/admin/tipsters/${params.id}/reset-password`, {});
      setError("");
      const temp = res.temporaryPassword ? ` Temporary password: ${res.temporaryPassword}` : "";
      setMessage(`Password reset sent by email.${temp}`);
    } catch (err) {
      setError(err.message || "Could not reset password.");
    } finally {
      setBusy(false);
    }
  }

  async function removeTipster() {
    if (!window.confirm(`Delete ${form.fullName} and all their tips? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api.delete(`/admin/tipsters/${params.id}`);
      router.push("/admin/tipsters");
      router.refresh();
    } catch (err) {
      setError(err.message || "Could not delete the tipster.");
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Edit Tipster</h1>
        <p className="mt-1 text-sm text-muted">Update details, status or reset the account password.</p>
      </div>

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
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} maxLength={120} required />
        </div>
        <div>
          <label className="label" htmlFor="username">Username</label>
          <input id="username" className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} maxLength={60} required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={160} required />
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <p className="mt-1 text-xs text-muted">Disabled tipsters cannot log in.</p>
        </div>

        <button type="submit" disabled={busy} className="btn btn-accent !px-6">
          {busy ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="card space-y-4 p-6">
        <h2 className="font-heading text-lg font-bold text-navy">Danger zone</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={resetPassword} disabled={busy} className="btn btn-outline">
            Reset password
          </button>
          <button onClick={removeTipster} disabled={busy} className="btn btn-danger">
            Delete tipster
          </button>
        </div>
      </div>
    </div>
  );
}
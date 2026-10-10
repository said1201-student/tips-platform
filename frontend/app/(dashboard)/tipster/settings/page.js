"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function TipsterSettingsPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError("The new passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage(res.message);
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setError(err.message || "Could not change your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Settings</h1>
        <p className="mt-1 text-sm text-muted">Change your password.</p>
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
          <label className="label" htmlFor="currentPassword">Current password</label>
          <input
            id="currentPassword"
            type="password"
            className="input"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm new password</label>
          <input
            id="confirm"
            type="password"
            className="input"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
          />
        </div>

        <button type="submit" disabled={busy} className="btn btn-accent !px-6">
          {busy ? "Changing password..." : "Change password"}
        </button>
      </form>
    </div>
  );
}
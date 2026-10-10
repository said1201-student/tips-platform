"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Spinner } from "@/components/States";

export default function TipsterProfilePage() {
  const { user, loading, refresh } = useAuth();
  const [form, setForm] = useState({ fullName: "", username: "", email: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.full_name, username: user.username, email: user.email });
    }
  }, [user]);

  if (loading || !user) return <Spinner label="Loading profile..." />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const res = await api.patch("/auth/profile", {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
      });
      await refresh();
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message || "Could not update your profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Edit Profile</h1>
        <p className="mt-1 text-sm text-muted">Update your public name, username and email.</p>
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

        <button type="submit" disabled={busy} className="btn btn-accent !px-6">
          {busy ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
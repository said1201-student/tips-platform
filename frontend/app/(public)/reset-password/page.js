"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl">🔒</div>
        <h1 className="mt-3 font-heading text-2xl font-bold text-navy">
          Invalid reset link
        </h1>
        <p className="mt-2 text-sm text-muted">
          This link is missing its token. Please request a new reset link.
        </p>
        <Link href="/forgot-password" className="btn btn-navy mt-6">
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h1 className="font-heading text-3xl font-bold text-navy">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-muted">Choose a new password for your account.</p>

      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            className="input"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={busy} className="btn btn-accent w-full !py-3">
          {busy ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<p className="text-center text-sm text-muted">Loading...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
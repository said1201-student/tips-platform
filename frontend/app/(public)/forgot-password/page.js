"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="container-page grid min-h-[70vh] place-items-center py-12">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="text-4xl">📧</div>
            <h1 className="mt-3 font-heading text-2xl font-bold text-navy">
              Check your inbox
            </h1>
            <p className="mt-2 text-sm text-muted">
              If an account exists for that email, we have sent password reset
              instructions. The link is valid for 30 minutes.
            </p>
            <Link href="/login" className="btn btn-navy mt-6">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="font-heading text-3xl font-bold text-navy">
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-muted">
            Enter your account email and we will send you a secure reset link.
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={busy} className="btn btn-accent w-full !py-3">
              {busy ? "Sending reset email..." : "Send reset link"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            <Link href="/login" className="font-semibold text-accent-dark hover:text-navy">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
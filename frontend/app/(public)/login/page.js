"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(username.trim(), password);
      router.push(user.role === "admin" ? "/admin" : "/tipster");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-center font-heading text-3xl font-bold text-navy">
            Log In
          </h1>
          <p className="mt-2 text-center text-sm text-muted">
            Admin and tipster access only. No public registration is available.
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                className="input"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={busy} className="btn btn-accent w-full !py-3">
              {busy ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            <Link href="/forgot-password" className="font-semibold text-accent-dark hover:text-navy">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
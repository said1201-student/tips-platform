"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { copyText } from "@/lib/clipboard";

export default function CopyButton({
  code,
  tipId,
  className = "btn-accent",
  label = "Copy slip code",
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    setError("");
    setBusy(true);
    try {
      await copyText(code);

      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2500);

      if (tipId) {
        api.post(`/tips/${tipId}/copy`).catch(() => {});
      }
    } catch {
      setError("Could not copy. Please copy it manually.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={copy}
        disabled={busy}
        className={`btn w-full ${className}`}
        aria-label={`${label}: ${code}`}
      >
        {busy ? "Copying..." : copied ? "Copied!" : label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Slip code copied!" : ""}
      </span>
      {copied && (
        <p className="mt-2 text-center text-xs font-semibold text-status-won">
          ✓ Slip code copied!
        </p>
      )}
      {error && (
        <p className="mt-2 text-center text-xs font-semibold text-status-lost">
          {error}
        </p>
      )}
    </div>
  );
}

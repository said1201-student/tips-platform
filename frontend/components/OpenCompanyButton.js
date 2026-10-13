"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { copyText } from "@/lib/clipboard";
import CopyButton from "./CopyButton";

export default function OpenCompanyButton({ name, url, code, tipId }) {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function openCompany() {
    setError("");
    setOpening(true);

    const win = window.open(url, "_blank", "noopener");
    if (!win) {
      window.location.href = url;
      return;
    }

    copyText(code)
      .then(() => {
        if (tipId) api.post(`/tips/${tipId}/copy`).catch(() => {});
        timer.current = setTimeout(() => setOpening(false), 3000);
      })
      .catch(() => {
        setError("Could not copy the code. Please copy it manually.");
        setOpening(false);
      });
  }

  if (!url) {
    return <CopyButton code={code} tipId={tipId} className="btn-navy" label={`Copy ${name} code`} />;
  }

  return (
    <div>
      <button type="button" onClick={openCompany} disabled={opening} className="btn btn-navy w-full">
        {opening ? `Copying… opening ${name}` : `Open ${name}`}
      </button>
      {opening && !error && (
        <p className="mt-2 text-center text-xs font-semibold text-status-won">
          ✓ Code copied — paste it in {name} to bet
        </p>
      )}
      {error && (
        <p className="mt-2 text-center text-xs font-semibold text-status-lost">{error}</p>
      )}
    </div>
  );
}
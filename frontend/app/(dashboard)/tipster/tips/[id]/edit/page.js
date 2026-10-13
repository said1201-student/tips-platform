"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Spinner, ErrorState } from "@/components/States";
import ReviewBadge from "@/components/ReviewBadge";
import StatusBadge from "@/components/StatusBadge";
import SlipImageField from "@/components/SlipImageField";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending (match not finished yet)" },
  { value: "won", label: "Won ✓" },
  { value: "lost", label: "Lost ✗" },
  { value: "void", label: "Void" },
];

function EditForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";

  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("pending_review");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState(justCreated ? "Tip created. Waiting for admin approval." : "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.get(`/tips/mine/${params.id}`), api.get("/companies")])
      .then(([tipRes, companiesRes]) => {
        const tip = tipRes.tip;
        setReviewStatus(tip.review_status);
        setCompanies(companiesRes.companies);
        setForm({
          title: tip.title,
          companyId: String(tip.company_id),
          slipCode: tip.slip_code,
          totalOdds: tip.total_odds,
          description: tip.description || "",
          status: tip.status,
          slipImage: tip.slip_image || "",
          resultImage: tip.result_image || "",
          __prevSlip: tip.slip_image || "",
          __prevResult: tip.result_image || "",
        });
      })
      .catch(() => setForm(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    if (message) setMessage("");
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Please enter a tip title.";
    if (!form.companyId) errs.companyId = "Please choose a betting company.";
    if (!form.slipCode.trim()) errs.slipCode = "Please enter a slip code.";
    if (!form.totalOdds || Number(form.totalOdds) < 1) errs.totalOdds = "Total odds must be at least 1.00.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const body = {
        title: form.title.trim(),
        companyId: Number(form.companyId),
        slipCode: form.slipCode.trim().toUpperCase(),
        totalOdds: Number(form.totalOdds),
        description: form.description.trim() || undefined,
        status: form.status,
      };
      if (form.slipImage !== undefined && form.slipImage !== form.__prevSlip) {
        body.slipImage = form.slipImage === null ? "" : form.slipImage || undefined;
      }
      if (form.resultImage !== undefined && form.resultImage !== form.__prevResult) {
        body.resultImage = form.resultImage === null ? "" : form.resultImage || undefined;
      }
      const res = await api.put(`/tips/${params.id}`, body);
      setReviewStatus(res.tip.review_status);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setMessage(
        res.tip.review_status === "approved"
          ? "Tip updated and it is live for everyone."
          : "Tip updated. It becomes visible once an administrator approves it."
      );
    } catch (err) {
      setFormError(err.message || "Could not update the tip.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner label="Loading tip..." />;
  if (!form) return <ErrorState title="Unable to load this tip" message="It may have been removed." />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Edit Tip</h1>
        <p className="mt-1 text-sm text-muted">
          You can edit your tip, upload the slip, and mark it won, lost or void
          when the matches finish. It is only shown publicly after the
          administrator approves it.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ReviewBadge reviewStatus={reviewStatus} />
        <StatusBadge status={form.status} />
      </div>

      {reviewStatus === "pending_review" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          ⏳ This tip is waiting for the administrator to review and approve it.
          It is not visible to visitors yet.
        </div>
      )}
      {reviewStatus === "rejected" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          ⛔ An administrator rejected this tip. Fix it and ask the admin to
          approve it, or replace it.
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {formError}
          </div>
        )}

        <div>
          <label className="label" htmlFor="title">Tip title</label>
          <input id="title" className="input" value={form.title} onChange={(e) => setField("title", e.target.value)} maxLength={180} />
          {errors.title && <p className="mt-1 text-xs font-medium text-status-lost">{errors.title}</p>}
        </div>

        <div>
          <label className="label" htmlFor="companyId">Betting company</label>
          <select id="companyId" className="input" value={form.companyId} onChange={(e) => setField("companyId", e.target.value)}>
            <option value="">Select a company...</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.companyId && <p className="mt-1 text-xs font-medium text-status-lost">{errors.companyId}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="slipCode">Slip code</label>
            <input id="slipCode" className="input font-mono uppercase" value={form.slipCode} onChange={(e) => setField("slipCode", e.target.value)} maxLength={60} />
            {errors.slipCode && <p className="mt-1 text-xs font-medium text-status-lost">{errors.slipCode}</p>}
          </div>
          <div>
            <label className="label" htmlFor="totalOdds">Total odds</label>
            <input id="totalOdds" type="number" step="0.01" min="1" className="input" value={form.totalOdds} onChange={(e) => setField("totalOdds", e.target.value)} />
            {errors.totalOdds && <p className="mt-1 text-xs font-medium text-status-lost">{errors.totalOdds}</p>}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="status">Result</label>
          <select id="status" className="input" value={form.status} onChange={(e) => setField("status", e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">Mark the slip won or lost once the matches finish.</p>
        </div>

        <div>
          <label className="label" htmlFor="description">Description (optional)</label>
          <textarea id="description" className="input min-h-[100px]" value={form.description} onChange={(e) => setField("description", e.target.value)} maxLength={2000} />
        </div>

        <SlipImageField
          label="Slip screenshot"
          value={form.slipImage}
          onChange={(v) => setField("slipImage", v)}
        />

        <SlipImageField
          label="Result slip (proof of win/loss, optional)"
          value={form.resultImage}
          onChange={(v) => setField("resultImage", v)}
        />

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="btn btn-accent !px-6">
            {busy ? "Saving..." : "Save changes"}
          </button>
          <button type="button" onClick={() => router.push("/tipster/tips")} className="btn btn-outline">
            Back to my tips
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditTipPage() {
  return (
    <Suspense fallback={<Spinner label="Loading tip..." />}>
      <EditForm />
    </Suspense>
  );
}
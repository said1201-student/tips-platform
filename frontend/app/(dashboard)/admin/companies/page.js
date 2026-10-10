"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Spinner, ErrorState, EmptyState } from "@/components/States";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState(null);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    api
      .get("/companies?all=1")
      .then((res) => setCompanies(res.companies))
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  async function toggleStatus(company) {
    const status = company.status === "active" ? "disabled" : "active";
    setBusyId(company.id);
    try {
      await api.put(`/companies/${company.id}`, {
        name: company.name,
        logo: company.logo || "",
        websiteUrl: company.website_url,
        status,
      });
      setNotice(`${company.name} ${status === "active" ? "enabled" : "disabled"}.`);
      load();
    } catch (err) {
      setNotice(err.message || "Could not update company.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeCompany(company) {
    if (!window.confirm(`Delete "${company.name}"?`)) return;
    setBusyId(company.id);
    try {
      const res = await api.delete(`/companies/${company.id}`);
      setNotice(res.message);
      load();
    } catch (err) {
      setNotice(err.message || "Could not delete company.");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <ErrorState title="Unable to load companies" />;
  if (!companies) return <Spinner label="Loading companies..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-navy">Betting Companies</h1>
          <p className="mt-1 text-sm text-muted">Add and manage betting companies.</p>
        </div>
        <Link href="/admin/companies/create" className="btn btn-accent">
          ＋ Add Company
        </Link>
      </div>

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {notice}
        </div>
      )}

      {companies.length === 0 ? (
        <EmptyState title="No companies yet" message="Add your first betting company." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-[11px] font-bold text-muted">
                <th className="px-5 py-3">Company</th>
                <th className="px-3 py-3">Website</th>
                <th className="px-3 py-3 text-center">Tips</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-md border border-line bg-white">
                        {c.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.logo} alt="" className="h-full w-full object-contain p-0.5" />
                        ) : (
                          <span className="font-heading font-bold text-navy">{c.name?.charAt(0)}</span>
                        )}
                      </span>
                      <span className="font-semibold text-navy">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <a href={c.website_url} target="_blank" rel="noopener noreferrer nofollow" className="text-accent-dark hover:underline">
                      {c.website_url.replace(/^https?:\/\//, "")}
                    </a>
                  </td>
                  <td className="px-3 py-3 text-center font-semibold">{c.tip_count}</td>
                  <td className="px-3 py-3">
                    <span className={`chip ${c.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link href={`/admin/companies/${c.id}/edit`} className="btn btn-outline !px-3 !py-1.5 !text-xs">
                        Edit
                      </Link>
                      <button onClick={() => toggleStatus(c)} disabled={busyId === c.id} className="btn btn-outline !px-3 !py-1.5 !text-xs">
                        {c.status === "active" ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => removeCompany(c)} disabled={busyId === c.id} className="btn btn-danger !px-3 !py-1.5 !text-xs">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
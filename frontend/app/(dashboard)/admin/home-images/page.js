"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { Spinner, ErrorState, EmptyState } from "@/components/States";
import SlipImageField from "@/components/SlipImageField";

const EMPTY_FORM = { id: null, title: "", image: null, link: "", sortOrder: 1, active: true };

export default function AdminHomeImagesPage() {
  const [images, setImages] = useState(null);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(false);

  const load = useCallback(() => {
    api
      .get("/admin/home-images")
      .then((res) => setImages(res.images))
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(img) {
    setForm({
      id: img.id,
      title: img.title || "",
      image: img.image,
      link: img.link || "",
      sortOrder: img.sort_order,
      active: Boolean(img.active),
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditing(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.image) {
      setNotice("Please choose an image.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        image: form.image,
        link: form.link,
        sortOrder: form.sortOrder,
        active: form.active,
      };
      const res = editing
        ? await api.patch(`/admin/home-images/${form.id}`, payload)
        : await api.post("/admin/home-images", payload);
      setNotice(res.message);
      resetForm();
      load();
    } catch (err) {
      setNotice(err.message || "Could not save the image.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(img) {
    setBusyId(img.id);
    try {
      const res = await api.patch(`/admin/home-images/${img.id}`, { active: !img.active });
      setNotice(`${img.title || "Image"} ${img.active ? "hidden" : "shown"} on the home page.`);
      load();
    } catch (err) {
      setNotice(err.message || "Could not update the image.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeImage(img) {
    if (!window.confirm(`Delete "${img.title || "this image"}"?`)) return;
    setBusyId(img.id);
    try {
      const res = await api.delete(`/admin/home-images/${img.id}`);
      setNotice(res.message);
      if (editing && form.id === img.id) resetForm();
      load();
    } catch (err) {
      setNotice(err.message || "Could not delete the image.");
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <ErrorState title="Unable to load home images" />;
  if (!images) return <Spinner label="Loading home images..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">Home Images</h1>
        <p className="mt-1 text-sm text-muted">
          Sports pictures shown as the home page background. Active images rotate automatically.
        </p>
      </div>

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {notice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <h2 className="font-heading text-xl font-bold text-navy">
          {editing ? "Edit image" : "Add a home page image"}
        </h2>

        <SlipImageField
          label="Background image"
          value={form.image}
          onChange={(v) => setField("image", v)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title (optional)</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Saturday football"
              maxLength={255}
            />
          </div>
          <div>
            <label className="label">Link (optional)</label>
            <input
              className="input"
              value={form.link}
              onChange={(e) => setField("link", e.target.value)}
              placeholder="https://..."
              maxLength={500}
            />
          </div>
          <div>
            <label className="label">Order (lower shows first)</label>
            <input
              type="number"
              className="input"
              value={form.sortOrder}
              onChange={(e) => setField("sortOrder", Number(e.target.value))}
              min={0}
            />
          </div>
          <div>
            <label className="label mb-2 block">Visible on home page</label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setField("active", e.target.checked)}
                className="h-4 w-4 accent-accent-dark"
              />
              Active
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={busy} className="btn btn-accent">
            {busy ? "Saving..." : editing ? "Save changes" : "Add image"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn btn-outline">
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {images.length === 0 ? (
        <EmptyState title="No home images yet" message="Add a sports picture to style the home page." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-[11px] font-bold text-muted">
                <th className="px-5 py-3">Preview</th>
                <th className="px-3 py-3">Title / Link</th>
                <th className="px-3 py-3 text-center">Order</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img) => (
                <tr key={img.id} className="border-b border-line last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3">
                    <span className="block h-16 w-28 overflow-hidden rounded-lg border border-line bg-navy/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.image} alt="" className="h-full w-full object-cover" />
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-navy">{img.title || "Untitled"}</p>
                    {img.link && (
                      <a
                        href={img.link}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="block max-w-[220px] truncate text-xs text-accent-dark hover:underline"
                      >
                        {img.link.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                    {!img.active && <p className="mt-1 text-xs italic text-muted">Inactive</p>}
                  </td>
                  <td className="px-3 py-3 text-center font-semibold">{img.sort_order}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`chip ${
                        img.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {img.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => startEdit(img)}
                        disabled={busyId === img.id}
                        className="btn btn-outline !px-3 !py-1.5 !text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(img)}
                        disabled={busyId === img.id}
                        className="btn btn-outline !px-3 !py-1.5 !text-xs"
                      >
                        {img.active ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => removeImage(img)}
                        disabled={busyId === img.id}
                        className="btn btn-danger !px-3 !py-1.5 !text-xs"
                      >
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
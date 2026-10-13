"use client";

import { useRef } from "react";

const MAX_BYTES = 4 * 1024 * 1024;

export default function SlipImageField({ label, value, onChange }) {
  const inputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      alert("Image is too large. Please choose an image under 4 MB.");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      if (inputRef.current) inputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <label className="label">{label}</label>
      {value ? (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Slip preview"
            className="max-h-64 w-auto rounded-card object-contain ring-1 ring-line"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current && inputRef.current.click()}
              className="btn btn-outline !px-3 !py-1.5 !text-xs"
            >
              Change image
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="btn btn-danger !px-3 !py-1.5 !text-xs"
            >
              Remove
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      ) : (
        <input type="file" accept="image/*" className="input" onChange={handleFile} />
      )}
    </div>
  );
}
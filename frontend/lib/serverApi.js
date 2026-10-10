const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Fetch from the API on the server (used by public pages).
 * Never throws: returns { ok, data, status } so pages can render
 * friendly error states instead of crashing.
 */
export async function serverGet(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export { API_URL };

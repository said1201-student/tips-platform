"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/tips", label: "Tips" },
  { href: "/tipsters", label: "Top Tipsters" },
  { href: "/companies", label: "Betting Companies" },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const dashboardHref =
    user && user.role === "admin"
      ? "/admin"
      : user && user.role === "tipster"
      ? "/tipster"
      : null;

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push("/");
  }

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-xl font-bold tracking-tight text-navy">
            Tip<span className="text-accent">Slip</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-accent-light text-accent-dark"
                  : "text-muted hover:bg-navy-50 hover:text-navy"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? null : user ? (
            <>
              {dashboardHref && (
                <Link href={dashboardHref} className="btn btn-outline">
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-accent">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-accent">
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg text-lg text-navy hover:bg-navy-50 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="leading-none">{open ? "×" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-white md:hidden">
          <div className="container-page flex flex-col py-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-accent-light text-accent-dark"
                    : "text-muted hover:bg-navy-50 hover:text-navy"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
              {user ? (
                <>
                  {dashboardHref && (
                    <Link
                      href={dashboardHref}
                      onClick={() => setOpen(false)}
                      className="btn btn-outline"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="btn btn-accent">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="btn btn-accent">
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

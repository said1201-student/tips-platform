"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardShell({ brand = "Dashboard", navItems, children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-heading text-xl font-bold tracking-tight text-navy">
                Tip<span className="text-accent">Slip</span>
              </span>
            </Link>
            <span className="hidden text-sm font-medium text-muted sm:block">
              / {brand}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-navy md:block">
              {user?.full_name}
            </span>
            <Link href="/" className="text-sm font-medium text-muted hover:text-accent-dark">
              View site
            </Link>
            <button onClick={handleLogout} className="btn btn-accent !px-4 !py-2">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
        <nav
          className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:h-fit lg:flex-col lg:overflow-visible"
          aria-label="Dashboard navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? "bg-accent-light text-accent-dark"
                  : "bg-white text-muted hover:bg-navy-50 hover:text-navy"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

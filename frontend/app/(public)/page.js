import Link from "next/link";
import { serverGet } from "@/lib/serverApi";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Betting Tips & Slip Codes",
  description:
    "Discover betting tips from our tipsters and use the slip codes on your preferred betting platform.",
};

export default async function HomePage() {
  const [tipsRes, tipstersRes, companiesRes] = await Promise.all([
    serverGet("/tips?per_page=1"),
    serverGet("/tipsters"),
    serverGet("/companies"),
  ]);

  const stats = [
    { label: "Tips shared", value: formatNumber(tipsRes.data?.pagination?.total || 0) },
    { label: "Tipsters", value: formatNumber(tipstersRes.data?.tipsters?.length || 0) },
    { label: "Betting companies", value: formatNumber(companiesRes.data?.companies?.length || 0) },
  ];

  return (
    <section className="bg-surface">
      <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold text-navy">
            Tipster sharing platform
          </span>
          <h1 className="mt-4 font-heading text-4xl font-light leading-[1.05] tracking-tight text-navy sm:text-5xl lg:text-6xl">
            Find <em className="font-medium italic text-accent">Betting Tips</em>{" "}
            &amp; Slip Codes
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            Discover betting tips from our tipsters and use the slip codes on
            your preferred betting platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tips" className="btn btn-accent !px-6 !py-3 !text-base">
              Browse Tips
            </Link>
            <Link href="/tipsters" className="btn btn-outline !px-6 !py-3 !text-base">
              Top Tipsters
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-card bg-white p-4 ring-1 ring-line">
              <p className="font-heading text-3xl font-bold text-accent">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
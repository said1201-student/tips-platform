import Link from "next/link";
import { serverGet } from "@/lib/serverApi";
import { formatDate, formatNumber, formatOdds } from "@/lib/format";
import TipCard from "@/components/TipCard";
import TipsterCard from "@/components/TipsterCard";
import CompanyCard from "@/components/CompanyCard";
import SectionHeading from "@/components/SectionHeading";
import StatusBadge from "@/components/StatusBadge";
import CopyButton from "@/components/CopyButton";
import { EmptyState, ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Betting Tips & Slip Codes",
  description:
    "Browse the best betting tips and slip codes from our tipsters. Copy a slip code and use it on your favourite betting company.",
};

export default async function HomePage() {
  const [trendingRes, latestRes, leaderboardRes, companiesRes] = await Promise.all([
    serverGet("/tips?sort=trending&per_page=6"),
    serverGet("/tips?sort=newest&per_page=6"),
    serverGet("/tipsters"),
    serverGet("/companies"),
  ]);

  const trending = trendingRes.data?.tips || [];
  const latest = latestRes.data?.tips || [];
  const tipsters = (leaderboardRes.data?.tipsters || []).slice(0, 5);
  const companies = companiesRes.data?.companies || [];

  const tipOfTheDay = trending[0] || null;
  const apiDown = !trendingRes.ok && !latestRes.ok;

  return (
    <>
      {/* HERO */}
      <section className="bg-navy text-white">
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="chip bg-white/10 text-white">Tipster sharing platform</span>
            <h1 className="mt-4 font-heading text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Find{" "}
              <em className="font-medium italic text-accent">Betting Tips</em>{" "}
              &amp; Slip Codes
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/80 sm:text-lg">
              Discover betting tips from our tipsters and use the slip codes on
              your preferred betting platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tips" className="btn btn-accent !px-6 !py-3 !text-base">
                Browse Tips
              </Link>
              <Link
                href="/tipsters"
                className="btn btn-outline !border-white/25 !bg-transparent !px-6 !py-3 !text-base !text-white hover:!bg-navy-700"
              >
                Top Tipsters
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {[
              { label: "Tips shared", value: formatNumber(trendingRes.data?.pagination?.total || 0) },
              { label: "Tipsters", value: formatNumber(leaderboardRes.data?.tipsters?.length || 0) },
              { label: "Betting companies", value: formatNumber(companies.length) },
              { label: "Copies", value: formatNumber(latest.reduce((s, t) => s + Number(t.copy_count || 0), 0)) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-card bg-white/5 p-4 ring-1 ring-white/10">
                <p className="font-heading text-3xl font-bold text-accent">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold text-white/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        {apiDown && (
          <ErrorState
            title="Unable to load tips"
            message="We could not connect to the server. Please make sure the API is running and try again."
          />
        )}

        {/* TIP OF THE DAY */}
        {!apiDown && tipOfTheDay && (
          <section className="mb-14">
            <SectionHeading title="Tip of the Day" />
            <div className="card overflow-hidden border-2 border-accent/40">
              <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={tipOfTheDay.status} />
                    <span className="text-xs font-semibold text-muted">
                      {formatDate(tipOfTheDay.created_at)}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-2xl font-bold text-navy sm:text-3xl">
                    <Link href={`/tips/${tipOfTheDay.id}`} className="hover:text-accent-dark">
                      {tipOfTheDay.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    by{" "}
                    <Link
                      href={`/tipsters/${tipOfTheDay.tipster_username}`}
                      className="font-semibold text-navy hover:text-accent-dark"
                    >
                      {tipOfTheDay.tipster_name}
                    </Link>{" "}
                    · {tipOfTheDay.company_name}
                  </p>
                  {tipOfTheDay.description && (
                    <p className="mt-3 max-w-xl text-sm text-muted">
                      {tipOfTheDay.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-stretch gap-4 md:w-64">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold text-muted">
                        Total odds
                      </p>
                      <p className="font-heading text-4xl font-bold leading-none text-navy">
                        {formatOdds(tipOfTheDay.total_odds)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-muted">
                        Slip code
                      </p>
                      <span className="slip-code mt-1">{tipOfTheDay.slip_code}</span>
                    </div>
                  </div>
                  <CopyButton code={tipOfTheDay.slip_code} tipId={tipOfTheDay.id} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TRENDING TIPS */}
        <section className="mb-14">
          <SectionHeading title="Trending Tips" href="/tips?sort=trending" />
          {trending.length === 0 && !apiDown ? (
            <EmptyState title="No tips available yet" message="Check back soon for fresh tips." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trending.map((tip) => (
                <TipCard key={tip.id} tip={tip} />
              ))}
            </div>
          )}
        </section>

        {/* TOP TIPSTERS */}
        <section className="mb-14">
          <SectionHeading title="Top Tipsters" href="/tipsters" />
          {tipsters.length === 0 && !apiDown ? (
            <EmptyState title="No tipsters yet" message="Tipster profiles will appear here." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {tipsters.map((t) => (
                <TipsterCard key={t.id} tipster={t} showRank />
              ))}
            </div>
          )}
        </section>

        {/* LATEST TIPS */}
        <section className="mb-14">
          <SectionHeading title="Latest Tips" href="/tips" />
          {latest.length === 0 && !apiDown ? (
            <EmptyState title="No tips available yet" message="New tips will show up here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((tip) => (
                <TipCard key={tip.id} tip={tip} />
              ))}
            </div>
          )}
        </section>

        {/* BETTING COMPANIES */}
        <section>
          <SectionHeading title="Betting Companies" href="/companies" />
          {companies.length === 0 && !apiDown ? (
            <EmptyState title="No companies yet" message="Betting companies will be listed here." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {companies.map((c) => (
                <CompanyCard key={c.id} company={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

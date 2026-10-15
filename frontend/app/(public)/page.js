import Link from "next/link";
import { serverGet } from "@/lib/serverApi";
import { formatNumber } from "@/lib/format";
import HeroSlideshow from "@/components/HeroSlideshow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Betting Tips & Slip Codes",
  description:
    "Discover betting tips from our tipsters and use the slip codes on your preferred betting platform.",
};

export default async function HomePage() {
  const [tipsRes, tipstersRes, companiesRes, heroRes, winnersRes] = await Promise.all([
    serverGet("/tips?per_page=1"),
    serverGet("/tipsters"),
    serverGet("/companies"),
    serverGet("/home-images"),
    serverGet("/tips/winners"),
  ]);

  const heroImages = heroRes.ok && Array.isArray(heroRes.data?.images) ? heroRes.data.images : [];
  const winners = winnersRes.ok && Array.isArray(winnersRes.data?.winners) ? winnersRes.data.winners : [];

  const stats = [
    { label: "Tips shared", value: formatNumber(tipsRes.data?.pagination?.total || 0) },
    { label: "Tipsters", value: formatNumber(tipstersRes.data?.tipsters?.length || 0) },
    { label: "Betting companies", value: formatNumber(companiesRes.data?.companies?.length || 0) },
  ];

  const hasImages = heroImages.length > 0;

  const heroTextTone = hasImages
    ? {
        badge: "bg-white/10 text-white",
        title: "text-white",
        em: "text-accent",
        text: "text-white/80",
        secondaryBtn: "border-white/40 text-white hover:bg-white/10",
        statCard: "bg-white/10 ring-white/20",
        statValue: "text-white",
        statLabel: "text-white/70",
      }
    : {
        badge: "bg-navy/5 text-navy",
        title: "text-navy",
        em: "text-accent-dark",
        text: "text-muted",
        secondaryBtn: "",
        statCard: "bg-white ring-1 ring-line",
        statValue: "text-accent-dark",
        statLabel: "text-muted",
      };

  return (
    <>
      <section className={hasImages ? "relative overflow-hidden bg-navy" : "bg-surface"}>
        {hasImages && <HeroSlideshow images={heroImages} />}

        <div className="container-page relative z-10 grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${heroTextTone.badge}`}
            >
              Tipster sharing platform
            </span>
            <h1
              className={`mt-4 font-heading text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${heroTextTone.title}`}
            >
              Find <em className={`font-medium italic ${heroTextTone.em}`}>Betting Tips</em> &amp;
              Slip Codes
            </h1>
            <p className={`mt-5 max-w-xl text-base sm:text-lg ${heroTextTone.text}`}>
              Discover betting tips from our tipsters and use the slip codes on your preferred
              betting platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tips" className="btn btn-accent !px-6 !py-3 !text-base">
                Browse Tips
              </Link>
              <Link
                href="/tipsters"
                className={`btn btn-outline !px-6 !py-3 !text-base ${heroTextTone.secondaryBtn}`}
              >
                Top Tipsters
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-card p-4 ${heroTextTone.statCard}`}
              >
                <p className={`font-heading text-3xl font-bold ${heroTextTone.statValue}`}>
                  {stat.value}
                </p>
                <p className={`mt-1 text-xs font-semibold ${heroTextTone.statLabel}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {winners.length > 0 && (
        <section className="bg-surface py-14">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
                  Recent <em className="font-medium italic text-accent-dark">Winners</em>
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Tipsters proving their wins with their betting slips.
                </p>
              </div>
              <Link href="/tips" className="btn btn-outline !py-2">
                View all tips
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {winners.map((win) => (
                <Link
                  key={win.id}
                  href={`/tips/${win.id}`}
                  className="card overflow-hidden transition-shadow hover:shadow-card-hover"
                >
                  <div className="relative aspect-video overflow-hidden bg-navy/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={win.result_image}
                      alt={`${win.tipster_name}'s winning slip`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                      Won
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-bold text-navy">{win.title}</h3>
                    <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                      {win.company_logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={win.company_logo} alt="" className="h-4 w-4 object-contain" />
                      ) : (
                        <span>{win.company_name}</span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        {win.company_name} · {win.tipster_name}
                      </span>
                    </p>
                    <p className="mt-2 text-sm font-semibold text-navy">
                      Total odds: <span className="text-accent-dark">{win.total_odds}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
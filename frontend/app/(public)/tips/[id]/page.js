import Link from "next/link";
import { notFound } from "next/navigation";
import { serverGet } from "@/lib/serverApi";
import { formatDate, formatNumber, formatOdds } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import CopyButton from "@/components/CopyButton";
import OpenCompanyButton from "@/components/OpenCompanyButton";
import ViewTracker from "@/components/ViewTracker";
import { ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const res = await serverGet(`/tips/${params.id}`);
  const tip = res.data?.tip;
  if (!tip) return { title: "Tip not found" };
  return {
    title: `${tip.title} | Betting Tips`,
    description: `${tip.title} by ${tip.tipster_name} on ${tip.company_name} — odds ${formatOdds(tip.total_odds)}.`,
  };
}

export default async function TipDetailPage({ params }) {
  const res = await serverGet(`/tips/${params.id}`);
  if (res.ok && !res.data?.tip) notFound();
  const tip = res.data?.tip;

  if (!res.ok) {
    return (
      <div className="container-page py-10">
        <ErrorState
          title="Unable to load this tip"
          message={res.status === 404 ? "This tip may have been removed." : "Please try again shortly."}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <ViewTracker tipId={tip.id} />

      <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-navy">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/tips" className="hover:text-navy">
          Tips
        </Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-navy">{tip.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={tip.status} />
            <span className="text-xs font-semibold text-muted">
              Published {formatDate(tip.created_at)}
            </span>
          </div>

          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl">
            {tip.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-4">
            <div>
              <p className="text-[11px] font-bold text-muted">Tipster</p>
              <Link
                href={`/tipsters/${tip.tipster_username}`}
                className="font-heading text-lg font-bold text-navy hover:text-accent-dark"
              >
                {tip.tipster_name}
              </Link>
            </div>

            <div>
              <p className="text-[11px] font-bold text-muted">Betting company</p>
              <div className="flex items-center gap-2">
                {tip.company_logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tip.company_logo}
                    alt=""
                    className="h-5 w-5 object-contain"
                    width={20}
                    height={20}
                  />
                ) : null}
                <span className="font-heading text-lg font-bold text-navy">
                  {tip.company_name}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div className="rounded-card bg-navy-50 p-4 text-center">
              <p className="text-[11px] font-bold text-muted">Total odds</p>
              <p className="mt-1 font-heading text-4xl font-bold text-navy">
                {formatOdds(tip.total_odds)}
              </p>
            </div>
            <div className="rounded-card bg-navy-50 p-4 text-center">
              <p className="text-[11px] font-bold text-muted">Views</p>
              <p className="mt-1 font-heading text-2xl font-bold text-navy">
                {formatNumber(tip.views)}
              </p>
            </div>
            <div className="rounded-card bg-navy-50 p-4 text-center">
              <p className="text-[11px] font-bold text-muted">Copies</p>
              <p className="mt-1 font-heading text-2xl font-bold text-navy">
                {formatNumber(tip.copy_count)}
              </p>
            </div>
          </div>

          {tip.description && (
            <div className="mt-6">
              <h2 className="font-heading text-sm font-bold text-navy">
                Description
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{tip.description}</p>
            </div>
          )}

          {tip.slip_image && (
            <div className="mt-6">
              <h2 className="font-heading text-sm font-bold text-navy">Slip</h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tip.slip_image}
                alt={`Slip for ${tip.title}`}
                className="mt-3 max-h-96 w-auto rounded-card ring-1 ring-line"
              />
            </div>
          )}

          {tip.result_image && (tip.status === "won" || tip.status === "lost") && (
            <div className="mt-6">
              <h2 className="font-heading text-sm font-bold text-navy">
                Result slip ({tip.status === "won" ? "won" : "lost"})
              </h2>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tip.result_image}
                alt={`Result slip for ${tip.title}`}
                className="mt-3 max-h-96 w-auto rounded-card ring-1 ring-line"
              />
            </div>
          )}
        </div>

        <aside className="card h-fit p-6">
          <p className="text-[11px] font-bold text-muted">Slip code</p>
          <p className="slip-code mt-2 w-full justify-center !text-lg">{tip.slip_code}</p>

          <div className="mt-5">
            <CopyButton code={tip.slip_code} tipId={tip.id} label="Copy slip code" />
          </div>

          <div className="mt-3">
            <OpenCompanyButton
              name={tip.company_name}
              url={tip.company_website}
              code={tip.slip_code}
              tipId={tip.id}
            />
          </div>
          <p className="mt-3 text-center text-[11px] text-muted">
            Betting happens on {tip.company_name}&apos;s website. TipSlip only
            shares the code.
          </p>
        </aside>
      </div>
    </div>
  );
}
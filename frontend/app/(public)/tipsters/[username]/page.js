import Link from "next/link";
import { notFound } from "next/navigation";
import { serverGet } from "@/lib/serverApi";
import { formatNumber } from "@/lib/format";
import TipCard from "@/components/TipCard";
import SectionHeading from "@/components/SectionHeading";
import { EmptyState, ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const res = await serverGet(`/tipsters/${params.username}`);
  const tipster = res.data?.tipster;
  if (!tipster) return { title: "Tipster not found" };
  return {
    title: `${tipster.full_name} | Tipster Profile`,
    description: `${tipster.full_name} (@${tipster.username}) — track their betting tip record.`,
  };
}

export default async function TipsterProfilePage({ params }) {
  const res = await serverGet(`/tipsters/${params.username}`);
  if (res.ok && !res.data?.tipster) notFound();

  if (!res.ok) {
    return (
      <div className="container-page py-10">
        <ErrorState title="Unable to load this tipster" message="Please try again shortly." />
      </div>
    );
  }

  const { tipster, stats, tips } = res.data;

  const statCards = [
    { label: "Total tips", value: stats.total_tips, accent: false },
    { label: "Won", value: stats.won, accent: false, className: "text-status-won" },
    { label: "Lost", value: stats.lost, accent: false, className: "text-status-lost" },
    { label: "Pending", value: stats.pending, accent: false, className: "text-status-pending" },
    { label: "Win rate", value: `${stats.win_rate}%`, accent: true },
    { label: "Views", value: formatNumber(stats.total_views), accent: false },
    { label: "Copies", value: formatNumber(stats.total_copies), accent: false },
  ];

  return (
    <div className="container-page py-10">
      <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-navy">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tipsters" className="hover:text-navy">Top Tipsters</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-navy">{tipster.full_name}</span>
      </nav>

      <section className="card mb-10 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-navy font-heading text-4xl font-bold text-white">
            {tipster.full_name?.charAt(0) || "T"}
          </span>
          <div>
            <h1 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
              {tipster.full_name}
            </h1>
            <p className="mt-1 text-sm text-muted">@{tipster.username}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-card bg-surface p-4 text-center">
              <p className={`font-heading text-2xl font-bold ${card.className || "text-navy"}`}>
                {card.value}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-muted">
                {card.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Recent Tips" href={`/tips?tipster=${tipster.username}`} />
        {tips.length === 0 ? (
          <EmptyState
            title="No tips yet"
            message="This tipster hasn't shared any tips yet."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
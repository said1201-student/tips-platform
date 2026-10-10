import { serverGet } from "@/lib/serverApi";
import CompanyCard from "@/components/CompanyCard";
import SectionHeading from "@/components/SectionHeading";
import { EmptyState, ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Betting Companies",
  description:
    "Browse the betting companies whose slip codes appear on TipSlip.",
};

export default async function CompaniesPage() {
  const res = await serverGet("/companies");
  const companies = res.data?.companies || [];

  if (!res.ok) {
    return (
      <div className="container-page py-10">
        <ErrorState title="Unable to load companies" message="Please try again shortly." />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <SectionHeading title="Betting Companies" />
      <p className="mb-6 max-w-2xl text-sm text-muted">
        These are the betting companies our tipsters use. Click a company to
        open its website, or browse tips that use its slip codes.
      </p>

      {companies.length === 0 ? (
        <EmptyState title="No companies yet" message="Betting companies will be listed here." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {companies.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      )}
    </div>
  );
}
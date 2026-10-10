export default function CompanyCard({ company }) {
  return (
    <a
      href={company.website_url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-card-hover"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-white">
        {company.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.logo}
            alt={`${company.name} logo`}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <span className="font-heading text-lg font-bold text-navy">
            {company.name?.charAt(0) || "?"}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-base font-bold text-navy">
          {company.name}
        </p>
        <p className="text-xs text-muted">
          {company.tip_count ?? 0} tip{company.tip_count === 1 ? "" : "s"}
        </p>
      </div>
      <span className="btn btn-outline !px-3 !py-1.5 !text-xs">Visit</span>
    </a>
  );
}

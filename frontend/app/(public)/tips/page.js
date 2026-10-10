import Link from "next/link";
import { serverGet } from "@/lib/serverApi";
import TipCard from "@/components/TipCard";
import SectionHeading from "@/components/SectionHeading";
import { EmptyState, ErrorState } from "@/components/States";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Browse Betting Tips",
  description:
    "Search, filter and sort betting tips and slip codes from all our tipsters.",
};

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "viewed", label: "Most Viewed" },
  { value: "copied", label: "Most Copied" },
  { value: "odds", label: "Highest Odds" },
  { value: "trending", label: "Trending" },
];

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "void", label: "Void" },
];

function buildQuery(params, overrides = {}) {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams();
  Object.entries(merged).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && key !== "page") {
      search.set(key, value);
    }
  });
  if (overrides.page && overrides.page > 1) search.set("page", overrides.page);
  const qs = search.toString();
  return qs ? `/tips?${qs}` : "/tips";
}

export default async function TipsPage({ searchParams }) {
  const params = {
    search: searchParams.search || "",
    company_id: searchParams.company_id || "",
    tipster: searchParams.tipster || "",
    status: searchParams.status || "",
    sort: searchParams.sort || "newest",
    page: Number(searchParams.page) || 1,
  };

  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.company_id) query.set("company_id", params.company_id);
  if (params.tipster) query.set("tipster", params.tipster);
  if (params.status) query.set("status", params.status);
  query.set("sort", params.sort);
  query.set("per_page", "12");
  query.set("page", String(params.page));

  const [tipsRes, companiesRes, tipstersRes] = await Promise.all([
    serverGet(`/tips?${query.toString()}`),
    serverGet("/companies"),
    serverGet("/tipsters"),
  ]);

  const tips = tipsRes.data?.tips || [];
  const pagination = tipsRes.data?.pagination || { page: 1, total_pages: 1 };
  const companies = companiesRes.data?.companies || [];
  const tipsters = tipstersRes.data?.tipsters || [];

  return (
    <div className="container-page py-10">
      <SectionHeading title="Browse Tips" />

      <form method="get" className="card mb-8 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="label" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            name="search"
            defaultValue={params.search}
            placeholder="Tip title or slip code"
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="company_id">
            Betting company
          </label>
          <select id="company_id" name="company_id" defaultValue={params.company_id} className="input">
            <option value="">All companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="tipster">
            Tipster
          </label>
          <select id="tipster" name="tipster" defaultValue={params.tipster} className="input">
            <option value="">All tipsters</option>
            {tipsters.map((t) => (
              <option key={t.id} value={t.username}>
                {t.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={params.status} className="input">
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="sort">
            Sort by
          </label>
          <select id="sort" name="sort" defaultValue={params.sort} className="input">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" className="btn btn-navy">
            Apply filters
          </button>
          <Link href="/tips" className="btn btn-outline">
            Reset
          </Link>
        </div>
      </form>

      {!tipsRes.ok ? (
        <ErrorState
          title="Unable to load tips"
          message="We could not reach the server. Please try again shortly."
        />
      ) : tips.length === 0 ? (
        <EmptyState
          title="No tips found"
          message="Try adjusting your search or filters."
          icon="🔍"
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            Showing <strong>{tips.length}</strong> of{" "}
            <strong>{pagination.total}</strong> tips
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip) => (
              <TipCard key={tip.id} tip={tip} />
            ))}
          </div>

          {pagination.total_pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              {pagination.page > 1 && (
                <Link href={buildQuery(params, { page: pagination.page - 1 })} className="btn btn-outline">
                  ← Prev
                </Link>
              )}
              <span className="px-3 text-sm text-muted">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              {pagination.page < pagination.total_pages && (
                <Link href={buildQuery(params, { page: pagination.page + 1 })} className="btn btn-outline">
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

import Link from "next/link";

export default function SectionHeading({ title, href, linkLabel = "View all" }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-navy/10 pb-2">
      <h2 className="section-title">{title}</h2>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-bold text-accent-dark hover:text-navy"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

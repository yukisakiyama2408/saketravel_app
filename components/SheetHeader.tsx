import Link from "next/link";

type Props = {
  kicker?: string;
  title: string;
  sub?: string;
  link?: string;
  linkHref?: string;
  onClose?: () => void;
};

export default function SheetHeader({ kicker, title, sub, link, linkHref, onClose }: Props) {
  return (
    <div className="flex items-start justify-between px-5 pt-4 pb-3">
      <div className="flex-1 min-w-0 pr-4">
        {kicker && (
          <p
            className="text-[11px] uppercase mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              color: "var(--ink-50)",
            }}
          >
            {kicker}
          </p>
        )}
        <h2
          className="text-[26px] font-bold leading-tight"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          {title}
        </h2>
        {sub && (
          <p
            className="text-[11px] mt-0.5"
            style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
          >
            {sub}
          </p>
        )}
        {link && linkHref && (
          <Link
            href={linkHref}
            className="inline-block text-[12px] font-medium mt-1.5"
            style={{ color: "var(--amber)" }}
          >
            {link} →
          </Link>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{
            width: 32,
            height: 32,
            background: "var(--ink-04)",
            color: "var(--ink-50)",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

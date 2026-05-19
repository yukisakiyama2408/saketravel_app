import type { Store } from "@/types";

type Props = {
  store: Store;
};

export default function StoreCard({ store }: Props) {
  return (
    <div
      style={{
        background: "var(--paper-2)",
        border: "1px solid var(--ink-08)",
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Pin icon */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl text-lg"
          style={{ width: 40, height: 40, background: "var(--amber-tint)" }}
        >
          📍
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-bold leading-snug"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 14.5,
              color: "var(--ink)",
            }}
          >
            {store.name}
          </p>
          {store.genre && (
            <span
              className="inline-block text-[10px] px-2 py-0.5 rounded-full mt-1"
              style={{
                background: "var(--amber-tint)",
                color: "var(--amber-dk)",
              }}
            >
              {store.genre}
            </span>
          )}
          {store.address && (
            <p className="text-[12px] mt-1.5 leading-snug" style={{ color: "var(--ink-70)" }}>
              {store.address}
            </p>
          )}
          {store.hours && (
            <p
              className="text-[11px] mt-1"
              style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
            >
              ⏱ {store.hours}
            </p>
          )}
        </div>
      </div>

      {store.google_maps_url && (
        <a
          href={store.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-[12px] font-medium"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          <span>📍</span>
          Google マップで開く
        </a>
      )}
    </div>
  );
}

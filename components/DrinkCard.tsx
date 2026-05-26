import type { Drink } from "@/types";

type Props = {
  drink: Drink;
  recorded?: boolean;
  onClick?: () => void;
};

export default function DrinkCard({ drink, recorded = false, onClick }: Props) {
  const specLine = [
    drink.seimaibuai != null ? `精米 ${drink.seimaibuai}%` : null,
    drink.alcohol != null ? `ALC ${drink.alcohol}%` : null,
  ]
    .filter(Boolean)
    .join(" · ") || null;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 text-left transition-all duration-150"
      style={{
        background: "var(--paper-2)",
        border: "1px solid var(--ink-08)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "var(--sh-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Thumbnail */}
      {drink.photo_url ? (
        <img
          src={drink.photo_url}
          alt={drink.name}
          className="flex-shrink-0 rounded-lg object-contain"
          style={{ width: 40, height: 48 }}
        />
      ) : (
        <div
          className="flex-shrink-0 rounded-lg"
          style={{
            width: 40,
            height: 48,
            background:
              "repeating-linear-gradient(45deg, var(--canvas), var(--canvas) 4px, var(--paper) 4px, var(--paper) 8px)",
          }}
        />
      )}

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[14px] font-bold leading-snug truncate"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          {drink.name}
        </p>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--ink-50)" }}>
          {drink.genre}
        </p>
        {specLine && (
          <p
            className="text-[10px] mt-0.5 truncate"
            style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
          >
            {specLine}
          </p>
        )}
      </div>

      {/* Recorded badge + chevron */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {recorded && (
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{
              border: "1px solid var(--amber)",
              color: "var(--amber-dk)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ✓
          </span>
        )}
        <span style={{ color: "var(--ink-20)", fontSize: 16 }}>›</span>
      </div>
    </button>
  );
}

type Genre = "sake" | "wine" | "beer";

const GENRES: { key: Genre; label: string; emoji: string }[] = [
  { key: "sake", label: "日本酒", emoji: "🍶" },
  { key: "wine", label: "ワイン", emoji: "🍷" },
  { key: "beer", label: "ビール", emoji: "🍺" },
];

type Props = {
  activeGenres: Set<Genre>;
  onChange: (genres: Set<Genre>) => void;
};

export default function GenreChips({ activeGenres, onChange }: Props) {
  function toggle(genre: Genre) {
    const next = new Set(activeGenres);
    if (next.has(genre)) {
      next.delete(genre);
    } else {
      next.add(genre);
    }
    onChange(next);
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
    >
      {GENRES.map(({ key, label, emoji }) => {
        const active = activeGenres.has(key);
        return (
          <button
            key={key}
            onClick={() => toggle(key)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all"
            style={
              active
                ? {
                    background: "var(--ink)",
                    color: "var(--paper)",
                    fontWeight: 600,
                    border: "1px solid transparent",
                  }
                : {
                    background: "var(--paper-2)",
                    color: "var(--ink-70)",
                    border: "1px solid var(--ink-12)",
                  }
            }
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

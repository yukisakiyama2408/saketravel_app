"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getRecordsByUser } from "@/lib/data";
import type { RecordWithJoin } from "@/types";

type GenreFilter = "all" | "sake" | "wine" | "beer" | "shochu";

const GENRE_CHIPS: { key: GenreFilter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "sake", label: "🍶 日本酒" },
  { key: "wine", label: "🍷 ワイン" },
  { key: "beer", label: "🍺 ビール" },
  { key: "shochu", label: "🥃 焼酎" },
];

const GENRE_EMOJI: Record<string, string> = {
  sake: "🍶",
  wine: "🍷",
  beer: "🍺",
  shochu: "🥃",
};

const GENRE_COLORS: Record<string, { tint: string; accent: string }> = {
  sake: { tint: "#E7F0EC", accent: "#5C8A66" },
  wine: { tint: "#EEF1F6", accent: "#4E6E8E" },
  beer: { tint: "#F7EFD9", accent: "#C8893D" },
  shochu: { tint: "#F2E8DD", accent: "#A86F28" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  "日本": "🇯🇵",
  "フランス": "🇫🇷",
  "アメリカ": "🇺🇸",
  "チェコ": "🇨🇿",
  "イタリア": "🇮🇹",
  "スペイン": "🇪🇸",
  "ドイツ": "🇩🇪",
  "イギリス": "🇬🇧",
};

export default function RecordsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<RecordWithJoin[]>([]);
  const [activeGenre, setActiveGenre] = useState<GenreFilter>("all");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/auth/login"); return; }
    getRecordsByUser(user.id).then((data) => {
      setRecords(data.sort((a, b) => b.date.localeCompare(a.date)));
      setFetching(false);
    });
  }, [user, loading, router]);

  const filtered = useMemo(() => {
    if (activeGenre === "all") return records;
    return records.filter((r) => r.drinks.genre_category === activeGenre);
  }, [records, activeGenre]);

  const grouped = useMemo(() => {
    const map = new Map<string, RecordWithJoin[]>();
    for (const r of filtered) {
      const key = r.date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--canvas)" }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-10 px-5 pt-12 pb-3"
        style={{
          background: "var(--paper)",
          borderBottom: "1px solid var(--ink-08)",
        }}
      >
        <p
          className="text-[11px] uppercase tracking-widest mb-1"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
        >
          MY JOURNAL
        </p>
        <div className="flex items-baseline justify-between">
          <h1
            className="text-[26px] font-bold"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
          >
            記録
          </h1>
          <span
            className="text-[18px]"
            style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
          >
            {filtered.length}
          </span>
        </div>

        {/* Genre filter chips */}
        <div
          className="flex gap-2 mt-3 pb-1 overflow-x-auto -mx-5 px-5"
          style={{ scrollbarWidth: "none" }}
        >
          {GENRE_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveGenre(chip.key)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium"
              style={
                activeGenre === chip.key
                  ? {
                      background: "var(--ink)",
                      color: "var(--amber-lt)",
                      fontWeight: 600,
                    }
                  : {
                      background: "var(--paper-2)",
                      color: "var(--ink-70)",
                      border: "1px solid var(--ink-08)",
                    }
              }
            >
              {chip.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="px-5 pt-4 pb-24">
        {fetching ? (
          <div className="pt-16 text-center">
            <p className="text-sm" style={{ color: "var(--ink-35)" }}>
              読み込み中…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="pt-16 text-center">
            <p className="text-3xl mb-3">🍶</p>
            <p className="text-sm" style={{ color: "var(--ink-50)" }}>
              まだ記録がありません
            </p>
            <Link
              href="/"
              className="block mt-4 text-sm font-medium"
              style={{ color: "var(--amber)" }}
            >
              地図を探索する →
            </Link>
          </div>
        ) : (
          grouped.map(([monthKey, monthRecords]) => {
            const [year, month] = monthKey.split("-");
            return (
              <div key={monthKey} className="mb-6">
                {/* Month header */}
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="text-[11px] uppercase tracking-widest"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--ink-50)",
                    }}
                  >
                    {year} / {month}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--ink-35)",
                    }}
                  >
                    {monthRecords.length}件
                  </p>
                </div>

                {/* Record cards */}
                <ul className="grid gap-3 md:grid-cols-2">
                  {monthRecords.map((rec) => {
                    const genre = rec.drinks.genre_category ?? "sake";
                    const emoji = GENRE_EMOJI[genre] ?? "🍶";
                    const colors = GENRE_COLORS[genre] ?? GENRE_COLORS.sake;
                    const flag =
                      COUNTRY_FLAGS[rec.regions.country] ?? "🌍";

                    return (
                      <li key={rec.id}>
                        <Link
                          href={`/?drink=${rec.drink_id}`}
                          className="block h-full overflow-hidden rounded-lg transition-transform active:scale-[0.99]"
                          style={{
                            background: "var(--paper-2)",
                            border: "1px solid var(--ink-08)",
                            boxShadow: "var(--sh-1)",
                          }}
                        >
                          <div className="grid grid-cols-[94px_1fr] gap-4 p-4">
                            <div
                              className="grid min-h-[132px] place-items-center rounded-md"
                              style={{ background: colors.tint }}
                            >
                              {rec.drinks.photo_url ? (
                                <img
                                  src={rec.drinks.photo_url}
                                  alt={rec.drinks.name}
                                  className="h-[118px] max-w-[74px] object-contain drop-shadow-sm"
                                />
                              ) : (
                                <BottlePlaceholder
                                  label={rec.drinks.genre}
                                  accent={colors.accent}
                                />
                              )}
                            </div>

                            <div className="min-w-0 py-1">
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <span
                                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                  style={{
                                    background: colors.tint,
                                    color: colors.accent,
                                  }}
                                >
                                  {emoji} {rec.drinks.genre}
                                </span>
                                <span
                                  className="text-[11px] flex-shrink-0"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--ink-35)",
                                  }}
                                >
                                  {new Date(rec.date).toLocaleDateString("ja-JP", {
                                    month: "numeric",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>

                              <p
                                className="text-[20px] font-bold leading-tight"
                                style={{
                                  fontFamily: "var(--font-serif)",
                                  color: "var(--ink)",
                                }}
                              >
                                {rec.drinks.name}
                              </p>
                              {rec.drinks.name_kana && (
                                <p
                                  className="mt-1 text-[11px] truncate"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--ink-35)",
                                  }}
                                >
                                  {rec.drinks.name_kana}
                                </p>
                              )}
                              <p
                                className="mt-3 text-xs"
                                style={{ color: "var(--ink-50)" }}
                              >
                                {flag} {rec.regions.country} / {rec.regions.name}
                              </p>
                            </div>
                          </div>

                          {rec.memo && (
                            <p
                              className="border-t px-4 py-3 text-xs leading-relaxed"
                              style={{
                                borderColor: "var(--ink-08)",
                                color: "var(--ink-70)",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical" as const,
                                overflow: "hidden",
                              }}
                            >
                              {rec.memo}
                            </p>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function BottlePlaceholder({
  label,
  accent,
}: {
  label: string;
  accent: string;
}) {
  return (
    <div className="relative" style={{ width: 58, height: 126 }}>
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-t-sm"
        style={{
          width: 20,
          height: 31,
          background: accent,
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-md"
        style={{
          width: 58,
          height: 103,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.46), rgba(255,255,255,0.1) 35%, rgba(13,27,42,0.08))",
          border: `2px solid ${accent}`,
        }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-sm px-1"
        style={{
          bottom: 28,
          width: 46,
          minHeight: 36,
          background: "var(--paper-2)",
          border: "1px solid var(--ink-08)",
        }}
      >
        <p
          className="py-1 text-center text-[11px] font-bold leading-tight"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

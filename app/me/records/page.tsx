"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getRecordsByUser } from "@/lib/data";
import type { RecordWithJoin } from "@/types";

type GenreFilter = "all" | "sake" | "wine" | "beer";

const GENRE_CHIPS: { key: GenreFilter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "sake", label: "🍶 日本酒" },
  { key: "wine", label: "🍷 ワイン" },
  { key: "beer", label: "🍺 ビール" },
];

const GENRE_EMOJI: Record<string, string> = {
  sake: "🍶",
  wine: "🍷",
  beer: "🍺",
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
                <ul className="space-y-2">
                  {monthRecords.map((rec) => {
                    const genre = rec.drinks.genre_category ?? "sake";
                    const emoji = GENRE_EMOJI[genre] ?? "🍶";
                    const flag =
                      COUNTRY_FLAGS[rec.regions.country] ?? "🌍";

                    return (
                      <li key={rec.id}>
                        <Link
                          href={`/drinks/${rec.drink_id}`}
                          className="flex items-start gap-3 rounded-xl px-3 py-3"
                          style={{
                            background: "var(--paper-2)",
                            border: "1px solid var(--ink-08)",
                          }}
                        >
                          {/* Genre emoji icon */}
                          <div
                            className="flex-shrink-0 flex items-center justify-center text-xl rounded-xl"
                            style={{
                              width: 44,
                              height: 44,
                              background: "var(--amber-tint)",
                            }}
                          >
                            {emoji}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className="text-[15px] font-bold leading-tight truncate"
                                style={{
                                  fontFamily: "var(--font-serif)",
                                  color: "var(--ink)",
                                }}
                              >
                                {rec.drinks.name}
                              </p>
                              <p
                                className="text-[10px] flex-shrink-0 mt-0.5"
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--ink-35)",
                                }}
                              >
                                {new Date(rec.date).toLocaleDateString("ja-JP", {
                                  month: "numeric",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                            <p
                              className="text-[11px] mt-0.5"
                              style={{ color: "var(--ink-50)" }}
                            >
                              {flag} {rec.regions.name} · {rec.drinks.genre}
                            </p>
                            {rec.memo && (
                              <p
                                className="text-xs mt-1 leading-relaxed"
                                style={{
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
                          </div>
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

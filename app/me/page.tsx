"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getRecordsByUser } from "@/lib/data";
import type { RecordWithJoin } from "@/types";

const GENRE_LABELS: Record<string, { label: string; emoji: string }> = {
  sake: { label: "日本酒", emoji: "🍶" },
  wine: { label: "ワイン", emoji: "🍷" },
  beer: { label: "ビール", emoji: "🍺" },
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

const MENU_ITEMS = [
  { label: "飲みたいリスト", icon: "♡" },
  { label: "お気に入り", icon: "☆" },
  { label: "要望・不具合を報告", icon: "!", href: "/feedback" },
  { label: "アカウント設定", icon: "⚙" },
  { label: "通知", icon: "◎" },
  { label: "言語", icon: "◈" },
];

export default function MyPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<RecordWithJoin[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/auth/login"); return; }
    getRecordsByUser(user.id).then((data) => {
      setRecords(data.sort((a, b) => b.date.localeCompare(a.date)));
    });
  }, [user, loading, router]);

  const stats = useMemo(() => {
    const regionCount = new Set(records.map((r) => r.region_id)).size;
    const countryCount = new Set(records.map((r) => r.regions.country)).size;
    const genreCount = new Set(
      records.map((r) => r.drinks.genre_category).filter(Boolean)
    ).size;
    return { regionCount, countryCount, genreCount };
  }, [records]);

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = { sake: 0, wine: 0, beer: 0 };
    for (const r of records) {
      const g = r.drinks.genre_category;
      if (g && g in counts) counts[g]++;
    }
    return counts;
  }, [records]);

  const recentRecords = records.slice(0, 2);

  const displayName =
    user?.user_metadata?.display_name ??
    user?.email?.split("@")[0] ??
    "ユーザー";

  const initial = displayName.charAt(0).toUpperCase();

  const registeredAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
      })
    : "";

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--canvas)" }}>
      {/* Header */}
      <header
        className="px-5 pt-12 pb-4 flex items-end justify-between"
        style={{
          background: "var(--paper)",
          borderBottom: "1px solid var(--ink-08)",
        }}
      >
        <p
          className="text-[11px] uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
        >
          MY PAGE
        </p>
        <button
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            background: "var(--ink-04)",
            borderRadius: 18,
          }}
          title="設定（準備中）"
        >
          <GearIcon />
        </button>
      </header>

      <div className="px-5 pb-24">
        {/* Profile */}
        <div className="flex items-center gap-4 py-5">
          {/* Avatar */}
          <div
            className="flex-shrink-0 flex items-center justify-center text-xl font-bold text-white rounded-full"
            style={{
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, var(--amber) 0%, var(--amber-dk) 100%)",
            }}
          >
            {initial}
          </div>
          <div>
            <p
              className="text-[17px] font-bold"
              style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
            >
              {displayName}
            </p>
            <p
              className="text-[11px] mt-0.5"
              style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
            >
              {registeredAt}から旅を続けています
            </p>
          </div>
        </div>

        {/* Journey card */}
        <div
          className="relative rounded-2xl p-5 overflow-hidden mb-4"
          style={{ background: "var(--ink)" }}
        >
          {/* Decoration */}
          <div
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(200,137,61,0.25) 0%, transparent 70%)",
            }}
          />

          <p
            className="text-[10px] uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-mono)", color: "var(--amber-lt)" }}
          >
            旅の進捗 ─ MY JOURNEY
          </p>

          <div className="flex items-baseline gap-1 mb-4">
            <span
              className="text-[40px] font-bold leading-none"
              style={{ fontFamily: "var(--font-mono)", color: "var(--amber-lt)" }}
            >
              {records.length}
            </span>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              件の記録
            </span>
          </div>

          <div className="flex">
            {[
              { label: "地域数", value: stats.regionCount },
              { label: "国数", value: stats.countryCount },
              { label: "ジャンル", value: stats.genreCount },
            ].map((s, i) => (
              <div
                key={s.label}
                className="flex-1 text-center"
                style={{
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : undefined,
                }}
              >
                <p
                  className="text-[22px] font-bold leading-none"
                  style={{ fontFamily: "var(--font-mono)", color: "white" }}
                >
                  {s.value}
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Genre breakdown */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "var(--paper-2)",
            border: "1px solid var(--ink-08)",
          }}
        >
          <p
            className="text-[11px] uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
          >
            ジャンル別
          </p>
          <div className="space-y-3">
            {Object.entries(GENRE_LABELS).map(([key, { label, emoji }]) => {
              const count = genreCounts[key] ?? 0;
              const pct = records.length > 0 ? (count / records.length) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: "var(--ink-70)" }}>
                      {emoji} {label}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--ink-35)",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{ height: 4, background: "var(--ink-08)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: "var(--amber)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent records */}
        {recentRecords.length > 0 && (
          <div
            className="rounded-2xl p-5 mb-4"
            style={{
              background: "var(--paper-2)",
              border: "1px solid var(--ink-08)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p
                className="text-[11px] uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
              >
                最近の記録
              </p>
              <Link
                href="/me/records"
                className="text-xs font-medium"
                style={{ color: "var(--amber)" }}
              >
                すべて見る →
              </Link>
            </div>
            <div className="space-y-3">
              {recentRecords.map((rec) => {
                const flag =
                  COUNTRY_FLAGS[rec.regions.country] ?? "🌍";
                return (
                  <Link
                    key={rec.id}
                    href={`/?drink=${rec.drink_id}`}
                    className="flex items-start gap-3"
                  >
                    {/* 縦罫線 */}
                    <div
                      className="flex-shrink-0 w-0.5 self-stretch rounded-full mt-0.5"
                      style={{ background: "var(--amber)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-sm font-bold truncate"
                          style={{
                            fontFamily: "var(--font-serif)",
                            color: "var(--ink)",
                          }}
                        >
                          {rec.drinks.name}
                        </p>
                        <p
                          className="text-[10px] flex-shrink-0"
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
                        {flag} {rec.regions.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu list */}
        <div
          className="rounded-2xl overflow-hidden mb-4"
          style={{
            background: "var(--paper-2)",
            border: "1px solid var(--ink-08)",
          }}
        >
          {MENU_ITEMS.map((item, i) => {
            const content = (
              <>
                <span className="flex items-center gap-3">
                  <span style={{ color: "var(--ink-35)", fontSize: 16, lineHeight: 1 }}>
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                <span style={{ color: "var(--ink-20)" }}>›</span>
              </>
            );

            const className = "w-full flex items-center justify-between px-5 py-3.5 text-sm";
            const style = {
              borderTop: i > 0 ? "1px solid var(--ink-04)" : undefined,
              color: "var(--ink-70)",
            };

            return item.href ? (
              <Link key={item.label} href={item.href} className={className} style={style}>
                {content}
              </Link>
            ) : (
              <button
              key={item.label}
              className={className}
              style={style}
            >
                {content}
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 text-sm font-medium rounded-2xl mb-6"
          style={{
            border: "1px solid var(--ink-12)",
            color: "var(--ink-70)",
          }}
        >
          ログアウト
        </button>

        {/* Footer */}
        <p
          className="text-center text-[11px]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-20)" }}
        >
          SAKEMAP · v1.0
        </p>
      </div>
    </div>
  );
}

function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--ink-50)" }}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

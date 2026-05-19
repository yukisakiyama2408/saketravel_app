"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getRecordsByUser } from "@/lib/data";
import DrinkCard from "@/components/DrinkCard";
import StoreCard from "@/components/StoreCard";
import type { Region, Drink, Store } from "@/types";

type Tab = "climate" | "food" | "drinks";

const TABS: { key: Tab; label: string }[] = [
  { key: "climate", label: "気候・地形" },
  { key: "food", label: "食文化" },
  { key: "drinks", label: "この地域のお酒" },
];

type Props = {
  region: Region;
  drinks: Drink[];
  stores: Store[];
};

export default function RegionDetailClient({ region, drinks, stores }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("climate");
  const [userRecordCount, setUserRecordCount] = useState(0);
  const [recordedDrinkIds, setRecordedDrinkIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    getRecordsByUser(user.id).then((records) => {
      const regionRecords = records.filter((r) => r.region_id === region.id);
      setUserRecordCount(regionRecords.length);
      setRecordedDrinkIds(new Set(records.map((r) => r.drink_id)));
    });
  }, [user, region.id]);

  const uniqueGenreCount = new Set(
    drinks.map((d) => d.genre_category ?? d.genre)
  ).size;

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "var(--canvas)" }}
    >
      {/* ── Header 88px ── */}
      <header
        className="sticky top-0 z-10 flex items-end px-5 pb-3"
        style={{
          height: 88,
          background: "rgba(248,243,236,0.96)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--ink-08)",
        }}
      >
        <Link
          href="/"
          className="text-sm font-medium flex items-center gap-1"
          style={{ color: "var(--amber)" }}
        >
          ← マップに戻る
        </Link>
        <button
          className="ml-auto w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "var(--ink-04)" }}
          title="お気に入り（準備中）"
        >
          <StarIcon />
        </button>
      </header>

      {/* ── Hero 200px ── */}
      <div
        className="relative"
        style={{
          height: 200,
          background:
            "linear-gradient(160deg, #2a1200 0%, #1a0c00 55%, #0D1B2A 100%)",
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <p
            className="text-[11px] uppercase tracking-widest mb-1.5"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgba(200,137,61,0.75)",
            }}
          >
            {region.country}
          </p>
          <h1
            className="text-[32px] font-bold leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: "white" }}
          >
            {region.name}
          </h1>
          <p
            className="text-[11px] mt-1.5"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            {Math.abs(region.latitude).toFixed(2)}°
            {region.latitude >= 0 ? "N" : "S"},{" "}
            {Math.abs(region.longitude).toFixed(2)}°
            {region.longitude >= 0 ? "E" : "W"}
          </p>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div
        className="flex"
        style={{
          background: "var(--paper)",
          borderBottom: "1px solid var(--ink-08)",
        }}
      >
        {[
          { label: "銘柄数", value: drinks.length, unit: "銘柄" },
          { label: "ジャンル", value: uniqueGenreCount, unit: "種" },
          { label: "あなたの記録", value: userRecordCount, unit: "件" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="flex-1 py-4 text-center"
            style={{
              borderRight: i < 2 ? "1px solid var(--ink-08)" : undefined,
            }}
          >
            <p
              className="text-[22px] font-bold leading-none"
              style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}
            >
              {stat.value}
            </p>
            <p className="text-[10px] mt-1" style={{ color: "var(--ink-50)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex px-5 sticky z-10"
        style={{
          top: 88,
          background: "var(--paper)",
          borderBottom: "1px solid var(--ink-08)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="text-sm pb-2.5 pt-3 mr-5 transition-colors"
            style={{
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--amber)"
                  : "2px solid transparent",
              color: activeTab === tab.key ? "var(--ink)" : "var(--ink-50)",
              fontWeight: activeTab === tab.key ? 600 : 400,
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="px-5 pt-5 pb-24">
        {activeTab === "climate" && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--ink-70)" }}
          >
            {region.climate ?? "情報準備中"}
          </p>
        )}

        {activeTab === "food" && (
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--ink-70)" }}
          >
            {region.food_culture ?? "情報準備中"}
          </p>
        )}

        {activeTab === "drinks" && (
          <>
            {drinks.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--ink-35)" }}>
                銘柄データなし
              </p>
            ) : (
              <ul className="space-y-2 mb-8">
                {drinks.map((d) => (
                  <li key={d.id}>
                    <Link href={`/drinks/${d.id}`}>
                      <DrinkCard drink={d} recorded={recordedDrinkIds.has(d.id)} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {stores.length > 0 && (
              <div>
                <p
                  className="text-[11px] uppercase tracking-widest mb-3"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink-50)",
                  }}
                >
                  国内で楽しめる店
                </p>
                <ul className="space-y-2">
                  {stores.map((s) => (
                    <li key={s.id}>
                      <StoreCard store={s} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StarIcon() {
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
      style={{ color: "var(--ink-35)" }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

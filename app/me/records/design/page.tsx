"use client";

import { useState } from "react";
import Link from "next/link";

type MockRecord = {
  id: string;
  drink: string;
  kana: string;
  genre: string;
  region: string;
  country: string;
  date: string;
  memo: string;
  tint: string;
  accent: string;
};

const records: MockRecord[] = [
  {
    id: "1",
    drink: "越乃寒梅 純米吟醸",
    kana: "こしのかんばい",
    genre: "日本酒",
    region: "新潟",
    country: "日本",
    date: "6/8",
    memo: "淡麗で、余韻がすっと切れる。魚料理と合わせたい。",
    tint: "#E7F0EC",
    accent: "#5C8A66",
  },
  {
    id: "2",
    drink: "Chablis 1er Cru",
    kana: "シャブリ",
    genre: "ワイン",
    region: "ブルゴーニュ",
    country: "フランス",
    date: "6/2",
    memo: "ミネラル感が強く、酸がきれい。冷菜に良さそう。",
    tint: "#EEF1F6",
    accent: "#4E6E8E",
  },
  {
    id: "3",
    drink: "Pilsner Urquell",
    kana: "ピルスナーウルケル",
    genre: "ビール",
    region: "プルゼニ",
    country: "チェコ",
    date: "5/28",
    memo: "苦味が主役。麦の甘さも残る。",
    tint: "#F7EFD9",
    accent: "#C8893D",
  },
];

const stats = [
  { label: "記録", value: "42" },
  { label: "銘柄", value: "31" },
  { label: "国", value: "8" },
];

type DesignOption = "a" | "b" | "c";

const OPTIONS: { key: DesignOption; label: string; title: string }[] = [
  { key: "a", label: "A", title: "ボトル主役カード" },
  { key: "b", label: "B", title: "月別ショーケース" },
  { key: "c", label: "C", title: "密度高めの銘柄リスト" },
];

export default function RecordsDesignPage() {
  const [activeOption, setActiveOption] = useState<DesignOption>("c");

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--canvas)" }}>
      <header
        className="sticky top-0 z-20 px-5 pt-10 pb-4"
        style={{
          background: "rgba(251,248,241,0.94)",
          borderBottom: "1px solid var(--ink-08)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Link href="/me/records" className="text-xs font-medium" style={{ color: "var(--amber)" }}>
          ← 記録に戻る
        </Link>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p
              className="mb-1 text-[11px] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
            >
              DESIGN OPTIONS
            </p>
            <h1
              className="text-[27px] font-bold leading-tight"
              style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
            >
              記録UI デザイン案
            </h1>
          </div>
          <div className="flex gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="min-w-12 rounded-lg px-2.5 py-1.5 text-center"
                style={{ background: "var(--paper-2)", border: "1px solid var(--ink-08)" }}
              >
                <p className="text-sm font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                  {stat.value}
                </p>
                <p className="text-[9px]" style={{ color: "var(--ink-35)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div
          className="mt-4 grid grid-cols-3 gap-2 rounded-lg p-1"
          style={{ background: "var(--ink-04)", border: "1px solid var(--ink-08)" }}
        >
          {OPTIONS.map((option) => {
            const active = activeOption === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setActiveOption(option.key)}
                className="min-w-0 rounded-md px-2 py-2 text-left transition-colors"
                style={{
                  background: active ? "var(--paper-2)" : "transparent",
                  boxShadow: active ? "var(--sh-1)" : undefined,
                }}
              >
                <span
                  className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold"
                  style={{
                    background: active ? "var(--ink)" : "rgba(13,27,42,0.08)",
                    color: active ? "var(--amber-lt)" : "var(--ink-50)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {option.label}
                </span>
                <span
                  className="align-middle text-[11px] font-semibold md:text-xs"
                  style={{ color: active ? "var(--ink)" : "var(--ink-50)" }}
                >
                  {option.title}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] px-4 py-5 pb-24 md:px-6">
        {activeOption === "a" && (
          <DesignSection
            label="A"
            title="ボトル主役カード"
            note="一覧の中で銘柄名とボトル形状を一番大きく見せる案。写真登録が増えた時に最も映える。"
          >
            <div className="grid gap-3 md:grid-cols-3">
              {records.map((record) => (
                <BottleHeroCard key={record.id} record={record} />
              ))}
            </div>
          </DesignSection>
        )}

        {activeOption === "b" && (
          <DesignSection
            label="B"
            title="月別ショーケース"
            note="月ごとの代表記録を大きく置き、他の記録を横に流す案。日記感とコレクション感が強い。"
          >
            <div className="grid gap-3 lg:grid-cols-[1.08fr_1fr]">
              <ShowcaseRecord record={records[0]} />
              <div className="grid gap-3 sm:grid-cols-2">
                {records.slice(1).map((record) => (
                  <ShelfCard key={record.id} record={record} />
                ))}
              </div>
            </div>
          </DesignSection>
        )}

        {activeOption === "c" && (
          <DesignSection
            label="C"
            title="密度高めの銘柄リスト"
            note="記録数が多いユーザー向け。各行の先頭を酒ラベル風にして、一覧性を保ちながらお酒を目立たせる。"
          >
            <div className="rounded-lg" style={{ background: "var(--paper-2)", border: "1px solid var(--ink-08)" }}>
              {records.map((record, index) => (
                <DenseDrinkRow key={record.id} record={record} divided={index < records.length - 1} />
              ))}
            </div>
          </DesignSection>
        )}
      </main>
    </div>
  );
}

function DesignSection({
  label,
  title,
  note,
  children,
}: {
  label: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold"
            style={{ background: "var(--ink)", color: "var(--amber-lt)", fontFamily: "var(--font-mono)" }}
          >
            {label}
          </span>
          <div>
            <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
              {title}
            </h2>
            <p className="mt-0.5 max-w-[720px] text-xs leading-relaxed" style={{ color: "var(--ink-50)" }}>
              {note}
            </p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function BottleHeroCard({ record }: { record: MockRecord }) {
  return (
    <Link
      href="/?drink=preview"
      className="block overflow-hidden rounded-lg"
      style={{ background: "var(--paper-2)", border: "1px solid var(--ink-08)", boxShadow: "var(--sh-1)" }}
    >
      <div className="grid grid-cols-[96px_1fr] gap-4 p-4">
        <BottleMark record={record} large />
        <div className="min-w-0 py-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: record.tint, color: record.accent }}
            >
              {record.genre}
            </span>
            <span className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}>
              {record.date}
            </span>
          </div>
          <p
            className="text-[20px] font-bold leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
          >
            {record.drink}
          </p>
          <p className="mt-1 text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}>
            {record.kana}
          </p>
          <p className="mt-3 text-xs" style={{ color: "var(--ink-50)" }}>
            {record.country} / {record.region}
          </p>
        </div>
      </div>
      <p className="border-t px-4 py-3 text-xs leading-relaxed" style={{ borderColor: "var(--ink-08)", color: "var(--ink-70)" }}>
        {record.memo}
      </p>
    </Link>
  );
}

function ShowcaseRecord({ record }: { record: MockRecord }) {
  return (
    <Link
      href="/?drink=preview"
      className="grid min-h-[260px] overflow-hidden rounded-lg md:grid-cols-[150px_1fr]"
      style={{ background: "var(--paper-2)", border: "1px solid var(--ink-08)", boxShadow: "var(--sh-2)" }}
    >
      <div className="grid place-items-center p-5" style={{ background: record.tint }}>
        <BottleMark record={record} displayName />
      </div>
      <div className="flex min-w-0 flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}>
            2026 / 06
          </p>
          <p className="text-[12px] font-semibold" style={{ color: record.accent }}>
            Latest
          </p>
        </div>
        <p className="text-[28px] font-bold leading-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
          {record.drink}
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-50)" }}>
          {record.genre} · {record.country} / {record.region}
        </p>
        <p className="mt-auto pt-5 text-sm leading-relaxed" style={{ color: "var(--ink-70)" }}>
          {record.memo}
        </p>
      </div>
    </Link>
  );
}

function ShelfCard({ record }: { record: MockRecord }) {
  return (
    <Link
      href="/?drink=preview"
      className="grid grid-cols-[72px_1fr] gap-3 rounded-lg p-3"
      style={{ background: "var(--paper-2)", border: "1px solid var(--ink-08)" }}
    >
      <div className="grid place-items-center rounded-md py-3" style={{ background: record.tint }}>
        <BottleMark record={record} small />
      </div>
      <div className="min-w-0">
        <p className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}>
          {record.date} / {record.genre}
        </p>
        <p className="mt-1 text-base font-bold leading-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
          {record.drink}
        </p>
        <p className="mt-2 text-xs" style={{ color: "var(--ink-50)" }}>
          {record.country} / {record.region}
        </p>
      </div>
    </Link>
  );
}

function DenseDrinkRow({ record, divided }: { record: MockRecord; divided: boolean }) {
  return (
    <Link
      href="/?drink=preview"
      className="grid grid-cols-[74px_1fr_auto] items-center gap-3 px-3 py-3"
      style={{ borderBottom: divided ? "1px solid var(--ink-08)" : undefined }}
    >
      <div
        className="flex h-14 items-center justify-center rounded-md px-2 text-center"
        style={{ background: record.tint, color: record.accent }}
      >
        <p className="text-[13px] font-bold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
          {record.genre}
        </p>
      </div>
      <div className="min-w-0">
        <p className="truncate text-[17px] font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
          {record.drink}
        </p>
        <p className="mt-0.5 truncate text-xs" style={{ color: "var(--ink-50)" }}>
          {record.country} / {record.region} · {record.memo}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>
          {record.date}
        </p>
        <p className="text-[10px]" style={{ color: "var(--ink-35)" }}>
          飲んだ
        </p>
      </div>
    </Link>
  );
}

function BottleMark({
  record,
  large = false,
  small = false,
  displayName = false,
}: {
  record: MockRecord;
  large?: boolean;
  small?: boolean;
  displayName?: boolean;
}) {
  const width = small ? 28 : large ? 58 : 74;
  const height = small ? 70 : large ? 126 : 168;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height }}>
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 rounded-t-sm"
          style={{
            width: width * 0.34,
            height: height * 0.24,
            background: record.accent,
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-md"
          style={{
            width,
            height: height * 0.82,
            background: "linear-gradient(90deg, rgba(255,255,255,0.46), rgba(255,255,255,0.1) 35%, rgba(13,27,42,0.08))",
            border: `2px solid ${record.accent}`,
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-sm px-1"
          style={{
            bottom: height * 0.22,
            width: width * 0.78,
            minHeight: height * 0.28,
            background: "var(--paper-2)",
            border: "1px solid var(--ink-08)",
          }}
        >
          <p
            className="py-1 text-center font-bold leading-tight"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--ink)",
              fontSize: small ? 8 : large ? 11 : 13,
            }}
          >
            {record.genre}
          </p>
        </div>
      </div>
      {displayName && (
        <p className="mt-3 text-center text-xs font-semibold" style={{ color: record.accent }}>
          {record.genre}
        </p>
      )}
    </div>
  );
}

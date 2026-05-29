"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getRecordsByDrink } from "@/lib/data";
import StoreCard from "@/components/StoreCard";
import LoginModal from "@/components/LoginModal";
import RecordModal from "@/components/RecordModal";
import EditRecordModal from "@/components/EditRecordModal";
import type { Drink, DrinkRecord, Region, Store } from "@/types";
import { GENRE_SPECS } from "@/lib/drinkSpecs";

type Props = {
  drink: Drink & { region: Region };
  stores: Store[];
};

export default function DrinkPageClient({ drink, stores }: Props) {
  const { user } = useAuth();
  const [drinkRecords, setDrinkRecords] = useState<DrinkRecord[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DrinkRecord | null>(null);

  useEffect(() => {
    let ignore = false;
    const records = user
      ? getRecordsByDrink(drink.id, user.id)
      : Promise.resolve([]);

    records.then((nextRecords) => {
      if (!ignore) setDrinkRecords(nextRecords);
    });

    return () => {
      ignore = true;
    };
  }, [user, drink.id]);

  const isRecorded = drinkRecords.length > 0;
  const specDefs = GENRE_SPECS[drink.genre] ?? [];
  const specItems = specDefs.filter(({ key }) => drink.specs?.[key]);

  function refreshRecords() {
    if (!user) return;
    getRecordsByDrink(drink.id, user.id).then(setDrinkRecords);
  }

  return (
    <>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showRecordModal && (
        <RecordModal
          drink={drink}
          onClose={() => setShowRecordModal(false)}
          onSaved={refreshRecords}
        />
      )}
      {editingRecord && (
        <EditRecordModal
          record={editingRecord}
          drinkName={drink.name}
          onClose={() => setEditingRecord(null)}
          onSave={refreshRecords}
          onDelete={refreshRecords}
        />
      )}

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
            ← 戻る
          </Link>
          <button
            className="ml-auto w-9 h-9 flex items-center justify-center rounded-full"
            style={{ background: "var(--ink-04)" }}
            title="お気に入り（準備中）"
          >
            <StarIcon />
          </button>
        </header>

        <main className="mx-auto w-full max-w-[940px] px-5 pt-5 pb-24 md:px-8 md:pt-9">
          <p
            className="text-[11px] mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--ink-50)",
            }}
          >
            {drink.region.name} / {drink.genre}
          </p>

          <h1
            className="text-[28px] font-bold leading-tight mb-1 md:text-[38px]"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
          >
            {drink.name}
          </h1>

          <p
            className="text-[11px] mb-4"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--ink-50)",
            }}
          >
            {drink.name_kana && `${drink.name_kana} · `}
            {drink.region.country}
          </p>

          <div
            className="grid grid-cols-[86px_1fr] gap-4 items-start p-4 md:grid-cols-[190px_1fr] md:gap-6 md:p-[22px]"
            style={{
              background: "var(--washi)",
              border: "1px solid var(--ink-08)",
              borderRadius: "var(--r-lg)",
            }}
          >
            <div
              className="aspect-[2/3] w-full flex items-center justify-center overflow-hidden p-2 md:p-3"
              style={{
                background: "rgba(255,255,255,0.36)",
                border: "1px solid var(--ink-04)",
                borderRadius: "var(--r-md)",
              }}
            >
              {drink.photo_url ? (
                <img
                  src={drink.photo_url}
                  alt={drink.name}
                  className="h-full w-full object-contain drop-shadow-md"
                />
              ) : (
                <div
                  className="h-28 w-11 rounded md:h-[158px] md:w-[68px]"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, var(--canvas), var(--canvas) 4px, var(--paper) 4px, var(--paper) 8px)",
                    border: "1px solid var(--ink-08)",
                  }}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span
                  className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: "var(--amber-tint)",
                    border: "1px solid rgba(200,137,61,0.24)",
                    color: "var(--amber-dk)",
                  }}
                >
                  {drink.genre}
                </span>
                {specItems.slice(0, 3).map(({ key, label }) => (
                  <span
                    key={key}
                    className="text-[11px] px-2.5 py-1 rounded-full"
                    style={{
                      background: "var(--paper-2)",
                      border: "1px solid var(--ink-08)",
                      color: "var(--ink-50)",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {specItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3 md:grid-cols-4 md:gap-2.5 md:mb-4">
                  {specItems.map(({ key, label }) => (
                    <div
                      key={key}
                      className="min-w-0 px-2.5 py-2 rounded-[10px]"
                      style={{
                        background: "rgba(255,254,250,0.72)",
                        border: "1px solid var(--ink-08)",
                      }}
                    >
                      <p
                        className="text-[9px] mb-1 truncate md:text-[10px]"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-[12px] font-semibold truncate md:text-[13px]"
                        style={{ color: "var(--ink)" }}
                      >
                        {drink.specs![key]}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {drink.description ? (
                <p
                  className="text-[13px] leading-[1.78] md:text-sm md:leading-[1.9]"
                  style={{ color: "var(--ink-70)" }}
                >
                  {drink.description}
                </p>
              ) : (
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-35)" }}>
                  説明情報準備中
                </p>
              )}
            </div>
          </div>

          {/* ── CTA ── */}
          {isRecorded ? (
            <button
              onClick={() => setShowRecordModal(true)}
              className="w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-5"
              style={{
                background: "var(--success)",
                color: "white",
                borderRadius: "var(--r-lg)",
              }}
            >
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                <path
                  d="M1 5.5L4.5 9L13 1"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              記録済み — もう一杯記録する
            </button>
          ) : (
            <button
              onClick={() => {
                if (!user) setShowLoginModal(true);
                else setShowRecordModal(true);
              }}
              className="w-full py-3 text-sm font-semibold active:opacity-70 mt-5"
              style={{
                background: "var(--amber)",
                color: "var(--paper)",
                borderRadius: "var(--r-lg)",
              }}
            >
              + 飲んだことを記録する
            </button>
          )}

          {/* ── Drink records ── */}
          {drinkRecords.length > 0 && (
            <div className="mt-6">
              <p
                className="text-[11px] uppercase tracking-widest mb-3"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--ink-50)",
                }}
              >
                飲んだ記録
              </p>
              <ul className="space-y-2">
                {drinkRecords.map((rec) => (
                  <li key={rec.id}>
                    <button
                      onClick={() => setEditingRecord(rec)}
                      className="w-full text-left rounded-xl px-4 py-3 transition-colors"
                      style={{
                        border: "1px solid var(--ink-08)",
                        background: "var(--paper-2)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--washi)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "var(--paper-2)")
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className="text-[11px]"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--ink-50)",
                          }}
                        >
                          {new Date(rec.date).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: "var(--ink-35)", flexShrink: 0 }}
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </div>
                      {rec.memo && (
                        <p
                          className="text-xs mt-1 leading-relaxed"
                          style={{ color: "var(--ink-70)" }}
                        >
                          {rec.memo}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Stores ── */}
          {stores.length > 0 && (
            <div className="mt-6">
              <p
                className="text-[11px] uppercase tracking-widest mb-3"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--ink-50)",
                }}
              >
                飲める店
              </p>
              <ul className="grid gap-2 md:grid-cols-2">
                {stores.map((s) => (
                  <li key={s.id}>
                    <StoreCard store={s} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Region link ── */}
          <div
            className="mt-8 rounded-xl px-4 py-3 flex items-center justify-between"
            style={{
              border: "1px solid var(--ink-08)",
              background: "var(--paper-2)",
            }}
          >
            <div>
              <p
                className="text-[10px] uppercase tracking-widest mb-0.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--ink-35)",
                }}
              >
                産地
              </p>
              <p
                className="text-sm font-medium"
                style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
              >
                {drink.region.name}
              </p>
              <p
                className="text-[11px]"
                style={{ color: "var(--ink-50)" }}
              >
                {drink.region.country}
              </p>
            </div>
            <Link
              href={`/regions/${drink.region.id}`}
              className="text-xs font-medium"
              style={{ color: "var(--amber)" }}
            >
              詳細を見る →
            </Link>
          </div>
        </main>
      </div>
    </>
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

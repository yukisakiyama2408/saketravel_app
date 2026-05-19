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
    if (!user) { setDrinkRecords([]); return; }
    getRecordsByDrink(drink.id, user.id).then(setDrinkRecords);
  }, [user, drink.id]);

  const isRecorded = drinkRecords.length > 0;

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

        {/* ── Hero 240px ── */}
        <div
          className="relative"
          style={{
            height: 240,
            background:
              "linear-gradient(160deg, #2a1200 0%, #1a0c00 55%, #0D1B2A 100%)",
          }}
        >
          {/* Bottle placeholder */}
          <div
            className="absolute right-10 top-1/2 -translate-y-1/2 rounded"
            style={{
              width: 44,
              height: 120,
              background:
                "repeating-linear-gradient(45deg, rgba(255,255,255,0.07), rgba(255,255,255,0.07) 4px, rgba(255,255,255,0.02) 4px, rgba(255,255,255,0.02) 8px)",
              borderRadius: 4,
            }}
          />

          {/* Mono tag bottom-left */}
          <div className="absolute bottom-4 left-5">
            <span
              className="text-[10px] px-2 py-1 rounded"
              style={{
                fontFamily: "var(--font-mono)",
                background: "rgba(200,137,61,0.15)",
                color: "rgba(200,137,61,0.9)",
                border: "1px solid rgba(200,137,61,0.25)",
              }}
            >
              {drink.name}
            </span>
          </div>
        </div>

        {/* ── Drink info ── */}
        <div
          className="px-5 pt-5 pb-1"
          style={{ background: "var(--paper)" }}
        >
          {/* Kicker */}
          <p
            className="text-[11px] mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--ink-50)",
            }}
          >
            {drink.region.name} / {drink.genre}
          </p>

          {/* Title */}
          <h1
            className="text-[28px] font-bold leading-tight mb-1"
            style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
          >
            {drink.name}
          </h1>

          {/* Sub: kana · country */}
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

          {/* Description */}
          {drink.description ? (
            <p
              className="text-sm pb-5"
              style={{ color: "var(--ink-70)", lineHeight: 1.85 }}
            >
              {drink.description}
            </p>
          ) : (
            <p className="text-sm pb-5" style={{ color: "var(--ink-35)" }}>
              説明情報準備中
            </p>
          )}
        </div>

        <div className="px-5 pt-5 pb-24">
          {/* ── CTA ── */}
          {isRecorded ? (
            <button
              onClick={() => setShowRecordModal(true)}
              className="w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
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
              className="w-full py-3 text-sm font-semibold active:opacity-70"
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
              <ul className="space-y-2">
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
        </div>
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

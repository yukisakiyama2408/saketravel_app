"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getDrinksByRegion, getRecordsByDrink } from "@/lib/data";
import LoginModal from "@/components/LoginModal";
import RecordModal from "@/components/RecordModal";
import SheetHeader from "@/components/SheetHeader";
import DrinkCard from "@/components/DrinkCard";
import type { Region, Drink, DrinkRecord, RecordWithJoin } from "@/types";

type Tab = "climate" | "food" | "drinks";

const TABS: { key: Tab; label: string }[] = [
  { key: "climate", label: "気候・地形" },
  { key: "food", label: "食文化" },
  { key: "drinks", label: "地元のドリンク" },
];

type Props = {
  region: Region | null;
  regionRecords?: RecordWithJoin[];
  onClose: () => void;
  onRecordSaved?: () => void;
};

export default function RegionPanel({
  region,
  regionRecords = [],
  onClose,
  onRecordSaved,
}: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("climate");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [drinkRecords, setDrinkRecords] = useState<DrinkRecord[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);

  useEffect(() => {
    if (!region) { setSelectedDrink(null); return; }
    setActiveTab("climate");
    setSelectedDrink(null);
    getDrinksByRegion(region.id).then(setDrinks);
  }, [region]);

  useEffect(() => {
    if (!selectedDrink || !user) { setDrinkRecords([]); return; }
    getRecordsByDrink(selectedDrink.id, user.id).then(setDrinkRecords);
  }, [selectedDrink, user]);

  const visible = region !== null;
  const otherDrinks = drinks.filter((d) => d.id !== selectedDrink?.id);
  const recordedDrinkIds = new Set(regionRecords.map((r) => r.drink_id));

  return (
    <>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {showRecordModal && selectedDrink && (
        <RecordModal
          drink={selectedDrink}
          onClose={() => setShowRecordModal(false)}
          onSaved={() => {
            getRecordsByDrink(selectedDrink.id, user!.id).then(setDrinkRecords);
            onRecordSaved?.();
          }}
        />
      )}

      {visible && <div className="fixed inset-0 z-10" onClick={onClose} />}

      {/* ── Sheet ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-20 transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          background: "var(--washi)",
          borderRadius: "24px 24px 0 0",
          boxShadow: "var(--sh-sheet)",
          maxHeight: "70dvh",
          overflowY: "auto",
        }}
      >
        {region && (
          <div className="pb-8">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "var(--ink-20)" }}
              />
            </div>

            {/* ── Header ── */}
            {!selectedDrink ? (
              /* 4-1: Region view header */
              <SheetHeader
                kicker={region.country}
                title={region.name}
                sub={drinks.length > 0 ? `${drinks.length}銘柄` : undefined}
                link="地域の詳細を見る"
                linkHref={`/regions/${region.id}`}
                onClose={onClose}
              />
            ) : (
              /* Drink view header — Phase 5 で詳細更新予定 */
              <div className="flex items-start justify-between px-5 pt-4 pb-3">
                <div className="flex-1 min-w-0 pr-4">
                  <button
                    onClick={() => setSelectedDrink(null)}
                    className="text-sm font-medium mb-1 flex items-center gap-1"
                    style={{ color: "var(--amber)" }}
                  >
                    ← {region.name}に戻る
                  </button>
                  <h2
                    className="text-xl font-bold leading-snug"
                    style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                  >
                    {selectedDrink.name}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: "var(--ink-50)" }}>
                    {selectedDrink.genre}
                  </p>
                  <Link
                    href={`/drinks/${selectedDrink.id}`}
                    className="text-xs font-medium mt-1 inline-block"
                    style={{ color: "var(--amber)" }}
                  >
                    銘柄の詳細を見る →
                  </Link>
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 flex items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    background: "var(--ink-04)",
                    color: "var(--ink-50)",
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* ── Region view ── */}
            {!selectedDrink && (
              <>
                {/* 4-2: Tabs */}
                <div
                  className="flex px-5"
                  style={{ borderBottom: "1px solid var(--ink-08)" }}
                >
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="text-sm pb-2 mr-5 transition-colors"
                      style={{
                        borderBottom:
                          activeTab === tab.key
                            ? "2px solid var(--amber)"
                            : "2px solid transparent",
                        color:
                          activeTab === tab.key ? "var(--ink)" : "var(--ink-50)",
                        fontWeight: activeTab === tab.key ? 600 : 400,
                        marginBottom: -1,
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="px-5 pt-4 leading-relaxed">
                  {activeTab === "climate" && (
                    <p className="text-sm" style={{ color: "var(--ink-70)" }}>
                      {region.climate ?? "情報準備中"}
                    </p>
                  )}
                  {activeTab === "food" && (
                    <p className="text-sm" style={{ color: "var(--ink-70)" }}>
                      {region.food_culture ?? "情報準備中"}
                    </p>
                  )}
                  {/* 4-3: Drinks list → DrinkCard */}
                  {activeTab === "drinks" && (
                    <ul className="space-y-2">
                      {drinks.length === 0 ? (
                        <li className="text-sm" style={{ color: "var(--ink-35)" }}>
                          銘柄データなし
                        </li>
                      ) : (
                        drinks.map((d) => (
                          <li key={d.id}>
                            <DrinkCard
                              drink={d}
                              recorded={recordedDrinkIds.has(d.id)}
                              onClick={() => setSelectedDrink(d)}
                            />
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </>
            )}

            {/* ── Drink detail view ── */}
            {selectedDrink && (
              <div className="px-5 pt-2">
                {selectedDrink.description ? (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ink-70)" }}>
                    {selectedDrink.description}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: "var(--ink-35)" }}>
                    説明情報準備中
                  </p>
                )}

                <button
                  onClick={() => {
                    if (!user) { setShowLoginModal(true); }
                    else { setShowRecordModal(true); }
                  }}
                  className="mt-5 w-full rounded-xl py-3 text-sm font-semibold active:opacity-70"
                  style={{
                    background: "var(--amber)",
                    color: "var(--paper)",
                    borderRadius: "var(--r-lg)",
                  }}
                >
                  飲んだ ✓
                </button>

                {drinkRecords.length > 0 && (
                  <div className="mt-5">
                    <p
                      className="text-xs font-semibold tracking-wide mb-3 uppercase"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--ink-50)",
                      }}
                    >
                      飲んだ記録
                    </p>
                    <ul className="space-y-2">
                      {drinkRecords.map((rec) => (
                        <li
                          key={rec.id}
                          className="rounded-xl px-4 py-3"
                          style={{
                            border: "1px solid var(--ink-08)",
                            background: "var(--paper-2)",
                          }}
                        >
                          <p
                            className="text-xs"
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
                          {rec.memo && (
                            <p
                              className="text-xs mt-1 leading-relaxed"
                              style={{ color: "var(--ink-70)" }}
                            >
                              {rec.memo}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {otherDrinks.length > 0 && (
                  <div className="mt-6">
                    <p
                      className="text-xs font-semibold tracking-wide mb-3 uppercase"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--ink-50)",
                      }}
                    >
                      {region.name}のほかのお酒
                    </p>
                    <ul className="space-y-2">
                      {otherDrinks.map((d) => (
                        <li key={d.id}>
                          <DrinkCard
                            drink={d}
                            recorded={recordedDrinkIds.has(d.id)}
                            onClick={() => setSelectedDrink(d)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

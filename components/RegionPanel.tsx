"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getDrinksByRegion, getRecordsByDrink, getStoresByDrink } from "@/lib/data";
import LoginModal from "@/components/LoginModal";
import RecordModal from "@/components/RecordModal";
import SheetHeader from "@/components/SheetHeader";
import DrinkCard from "@/components/DrinkCard";
import StoreCard from "@/components/StoreCard";
import type { Region, Drink, DrinkRecord, Store, RecordWithJoin } from "@/types";

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
  const [stores, setStores] = useState<Store[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);

  useEffect(() => {
    if (!region) { setSelectedDrink(null); return; }
    setActiveTab("climate");
    setSelectedDrink(null);
    getDrinksByRegion(region.id).then(setDrinks);
  }, [region]);

  useEffect(() => {
    if (!selectedDrink) { setDrinkRecords([]); setStores([]); return; }
    getStoresByDrink(selectedDrink.id).then(setStores);
    if (!user) { setDrinkRecords([]); return; }
    getRecordsByDrink(selectedDrink.id, user.id).then(setDrinkRecords);
  }, [selectedDrink, user]);

  const visible = region !== null;
  const otherDrinks = drinks.filter((d) => d.id !== selectedDrink?.id);
  const recordedDrinkIds = new Set(regionRecords.map((r) => r.drink_id));
  const isRecorded = drinkRecords.length > 0;

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
          <div className="pb-10">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--ink-20)" }} />
            </div>

            {/* ── Region view ── */}
            {!selectedDrink && (
              <>
                <SheetHeader
                  kicker={region.country}
                  title={region.name}
                  sub={drinks.length > 0 ? `${drinks.length}銘柄` : undefined}
                  link="地域の詳細を見る"
                  linkHref={`/regions/${region.id}`}
                  onClose={onClose}
                />

                {/* Tabs */}
                <div className="flex px-5" style={{ borderBottom: "1px solid var(--ink-08)" }}>
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
                        color: activeTab === tab.key ? "var(--ink)" : "var(--ink-50)",
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
              <>
                {/* 5-1: Back button + SheetHeader */}
                <div className="px-5 pt-3 pb-0">
                  <button
                    onClick={() => setSelectedDrink(null)}
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: "var(--amber)" }}
                  >
                    ← {region.name}に戻る
                  </button>
                </div>

                <SheetHeader
                  kicker={selectedDrink.genre}
                  title={selectedDrink.name}
                  sub={selectedDrink.name_kana ?? undefined}
                  link="銘柄の詳細を見る"
                  linkHref={`/drinks/${selectedDrink.id}`}
                  onClose={onClose}
                />

                {/* 5-2: Hero row */}
                <div className="px-5 pb-5 flex gap-4">
                  {/* Thumbnail placeholder */}
                  <div
                    className="flex-shrink-0 rounded-lg"
                    style={{
                      width: 56,
                      height: 92,
                      background:
                        "repeating-linear-gradient(45deg, var(--canvas), var(--canvas) 4px, var(--paper) 4px, var(--paper) 8px)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    {/* Genre pill */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--amber-tint)",
                          color: "var(--amber-dk)",
                        }}
                      >
                        {selectedDrink.genre}
                      </span>
                    </div>
                    {/* Description */}
                    {selectedDrink.description ? (
                      <p
                        className="text-sm"
                        style={{ color: "var(--ink-70)", lineHeight: 1.85 }}
                      >
                        {selectedDrink.description}
                      </p>
                    ) : (
                      <p className="text-sm" style={{ color: "var(--ink-35)" }}>
                        説明情報準備中
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5">
                  {/* 5-3 / 5-4: CTA */}
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
                      記録済み
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

                  {/* Drink records */}
                  {drinkRecords.length > 0 && (
                    <div className="mt-6">
                      <p
                        className="text-[11px] uppercase tracking-widest mb-3"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
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

                  {/* 5-5: Store list */}
                  {stores.length > 0 && (
                    <div className="mt-6">
                      <p
                        className="text-[11px] uppercase tracking-widest mb-3"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
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

                  {/* 5-6: Other drinks in region */}
                  {otherDrinks.length > 0 && (
                    <div className="mt-6">
                      <p
                        className="text-[11px] uppercase tracking-widest mb-3"
                        style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
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
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

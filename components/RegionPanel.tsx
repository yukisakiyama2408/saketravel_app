"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getDrinksByRegion, getRecordsByDrink } from "@/lib/data";
import LoginModal from "@/components/LoginModal";
import RecordModal from "@/components/RecordModal";
import type { Region, Drink, DrinkRecord, RecordWithJoin } from "@/types";

type Tab = "climate" | "food" | "drinks";

type Props = {
  region: Region | null;
  regionRecords?: RecordWithJoin[];
  onClose: () => void;
  onRecordSaved?: () => void;
};

export default function RegionPanel({ region, regionRecords = [], onClose, onRecordSaved }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("climate");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [drinkRecords, setDrinkRecords] = useState<DrinkRecord[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);

  useEffect(() => {
    if (!region) {
      setSelectedDrink(null);
      return;
    }
    setActiveTab("climate");
    setSelectedDrink(null);
    getDrinksByRegion(region.id).then(setDrinks);
  }, [region]);

  useEffect(() => {
    if (!selectedDrink || !user) {
      setDrinkRecords([]);
      return;
    }
    getRecordsByDrink(selectedDrink.id, user.id).then(setDrinkRecords);
  }, [selectedDrink, user]);

  const visible = region !== null;
  const otherDrinks = drinks.filter((d) => d.id !== selectedDrink?.id);
  const recordedDrinkIds = new Set(regionRecords.map((r) => r.drink_id));

  return (
    <>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

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

      {visible && (
        <div className="fixed inset-0 z-10" onClick={onClose} />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-20 bg-[#F8F3EC] rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "70dvh", overflowY: "auto" }}
      >
        {region && (
          <div className="pb-8">
            {/* ハンドル */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#0D1B2A]/20" />
            </div>

            {/* ヘッダー */}
            <div className="flex items-start justify-between px-5 pt-2 pb-4">
              <div>
                {selectedDrink && (
                  <button
                    onClick={() => setSelectedDrink(null)}
                    className="text-[#E8A045] text-sm font-medium mb-1 flex items-center gap-1"
                  >
                    ← {region.name}に戻る
                  </button>
                )}
                <h2 className="text-xl font-bold text-[#0D1B2A]">
                  {selectedDrink ? selectedDrink.name : region.name}
                </h2>
                <p className="text-sm text-[#0D1B2A]/60">
                  {selectedDrink ? selectedDrink.genre : region.country}
                </p>
                <Link
                  href={selectedDrink ? `/drinks/${selectedDrink.id}` : `/regions/${region.id}`}
                  className="text-xs text-[#E8A045] font-medium mt-1 inline-block"
                >
                  詳細を見る →
                </Link>
              </div>
              <button
                onClick={onClose}
                className="text-[#0D1B2A]/40 hover:text-[#0D1B2A] text-2xl leading-none mt-1"
              >
                ×
              </button>
            </div>

            {!selectedDrink ? (
              /* ── リージョンビュー ── */
              <>
                <div className="flex border-b border-[#0D1B2A]/10 px-5">
                  {(
                    [
                      { key: "climate", label: "気候・地形" },
                      { key: "food", label: "食文化" },
                      { key: "drinks", label: "地元のドリンク" },
                    ] as { key: Tab; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`text-sm font-medium pb-2 mr-5 border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? "border-[#E8A045] text-[#0D1B2A]"
                          : "border-transparent text-[#0D1B2A]/50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="px-5 pt-4 text-sm text-[#0D1B2A]/80 leading-relaxed">
                  {activeTab === "climate" && (
                    <p>{region.climate ?? "情報準備中"}</p>
                  )}
                  {activeTab === "food" && (
                    <p>{region.food_culture ?? "情報準備中"}</p>
                  )}
                  {activeTab === "drinks" && (
                    <ul className="space-y-3">
                      {drinks.length === 0 ? (
                        <li className="text-[#0D1B2A]/40">銘柄データなし</li>
                      ) : (
                        drinks.map((d) => (
                          <li key={d.id}>
                            <button
                              onClick={() => setSelectedDrink(d)}
                              className="w-full text-left border border-[#0D1B2A]/10 rounded-lg p-3 bg-white hover:bg-[#F8F3EC] transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-[#0D1B2A]">{d.name}</p>
                                {recordedDrinkIds.has(d.id) && (
                                  <span className="flex-shrink-0 text-[10px] font-semibold text-[#E8A045] border border-[#E8A045]/40 rounded-full px-2 py-0.5">
                                    飲んだ ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#0D1B2A]/50 mt-0.5">{d.genre}</p>
                              {d.description && (
                                <p className="text-xs text-[#0D1B2A]/70 mt-1">{d.description}</p>
                              )}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              /* ── 銘柄詳細ビュー ── */
              <div className="px-5 pt-2">
                {selectedDrink.description ? (
                  <p className="text-sm text-[#0D1B2A]/80 leading-relaxed">
                    {selectedDrink.description}
                  </p>
                ) : (
                  <p className="text-sm text-[#0D1B2A]/40">説明情報準備中</p>
                )}

                <button
                  onClick={() => {
                    if (!user) {
                      setShowLoginModal(true);
                    } else {
                      setShowRecordModal(true);
                    }
                  }}
                  className="mt-5 w-full bg-[#E8A045] text-white rounded-xl py-3 text-sm font-semibold active:opacity-70"
                >
                  飲んだ ✓
                </button>

                {drinkRecords.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide mb-3">飲んだ記録</p>
                    <ul className="space-y-2">
                      {drinkRecords.map((rec) => (
                        <li key={rec.id} className="border border-[#0D1B2A]/10 rounded-xl px-4 py-3 bg-white">
                          <p className="text-xs text-[#0D1B2A]/50">
                            {new Date(rec.date).toLocaleDateString("ja-JP", {
                              year: "numeric", month: "long", day: "numeric",
                            })}
                          </p>
                          {rec.memo && (
                            <p className="text-xs text-[#0D1B2A]/70 mt-1 leading-relaxed">{rec.memo}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {otherDrinks.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide mb-3">
                      {region.name}のほかのお酒
                    </p>
                    <ul className="space-y-2">
                      {otherDrinks.map((d) => (
                        <li key={d.id}>
                          <button
                            onClick={() => setSelectedDrink(d)}
                            className="w-full text-left border border-[#0D1B2A]/10 rounded-lg p-3 bg-white hover:bg-[#F8F3EC] transition-colors"
                          >
                            <p className="font-medium text-[#0D1B2A] text-sm">{d.name}</p>
                            <p className="text-xs text-[#0D1B2A]/50 mt-0.5">{d.genre}</p>
                          </button>
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

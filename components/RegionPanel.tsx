"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import LoginModal from "@/components/LoginModal";
import type { Region, Drink } from "@/types";

type Tab = "climate" | "food" | "drinks";

type Props = {
  region: Region | null;
  onClose: () => void;
};

export default function RegionPanel({ region, onClose }: Props) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("climate");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!region) {
      setSelectedDrink(null);
      return;
    }
    setActiveTab("climate");
    setSelectedDrink(null);
    supabase
      .from("drinks")
      .select("*")
      .eq("region_id", region.id)
      .then(({ data }) => setDrinks(data ?? []));
  }, [region]);

  const visible = region !== null;
  const otherDrinks = drinks.filter((d) => d.id !== selectedDrink?.id);

  return (
    <>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
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
                              <p className="font-medium text-[#0D1B2A]">{d.name}</p>
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
                    }
                    // Phase 7: 記録モーダルを開く
                  }}
                  className="mt-5 w-full bg-[#E8A045] text-white rounded-xl py-3 text-sm font-semibold active:opacity-70"
                >
                  飲んだ ✓
                </button>

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

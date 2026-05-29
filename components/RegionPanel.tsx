"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  getDrinksByRegion,
  getDishesByRegion,
  getRecordsByDrink,
  getStoresByDrink,
} from "@/lib/data";
import LoginModal from "@/components/LoginModal";
import RecordModal from "@/components/RecordModal";
import EditRecordModal from "@/components/EditRecordModal";
import SheetHeader from "@/components/SheetHeader";
import DrinkCard from "@/components/DrinkCard";
import StoreCard from "@/components/StoreCard";
import type {
  Region,
  Drink,
  DrinkRecord,
  Dish,
  Store,
  RecordWithJoin,
} from "@/types";

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
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [drinkRecords, setDrinkRecords] = useState<DrinkRecord[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<
    import("@/types").DrinkRecord | null
  >(null);

  useEffect(() => {
    if (!region) {
      setSelectedDrink(null);
      setDishes([]);
      return;
    }
    setActiveTab("climate");
    setSelectedDrink(null);
    getDrinksByRegion(region.id).then(setDrinks);
    getDishesByRegion(region.id).then(setDishes);
  }, [region]);

  useEffect(() => {
    if (!selectedDrink) {
      setDrinkRecords([]);
      setStores([]);
      return;
    }
    getStoresByDrink(selectedDrink.id).then(setStores);
    if (!user) {
      setDrinkRecords([]);
      return;
    }
    getRecordsByDrink(selectedDrink.id, user.id).then(setDrinkRecords);
  }, [selectedDrink, user]);

  const visible = region !== null;
  const otherDrinks = drinks.filter((d) => d.id !== selectedDrink?.id);
  const recordedDrinkIds = new Set(regionRecords.map((r) => r.drink_id));
  const isRecorded = drinkRecords.length > 0;

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

      {editingRecord && selectedDrink && (
        <EditRecordModal
          record={editingRecord}
          drinkName={selectedDrink.name}
          onClose={() => setEditingRecord(null)}
          onSave={() => {
            getRecordsByDrink(selectedDrink.id, user!.id).then(setDrinkRecords);
            onRecordSaved?.();
          }}
          onDelete={() => {
            getRecordsByDrink(selectedDrink.id, user!.id).then(setDrinkRecords);
            onRecordSaved?.();
          }}
        />
      )}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-10 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(13,27,42,0.45)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      {/* ── Popup ── */}
      <div
        className={`fixed inset-0 z-20 flex items-center justify-center p-3 pointer-events-none transition-all duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`w-full max-w-xl pointer-events-auto transition-transform duration-200 ${
            visible ? "scale-100" : "scale-95"
          }`}
          style={{
            background: "var(--washi)",
            borderRadius: "var(--r-xl)",
            boxShadow:
              "0 20px 60px rgba(13,27,42,0.22), 0 4px 16px rgba(13,27,42,0.10)",
            maxHeight: "82dvh",
            overflowY: "auto",
          }}
        >
          {region && (
            <div className="pb-6">
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
                            activeTab === tab.key
                              ? "var(--ink)"
                              : "var(--ink-50)",
                          fontWeight: activeTab === tab.key ? 600 : 400,
                          marginBottom: -1,
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="px-5 pt-4 leading-relaxed">
                    {activeTab === "climate" && (() => {
                      const hasStats = region.annual_snowfall || region.avg_temperature || region.sake_breweries != null || region.rice_variety;
                      return (
                        <div>
                          <RegionPhoto region={region} />

                          {/* Stats grid */}
                          {hasStats && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              {[
                                { label: "年間降雪量", value: region.annual_snowfall ?? "─" },
                                { label: "年間平均気温", value: region.avg_temperature ?? "─" },
                                { label: "酒蔵数", value: region.sake_breweries != null ? `${region.sake_breweries} 蔵` : "─" },
                                { label: "代表的酒米", value: region.rice_variety ?? "─" },
                              ].map(({ label, value }) => (
                                <div
                                  key={label}
                                  className="rounded-lg px-3 py-2.5"
                                  style={{ background: "var(--ink-04)" }}
                                >
                                  <p className="text-[10px] mb-0.5" style={{ color: "var(--ink-35)" }}>{label}</p>
                                  <p className="text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>{value}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-sm" style={{ color: "var(--ink-70)" }}>
                            {region.climate ?? "情報準備中"}
                          </p>
                        </div>
                      );
                    })()}
                    {activeTab === "food" && (
                      <div>
                        <RegionPhoto region={region} />

                        <p className="text-sm leading-relaxed" style={{ color: "var(--ink-70)" }}>
                          {region.food_culture ?? "情報準備中"}
                        </p>

                        {dishes.length > 0 && (
                          <div className="mt-5">
                            <p
                              className="text-[11px] uppercase tracking-widest mb-3"
                              style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
                            >
                              名物 ─ Specialties
                            </p>
                            <div
                              className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5"
                              style={{ scrollbarWidth: "none" }}
                            >
                              {dishes.map((dish) => (
                                <div key={dish.id} className="flex-shrink-0" style={{ width: 90 }}>
                                  {/* Photo placeholder */}
                                  <div
                                    className="rounded-lg"
                                    style={{
                                      width: 90,
                                      height: 70,
                                      background: "repeating-linear-gradient(45deg, var(--canvas), var(--canvas) 4px, var(--paper) 4px, var(--paper) 8px)",
                                    }}
                                  />
                                  <p
                                    className="text-xs font-bold mt-1.5 leading-tight"
                                    style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                                  >
                                    {dish.name}
                                  </p>
                                  {dish.description && (
                                    <p
                                      className="text-[10px] mt-0.5 leading-tight"
                                      style={{
                                        color: "var(--ink-50)",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical" as const,
                                        overflow: "hidden",
                                      }}
                                    >
                                      {dish.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab === "drinks" && (
                      <ul className="space-y-2">
                        {drinks.length === 0 ? (
                          <li
                            className="text-sm"
                            style={{ color: "var(--ink-35)" }}
                          >
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
                    {/* Thumbnail */}
                    {selectedDrink.photo_url ? (
                      <img
                        src={selectedDrink.photo_url}
                        alt={selectedDrink.name}
                        className="flex-shrink-0 rounded-lg object-contain"
                        style={{ width: 80, height: 128 }}
                      />
                    ) : (
                      <div
                        className="flex-shrink-0 rounded-lg"
                        style={{
                          width: 56,
                          height: 92,
                          background:
                            "repeating-linear-gradient(45deg, var(--canvas), var(--canvas) 4px, var(--paper) 4px, var(--paper) 8px)",
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      {/* Genre pill */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
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
                      {/* Spec row */}
                      {(() => {
                        const parts = [
                          selectedDrink.seimaibuai != null ? `精米 ${selectedDrink.seimaibuai}%` : null,
                          selectedDrink.alcohol != null ? `ALC ${selectedDrink.alcohol}%` : null,
                        ].filter(Boolean);
                        return parts.length > 0 ? (
                          <p
                            className="text-[11px] mb-2"
                            style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
                          >
                            {parts.join(" · ")}
                          </p>
                        ) : null;
                      })()}
                      {/* Description */}
                      {selectedDrink.description ? (
                        <p
                          className="text-sm"
                          style={{ color: "var(--ink-70)", lineHeight: 1.85 }}
                        >
                          {selectedDrink.description}
                        </p>
                      ) : (
                        <p
                          className="text-sm"
                          style={{ color: "var(--ink-35)" }}
                        >
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
                        <svg
                          width="14"
                          height="11"
                          viewBox="0 0 14 11"
                          fill="none"
                        >
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
                                  (e.currentTarget.style.background =
                                    "var(--washi)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "var(--paper-2)")
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
                                    {new Date(rec.date).toLocaleDateString(
                                      "ja-JP",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      },
                                    )}
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
                                    style={{
                                      color: "var(--ink-35)",
                                      flexShrink: 0,
                                    }}
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

                    {/* 5-5: Store list */}
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

                    {/* 5-6: Other drinks in region */}
                    {otherDrinks.length > 0 && (
                      <div className="mt-6">
                        <p
                          className="text-[11px] uppercase tracking-widest mb-3"
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function RegionPhoto({ region }: { region: Region }) {
  return (
    <div
      className="mb-4 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl"
      style={{ background: "var(--ink-04)", border: "1px solid var(--ink-08)" }}
    >
      {region.photo_url ? (
        <img
          src={region.photo_url}
          alt={region.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <p
          className="text-[11px]"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-20)" }}
        >
          PHOTO COMING SOON
        </p>
      )}
    </div>
  );
}

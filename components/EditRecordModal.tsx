"use client";

import { useState } from "react";
import { updateRecord, deleteRecord } from "@/lib/data";
import type { DrinkRecord } from "@/types";

type Props = {
  record: DrinkRecord;
  drinkName: string;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function EditRecordModal({
  record,
  drinkName,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [date, setDate] = useState(record.date);
  const [memo, setMemo] = useState(record.memo ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const { error } = await updateRecord(record.id, { date, memo: memo.trim() || null });
    if (error) {
      setError(error.message);
    } else {
      onSave();
      onClose();
    }
    setLoading(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await deleteRecord(record.id);
    if (error) {
      setError(error.message);
      setDeleting(false);
      setConfirmDelete(false);
    } else {
      onDelete();
      onClose();
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        style={{ background: "rgba(13,27,42,0.5)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
          <div
            className="w-full max-w-xs pointer-events-auto"
            style={{
              background: "var(--washi)",
              borderRadius: "var(--r-xl)",
              boxShadow: "var(--sh-sheet)",
              padding: "24px",
            }}
          >
            <h3
              className="text-base font-bold mb-2"
              style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
            >
              記録を削除しますか？
            </h3>
            <p className="text-xs mb-6" style={{ color: "var(--ink-50)" }}>
              この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2.5 text-sm font-medium"
                style={{
                  border: "1px solid var(--ink-12)",
                  color: "var(--ink-70)",
                  borderRadius: "var(--r-lg)",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-semibold disabled:opacity-50"
                style={{
                  background: "#B33A3A",
                  color: "white",
                  borderRadius: "var(--r-lg)",
                }}
              >
                {deleting ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
        <div
          className="pointer-events-auto pb-10"
          style={{
            background: "var(--washi)",
            borderRadius: "24px 24px 0 0",
            boxShadow: "var(--sh-sheet)",
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: "var(--ink-20)" }} />
          </div>

          <div className="px-5 pt-3 pb-6">
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="text-[11px] uppercase tracking-widest mb-1"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--ink-35)" }}
                >
                  EDIT RECORD
                </p>
                <h2
                  className="text-[22px] font-bold mb-0.5"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                >
                  記録を編集する
                </h2>
                <p
                  className="text-xs"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--amber)" }}
                >
                  {drinkName}
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0 mt-1"
                style={{
                  background: "rgba(179,58,58,0.08)",
                  color: "#B33A3A",
                  border: "1px solid rgba(179,58,58,0.18)",
                }}
              >
                削除
              </button>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--ink-70)" }}
              >
                飲んだ日
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm outline-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    border: "1px solid var(--ink-12)",
                    background: "var(--paper-2)",
                    color: "var(--ink)",
                    borderRadius: "var(--r-lg)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ink-12)")}
                />
                <CalendarIcon />
              </div>
            </div>

            {/* Memo */}
            <div className="mb-6">
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--ink-70)" }}
              >
                メモ（任意）
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="どこで飲んだ、どんな味だったなど..."
                className="w-full px-3 py-2.5 text-sm outline-none resize-none"
                style={{
                  height: 80,
                  border: "1px solid var(--ink-12)",
                  background: "var(--paper-2)",
                  color: "var(--ink)",
                  borderRadius: "var(--r-lg)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--ink-12)")}
              />
            </div>

            {error && (
              <p
                className="text-xs px-3 py-2 rounded-lg mb-4"
                style={{ background: "#FEE2E2", color: "#DC2626" }}
              >
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="py-3 text-sm font-medium"
                style={{
                  flex: "3",
                  border: "1px solid var(--ink-12)",
                  color: "var(--ink-70)",
                  borderRadius: "var(--r-lg)",
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="py-3 text-sm font-semibold disabled:opacity-50"
                style={{
                  flex: "7",
                  background: "var(--amber)",
                  color: "var(--paper)",
                  borderRadius: "var(--r-lg)",
                }}
              >
                {loading ? "保存中..." : "変更を保存"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

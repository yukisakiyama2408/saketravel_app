"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { Drink } from "@/types";

type Props = {
  drink: Drink;
  onClose: () => void;
  onSaved: () => void;
};

export default function RecordModal({ drink, onClose, onSaved }: Props) {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("records").insert({
      user_id: user.id,
      drink_id: drink.id,
      region_id: drink.region_id,
      date,
      memo: memo.trim() || null,
    });

    if (error) {
      setError(error.message);
    } else {
      onSaved();
      onClose();
    }
    setLoading(false);
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
        <div className="bg-[#F8F3EC] rounded-t-2xl p-6 pb-10 pointer-events-auto shadow-2xl">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-[#0D1B2A]/20" />
          </div>

          <h2 className="text-lg font-bold text-[#0D1B2A] mb-1">飲んだ記録</h2>
          <p className="text-sm text-[#0D1B2A]/50 mb-6">{drink.name}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1">
                飲んだ日
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-[#0D1B2A]/20 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#E8A045]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-1">
                メモ（任意）
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="どこで飲んだ、どんな味だったなど..."
                rows={3}
                className="w-full border border-[#0D1B2A]/20 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#E8A045] resize-none"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-6 w-full bg-[#E8A045] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </>
  );
}

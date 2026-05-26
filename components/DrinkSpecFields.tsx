"use client";

import { useState } from "react";
import { GENRE_SPECS } from "@/lib/drinkSpecs";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";

type Props = {
  listId: string;
  defaultGenre?: string;
  defaultSpecs?: Record<string, string> | null;
};

export default function DrinkSpecFields({ listId, defaultGenre = "", defaultSpecs }: Props) {
  const [genre, setGenre] = useState(defaultGenre);
  const specDefs = GENRE_SPECS[genre] ?? [];

  return (
    <>
      <input
        name="genre"
        required
        placeholder="ジャンル *"
        list={listId}
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className={inp}
      />
      <datalist id={listId}>
        {Object.keys(GENRE_SPECS).map((g) => <option key={g} value={g} />)}
      </datalist>

      {specDefs.length > 0 && (
        <div className="rounded-lg border border-[#0D1B2A]/08 p-3 space-y-2" style={{ background: "rgba(248,243,236,0.5)" }}>
          <p className="text-[10px] font-semibold tracking-widest text-[#0D1B2A]/40 uppercase">スペック</p>
          {specDefs.map(({ key, label, placeholder }) => (
            <input
              key={key}
              name={`spec_${key}`}
              placeholder={`${label}（例: ${placeholder}）`}
              defaultValue={defaultSpecs?.[key] ?? ""}
              className={inp}
            />
          ))}
        </div>
      )}
    </>
  );
}

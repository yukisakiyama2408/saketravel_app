"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Region } from "@/types";

type DrinkResult = {
  id: string;
  name: string;
  genre: string;
  region: Region;
};

type Props = {
  onSelectRegion: (region: Region) => void;
};

export default function SearchBox({ onSelectRegion }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DrinkResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("drinks")
        .select(
          "id, name, genre, region:regions(id, name, country, latitude, longitude, climate, food_culture, region_level, created_at)"
        )
        .ilike("name", `%${query}%`)
        .limit(10);

      setResults((data as unknown as DrinkResult[]) ?? []);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: DrinkResult) {
    setQuery("");
    setIsOpen(false);
    onSelectRegion(result.region);
  }

  return (
    <div ref={containerRef} className="absolute top-4 left-4 right-4 z-30">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="銘柄名で検索（例：獺祭）"
          className="w-full bg-white/95 backdrop-blur rounded-xl px-4 py-3 pr-10 text-sm text-[#0D1B2A] placeholder-[#0D1B2A]/40 shadow-lg outline-none focus:ring-2 focus:ring-[#E8A045]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0D1B2A]/40 hover:text-[#0D1B2A] text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <ul className="mt-2 bg-white rounded-xl shadow-xl overflow-hidden">
          {results.length > 0 ? (
            results.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-3 hover:bg-[#F8F3EC] border-b border-[#0D1B2A]/5 last:border-0 transition-colors"
                >
                  <p className="text-sm font-medium text-[#0D1B2A]">{r.name}</p>
                  <p className="text-xs text-[#0D1B2A]/50 mt-0.5">
                    {r.genre} · {r.region.name}
                  </p>
                </button>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-[#0D1B2A]/50">
              見つかりませんでした
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

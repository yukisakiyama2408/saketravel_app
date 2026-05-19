"use client";

import { useState, useEffect, useRef } from "react";
import { searchDrinks } from "@/lib/data";
import type { DrinkSearchResult } from "@/lib/data";
import type { Region } from "@/types";

type Props = {
  onSelectRegion: (region: Region) => void;
  recordedDrinkIds?: Set<string>;
};

function highlight(text: string, query: string) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "rgba(200,137,61,0.3)",
          borderRadius: 2,
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchBox({ onSelectRegion, recordedDrinkIds }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DrinkSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      const data = await searchDrinks(query);
      setResults(data);
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

  function handleSelect(result: DrinkSearchResult) {
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
          className="w-full bg-white/95 backdrop-blur rounded-xl px-4 py-3 pr-10 text-sm placeholder-[#0D1B2A]/40 shadow-lg outline-none"
          style={{
            color: "var(--ink)",
            border: "1px solid var(--ink-08)",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.outline = "2px solid var(--amber)")
          }
          onBlur={(e) => (e.currentTarget.style.outline = "")}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none"
            style={{ color: "var(--ink-35)" }}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="mt-2 rounded-xl shadow-xl overflow-hidden"
          style={{ background: "var(--paper-2)", border: "1px solid var(--ink-08)" }}
        >
          {/* Header */}
          <div
            className="px-4 py-2 text-[11px] sticky top-0"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--ink-50)",
              background: "var(--paper-2)",
              borderBottom: "1px solid var(--ink-08)",
            }}
          >
            銘柄候補 · {results.length}件
          </div>

          <ul>
            {results.length > 0 ? (
              results.map((r) => {
                const recorded = recordedDrinkIds?.has(r.id) ?? false;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => handleSelect(r)}
                      className="w-full text-left px-4 py-3 transition-colors"
                      style={{ borderBottom: "1px solid var(--ink-04)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--washi)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                          {highlight(r.name, query)}
                        </p>
                        {recorded && (
                          <span
                            className="flex-shrink-0 text-[11px] px-2 py-0.5 rounded-full"
                            style={{
                              border: "1px solid var(--amber)",
                              color: "var(--amber-dk)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--ink-50)" }}>
                        {r.genre} · {r.region.name}
                      </p>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-3 text-sm" style={{ color: "var(--ink-50)" }}>
                見つかりませんでした
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

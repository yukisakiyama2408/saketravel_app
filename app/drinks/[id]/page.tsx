import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Store } from "@/types";

export default async function DrinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: drink } = await supabase
    .from("drinks")
    .select("*, region:regions(*)")
    .eq("id", id)
    .single();

  if (!drink) notFound();

  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .contains("drink_ids", [id]);

  const region = drink.region as { id: string; name: string; country: string; climate: string | null; food_culture: string | null } | null;

  return (
    <div className="h-full overflow-y-auto bg-[#F8F3EC]">
      <div className="max-w-lg mx-auto px-5 py-6 pb-12">
        <Link href="/" className="text-[#E8A045] text-sm font-medium flex items-center gap-1 mb-6">
          ← 地図に戻る
        </Link>

        <h1 className="text-2xl font-bold text-[#0D1B2A]">{drink.name}</h1>
        <p className="text-sm text-[#0D1B2A]/60 mt-1">{drink.genre}</p>

        {drink.description && (
          <p className="mt-4 text-sm text-[#0D1B2A]/80 leading-relaxed">{drink.description}</p>
        )}

        {region && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide">産地</h2>
              <Link href={`/regions/${region.id}`} className="text-xs text-[#E8A045] font-medium">
                詳細を見る →
              </Link>
            </div>
            <div className="border border-[#0D1B2A]/10 rounded-xl px-4 py-3 bg-white">
              <p className="font-medium text-[#0D1B2A] text-sm">{region.name}</p>
              <p className="text-xs text-[#0D1B2A]/50 mt-0.5">{region.country}</p>
            </div>
            {region.climate && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#0D1B2A]/50 mb-1">気候・地形</p>
                <p className="text-sm text-[#0D1B2A]/80 leading-relaxed">{region.climate}</p>
              </div>
            )}
            {region.food_culture && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-[#0D1B2A]/50 mb-1">食文化</p>
                <p className="text-sm text-[#0D1B2A]/80 leading-relaxed">{region.food_culture}</p>
              </div>
            )}
          </section>
        )}

        {stores && stores.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide mb-3">飲める店</h2>
            <ul className="space-y-2">
              {(stores as Store[]).map((s) => (
                <li key={s.id} className="border border-[#0D1B2A]/10 rounded-xl px-4 py-3 bg-white">
                  <p className="font-medium text-[#0D1B2A] text-sm">{s.name}</p>
                  {s.genre && <p className="text-xs text-[#0D1B2A]/50 mt-0.5">{s.genre}</p>}
                  {s.address && <p className="text-xs text-[#0D1B2A]/60 mt-1">{s.address}</p>}
                  {s.hours && <p className="text-xs text-[#0D1B2A]/50 mt-0.5">{s.hours}</p>}
                  {s.google_maps_url && (
                    <a
                      href={s.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs font-medium text-[#E8A045]"
                    >
                      Google マップで開く →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

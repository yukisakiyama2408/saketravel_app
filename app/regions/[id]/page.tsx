import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Store } from "@/types";

export default async function RegionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: region }, { data: drinks }, { data: stores }] = await Promise.all([
    supabase.from("regions").select("*").eq("id", id).single(),
    supabase.from("drinks").select("*").eq("region_id", id).order("name"),
    supabase.from("stores").select("*").contains("region_ids", [id]),
  ]);

  if (!region) notFound();

  return (
    <div className="h-full overflow-y-auto bg-[#F8F3EC]">
      <div className="max-w-lg mx-auto px-5 py-6 pb-12">
        <Link href="/" className="text-[#E8A045] text-sm font-medium flex items-center gap-1 mb-6">
          ← 地図に戻る
        </Link>

        <h1 className="text-2xl font-bold text-[#0D1B2A]">{region.name}</h1>
        <p className="text-sm text-[#0D1B2A]/60 mt-1">{region.country}</p>

        {region.climate && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide mb-2">気候・地形</h2>
            <p className="text-sm text-[#0D1B2A]/80 leading-relaxed">{region.climate}</p>
          </section>
        )}

        {region.food_culture && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide mb-2">食文化</h2>
            <p className="text-sm text-[#0D1B2A]/80 leading-relaxed">{region.food_culture}</p>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide mb-3">地元のお酒</h2>
          {drinks && drinks.length > 0 ? (
            <ul className="space-y-2">
              {drinks.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/drinks/${d.id}`}
                    className="block border border-[#0D1B2A]/10 rounded-xl px-4 py-3 bg-white hover:bg-[#F8F3EC] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-[#0D1B2A] text-sm">{d.name}</p>
                      <span className="text-[#0D1B2A]/30 text-xs">→</span>
                    </div>
                    <p className="text-xs text-[#0D1B2A]/50 mt-0.5">{d.genre}</p>
                    {d.description && (
                      <p className="text-xs text-[#0D1B2A]/70 mt-1">{d.description}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#0D1B2A]/40">銘柄データなし</p>
          )}
        </section>

        {stores && stores.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide mb-3">国内で楽しめる店</h2>
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

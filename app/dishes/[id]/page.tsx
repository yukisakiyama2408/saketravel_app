import Link from "next/link";
import { notFound } from "next/navigation";
import { getDishById, getDrinksByIds, getStoresByRegion } from "@/lib/data";

export default async function DishDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dish = await getDishById(id);

  if (!dish) notFound();

  const pairingDrinkIds: string[] = dish.pairing_drink_ids ?? [];

  const [pairingDrinks, stores] = await Promise.all([
    getDrinksByIds(pairingDrinkIds),
    dish.region_id ? getStoresByRegion(dish.region_id) : Promise.resolve([]),
  ]);

  return (
    <div className="h-full overflow-y-auto bg-[#F8F3EC]">
      <div className="max-w-lg mx-auto px-5 py-6 pb-12">
        <Link href="/" className="text-[#E8A045] text-sm font-medium flex items-center gap-1 mb-6">
          ← 地図に戻る
        </Link>

        <h1 className="text-2xl font-bold text-[#0D1B2A]">{dish.name}</h1>

        {dish.description && (
          <p className="mt-4 text-sm text-[#0D1B2A]/80 leading-relaxed">{dish.description}</p>
        )}

        {pairingDrinks && pairingDrinks.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide mb-3">合わせるお酒</h2>
            <ul className="space-y-2">
              {pairingDrinks.map((d) => (
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
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {stores && stores.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide mb-3">食べられる店</h2>
            <ul className="space-y-2">
              {stores.map((s) => (
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

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase-admin";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";
const btn = "w-full bg-[#E8A045] text-white rounded-lg py-2 text-sm font-semibold";

async function addDish(fd: FormData) {
  "use server";
  const pairingIds = fd.getAll("pairing_drink_ids") as string[];
  await adminClient().from("dishes").insert({
    name: fd.get("name") as string,
    region_id: (fd.get("region_id") as string) || null,
    description: (fd.get("description") as string) || null,
    pairing_drink_ids: pairingIds.length > 0 ? pairingIds : null,
  });
  revalidatePath("/admin/dishes");
}

async function deleteDish(fd: FormData) {
  "use server";
  await adminClient().from("dishes").delete().eq("id", fd.get("id") as string);
  revalidatePath("/admin/dishes");
}

export default async function DishesPage() {
  const db = adminClient();
  const [{ data: dishes }, { data: regions }, { data: drinks }] = await Promise.all([
    db.from("dishes").select("*, region:regions(name)").order("name"),
    db.from("regions").select("id, name").order("name"),
    db.from("drinks").select("id, name, genre").order("name"),
  ]);

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-12">
      <h1 className="text-xl font-bold text-[#0D1B2A] mb-6">料理</h1>

      <form action={addDish} className="bg-white border border-[#0D1B2A]/10 rounded-xl p-4 mb-8 space-y-3">
        <p className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide">追加</p>
        <input name="name" required placeholder="料理名 *" className={inp} />
        <select name="region_id" className={inp}>
          <option value="">産地（任意）</option>
          {regions?.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <textarea name="description" placeholder="説明" rows={3} className={inp} />

        {drinks && drinks.length > 0 && (
          <div>
            <p className="text-xs text-[#0D1B2A]/50 mb-2">合わせるお酒（複数可）</p>
            <div className="space-y-1 max-h-40 overflow-y-auto border border-[#0D1B2A]/10 rounded-lg px-3 py-2 bg-[#F8F3EC]">
              {drinks.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm text-[#0D1B2A] cursor-pointer">
                  <input type="checkbox" name="pairing_drink_ids" value={d.id} className="accent-[#E8A045]" />
                  {d.name} <span className="text-[#0D1B2A]/40 text-xs">· {d.genre}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className={btn}>追加する</button>
      </form>

      <ul className="space-y-2">
        {dishes?.map((d) => (
          <li key={d.id} className="flex items-center justify-between border border-[#0D1B2A]/10 rounded-xl px-4 py-3 bg-white">
            <div>
              <p className="text-sm font-medium text-[#0D1B2A]">{d.name}</p>
              <p className="text-xs text-[#0D1B2A]/50 mt-0.5">
                {(d.region as { name: string } | null)?.name ?? "産地なし"}
              </p>
            </div>
            <form action={deleteDish}>
              <input type="hidden" name="id" value={d.id} />
              <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1">削除</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase-admin";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";
const btn = "w-full bg-[#E8A045] text-white rounded-lg py-2 text-sm font-semibold";

async function addDrink(fd: FormData) {
  "use server";
  await adminClient().from("drinks").insert({
    name: fd.get("name") as string,
    name_kana: (fd.get("name_kana") as string) || null,
    genre: fd.get("genre") as string,
    region_id: fd.get("region_id") as string,
    description: (fd.get("description") as string) || null,
  });
  revalidatePath("/admin/drinks");
}

async function deleteDrink(fd: FormData) {
  "use server";
  await adminClient().from("drinks").delete().eq("id", fd.get("id") as string);
  revalidatePath("/admin/drinks");
}

export default async function DrinksPage() {
  const db = adminClient();
  const [{ data: drinks }, { data: regions }] = await Promise.all([
    db.from("drinks").select("*, region:regions(name)").order("name"),
    db.from("regions").select("id, name").order("name"),
  ]);

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-12">
      <h1 className="text-xl font-bold text-[#0D1B2A] mb-6">お酒</h1>

      <form action={addDrink} className="bg-white border border-[#0D1B2A]/10 rounded-xl p-4 mb-8 space-y-3">
        <p className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide">追加</p>
        <input name="name" required placeholder="銘柄名 *" className={inp} />
        <input name="name_kana" placeholder="読み仮名" className={inp} />
        <input name="genre" required placeholder="ジャンル * （例：日本酒）" list="genres" className={inp} />
        <datalist id="genres">
          <option value="日本酒" />
          <option value="ワイン" />
          <option value="クラフトビール" />
          <option value="ウイスキー" />
          <option value="スピリッツ" />
          <option value="焼酎" />
          <option value="泡盛" />
        </datalist>
        <select name="region_id" required className={inp}>
          <option value="">産地 *</option>
          {regions?.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <textarea name="description" placeholder="説明" rows={3} className={inp} />
        <button type="submit" className={btn}>追加する</button>
      </form>

      <ul className="space-y-2">
        {drinks?.map((d) => (
          <li key={d.id} className="flex items-center justify-between border border-[#0D1B2A]/10 rounded-xl px-4 py-3 bg-white">
            <div>
              <p className="text-sm font-medium text-[#0D1B2A]">{d.name}</p>
              <p className="text-xs text-[#0D1B2A]/50 mt-0.5">
                {d.genre} · {(d.region as { name: string } | null)?.name ?? "—"}
              </p>
            </div>
            <form action={deleteDrink}>
              <input type="hidden" name="id" value={d.id} />
              <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1">削除</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

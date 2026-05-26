import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase-admin";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";
const btn = "w-full bg-[#E8A045] text-white rounded-lg py-2 text-sm font-semibold";

async function addStore(fd: FormData) {
  "use server";
  const regionIds = fd.getAll("region_ids") as string[];
  const drinkIds = fd.getAll("drink_ids") as string[];
  await adminClient().from("stores").insert({
    name: fd.get("name") as string,
    address: (fd.get("address") as string) || null,
    hours: (fd.get("hours") as string) || null,
    genre: (fd.get("genre") as string) || null,
    google_maps_url: (fd.get("google_maps_url") as string) || null,
    region_ids: regionIds.length > 0 ? regionIds : null,
    drink_ids: drinkIds.length > 0 ? drinkIds : null,
  });
  revalidatePath("/admin/stores");
}

async function updateStore(fd: FormData) {
  "use server";
  const regionIds = fd.getAll("region_ids") as string[];
  const drinkIds = fd.getAll("drink_ids") as string[];
  await adminClient().from("stores").update({
    name: fd.get("name") as string,
    address: (fd.get("address") as string) || null,
    hours: (fd.get("hours") as string) || null,
    genre: (fd.get("genre") as string) || null,
    google_maps_url: (fd.get("google_maps_url") as string) || null,
    region_ids: regionIds.length > 0 ? regionIds : null,
    drink_ids: drinkIds.length > 0 ? drinkIds : null,
  }).eq("id", fd.get("id") as string);
  revalidatePath("/admin/stores");
}

async function deleteStore(fd: FormData) {
  "use server";
  await adminClient().from("stores").delete().eq("id", fd.get("id") as string);
  revalidatePath("/admin/stores");
}

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit: editId } = await searchParams;
  const db = adminClient();
  const [{ data: stores }, { data: regions }, { data: drinks }] = await Promise.all([
    db.from("stores").select("*").order("name"),
    db.from("regions").select("id, name").order("name"),
    db.from("drinks").select("id, name, genre").order("name"),
  ]);

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-12">
      <h1 className="text-xl font-bold text-[#0D1B2A] mb-6">店舗</h1>

      <form action={addStore} className="bg-white border border-[#0D1B2A]/10 rounded-xl p-4 mb-8 space-y-3">
        <p className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide">追加</p>
        <input name="name" required placeholder="店名 *" className={inp} />
        <input name="genre" placeholder="ジャンル（例：バー・居酒屋）" className={inp} />
        <input name="address" placeholder="住所" className={inp} />
        <input name="hours" placeholder="営業時間（例：18:00–26:00）" className={inp} />
        <input name="google_maps_url" type="url" placeholder="Google マップ URL" className={inp} />
        {regions && regions.length > 0 && (
          <div>
            <p className="text-xs text-[#0D1B2A]/50 mb-2">関連産地（複数可）</p>
            <div className="space-y-1 max-h-40 overflow-y-auto border border-[#0D1B2A]/10 rounded-lg px-3 py-2 bg-[#F8F3EC]">
              {regions.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm text-[#0D1B2A] cursor-pointer">
                  <input type="checkbox" name="region_ids" value={r.id} className="accent-[#E8A045]" />
                  {r.name}
                </label>
              ))}
            </div>
          </div>
        )}
        {drinks && drinks.length > 0 && (
          <div>
            <p className="text-xs text-[#0D1B2A]/50 mb-2">提供するお酒（複数可）</p>
            <div className="space-y-1 max-h-40 overflow-y-auto border border-[#0D1B2A]/10 rounded-lg px-3 py-2 bg-[#F8F3EC]">
              {drinks.map((d) => (
                <label key={d.id} className="flex items-center gap-2 text-sm text-[#0D1B2A] cursor-pointer">
                  <input type="checkbox" name="drink_ids" value={d.id} className="accent-[#E8A045]" />
                  {d.name} <span className="text-[#0D1B2A]/40 text-xs">· {d.genre}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <button type="submit" className={btn}>追加する</button>
      </form>

      <ul className="space-y-2">
        {stores?.map((s) => (
          <li key={s.id} className="border border-[#0D1B2A]/10 rounded-xl bg-white">
            {editId === s.id ? (
              <form action={updateStore} className="p-4 space-y-3">
                <p className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide">編集</p>
                <input type="hidden" name="id" value={s.id} />
                <input name="name" required defaultValue={s.name} className={inp} />
                <input name="genre" defaultValue={s.genre ?? ""} placeholder="ジャンル" className={inp} />
                <input name="address" defaultValue={s.address ?? ""} placeholder="住所" className={inp} />
                <input name="hours" defaultValue={s.hours ?? ""} placeholder="営業時間" className={inp} />
                <input name="google_maps_url" type="url" defaultValue={s.google_maps_url ?? ""} placeholder="Google マップ URL" className={inp} />
                {regions && regions.length > 0 && (
                  <div>
                    <p className="text-xs text-[#0D1B2A]/50 mb-2">関連産地（複数可）</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto border border-[#0D1B2A]/10 rounded-lg px-3 py-2 bg-[#F8F3EC]">
                      {regions.map((r) => (
                        <label key={r.id} className="flex items-center gap-2 text-sm text-[#0D1B2A] cursor-pointer">
                          <input
                            type="checkbox"
                            name="region_ids"
                            value={r.id}
                            defaultChecked={(s.region_ids as string[] | null)?.includes(r.id)}
                            className="accent-[#E8A045]"
                          />
                          {r.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {drinks && drinks.length > 0 && (
                  <div>
                    <p className="text-xs text-[#0D1B2A]/50 mb-2">提供するお酒（複数可）</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto border border-[#0D1B2A]/10 rounded-lg px-3 py-2 bg-[#F8F3EC]">
                      {drinks.map((d) => (
                        <label key={d.id} className="flex items-center gap-2 text-sm text-[#0D1B2A] cursor-pointer">
                          <input
                            type="checkbox"
                            name="drink_ids"
                            value={d.id}
                            defaultChecked={(s.drink_ids as string[] | null)?.includes(d.id)}
                            className="accent-[#E8A045]"
                          />
                          {d.name} <span className="text-[#0D1B2A]/40 text-xs">· {d.genre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="submit" className={btn}>保存</button>
                  <a href="?" className="w-full text-center border border-[#0D1B2A]/20 rounded-lg py-2 text-sm text-[#0D1B2A]/60">キャンセル</a>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#0D1B2A]">{s.name}</p>
                  <p className="text-xs text-[#0D1B2A]/50 mt-0.5">{s.genre ?? "—"} · {s.address ?? "住所なし"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <a href={`?edit=${s.id}`} className="text-xs text-[#E8A045] hover:text-[#c87d2e] px-2 py-1">編集</a>
                  <form action={deleteStore}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1">削除</button>
                  </form>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

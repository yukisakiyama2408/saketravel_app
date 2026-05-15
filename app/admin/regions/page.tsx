import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase-admin";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";
const btn = "w-full bg-[#E8A045] text-white rounded-lg py-2 text-sm font-semibold";

async function addRegion(fd: FormData) {
  "use server";
  await adminClient().from("regions").insert({
    name: fd.get("name") as string,
    region_level: fd.get("region_level") as string,
    country: fd.get("country") as string,
    latitude: parseFloat(fd.get("latitude") as string),
    longitude: parseFloat(fd.get("longitude") as string),
    climate: (fd.get("climate") as string) || null,
    food_culture: (fd.get("food_culture") as string) || null,
  });
  revalidatePath("/admin/regions");
}

async function deleteRegion(fd: FormData) {
  "use server";
  await adminClient().from("regions").delete().eq("id", fd.get("id") as string);
  revalidatePath("/admin/regions");
}

export default async function RegionsPage() {
  const { data: regions } = await adminClient().from("regions").select("*").order("name");

  return (
    <div className="max-w-lg mx-auto px-5 py-6 pb-12">
      <h1 className="text-xl font-bold text-[#0D1B2A] mb-6">産地</h1>

      <form action={addRegion} className="bg-white border border-[#0D1B2A]/10 rounded-xl p-4 mb-8 space-y-3">
        <p className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide">追加</p>
        <input name="name" required placeholder="産地名 *" className={inp} />
        <select name="region_level" required className={inp}>
          <option value="">粒度 *</option>
          <option value="市区町村">市区町村</option>
          <option value="都道府県">都道府県</option>
          <option value="国・地域">国・地域</option>
        </select>
        <input name="country" required placeholder="国名 *" className={inp} />
        <div className="flex gap-2">
          <input name="latitude" required type="number" step="any" placeholder="緯度 *" className={inp} />
          <input name="longitude" required type="number" step="any" placeholder="経度 *" className={inp} />
        </div>
        <textarea name="climate" placeholder="気候・地形" rows={3} className={inp} />
        <textarea name="food_culture" placeholder="食文化" rows={3} className={inp} />
        <button type="submit" className={btn}>追加する</button>
      </form>

      <ul className="space-y-2">
        {regions?.map((r) => (
          <li key={r.id} className="flex items-center justify-between border border-[#0D1B2A]/10 rounded-xl px-4 py-3 bg-white">
            <div>
              <p className="text-sm font-medium text-[#0D1B2A]">{r.name}</p>
              <p className="text-xs text-[#0D1B2A]/50 mt-0.5">{r.country} · {r.region_level}</p>
            </div>
            <form action={deleteRegion}>
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className="text-xs text-red-400 hover:text-red-600 px-2 py-1">削除</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

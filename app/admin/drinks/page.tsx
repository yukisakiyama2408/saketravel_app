import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminClient } from "@/lib/supabase-admin";
import { ALL_SPEC_KEYS } from "@/lib/drinkSpecs";
import DrinkSpecFields from "@/components/DrinkSpecFields";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";
const btn = "w-full bg-[#E8A045] text-white rounded-lg py-2 text-sm font-semibold";

function buildSpecs(fd: FormData): Record<string, string> | null {
  const specs: Record<string, string> = {};
  for (const key of ALL_SPEC_KEYS) {
    const val = (fd.get(`spec_${key}`) as string ?? "").trim();
    if (val) specs[key] = val;
  }
  return Object.keys(specs).length > 0 ? specs : null;
}

async function uploadPhoto(db: ReturnType<typeof adminClient>, id: string, file: File): Promise<string | null> {
  const { data, error } = await db.storage.from("images").upload(`drinks/${id}`, file, { upsert: true });
  if (error || !data) return null;
  return db.storage.from("images").getPublicUrl(data.path).data.publicUrl;
}

async function resolvePhotoUrl(
  db: ReturnType<typeof adminClient>,
  id: string,
  fd: FormData
): Promise<string | null | undefined> {
  const file = fd.get("photo") as File;
  if (file && file.size > 0) return uploadPhoto(db, id, file);
  const urlInput = (fd.get("photo_url_input") as string ?? "").trim();
  if (urlInput) return urlInput;
  return undefined;
}

async function addDrink(fd: FormData) {
  "use server";
  const db = adminClient();
  const { data: drink } = await db.from("drinks").insert({
    name: fd.get("name") as string,
    name_kana: (fd.get("name_kana") as string) || null,
    genre: fd.get("genre") as string,
    region_id: fd.get("region_id") as string,
    description: (fd.get("description") as string) || null,
    specs: buildSpecs(fd),
  }).select("id").single();

  if (drink) {
    const photoUrl = await resolvePhotoUrl(db, drink.id, fd);
    if (photoUrl) await db.from("drinks").update({ photo_url: photoUrl }).eq("id", drink.id);
  }
  revalidatePath("/admin/drinks");
}

async function updateDrink(fd: FormData) {
  "use server";
  const id = fd.get("id") as string;
  const db = adminClient();
  const photoUrl = await resolvePhotoUrl(db, id, fd);

  await db.from("drinks").update({
    name: fd.get("name") as string,
    name_kana: (fd.get("name_kana") as string) || null,
    genre: fd.get("genre") as string,
    region_id: fd.get("region_id") as string,
    description: (fd.get("description") as string) || null,
    specs: buildSpecs(fd),
    ...(photoUrl !== undefined && { photo_url: photoUrl }),
  }).eq("id", id);
  revalidatePath("/admin/drinks");
  redirect("/admin/drinks");
}

async function deleteDrink(fd: FormData) {
  "use server";
  const id = fd.get("id") as string;
  const db = adminClient();
  await db.storage.from("images").remove([`drinks/${id}`]);
  await db.from("drinks").delete().eq("id", id);
  revalidatePath("/admin/drinks");
}

export default async function DrinksPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit: editId } = await searchParams;
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
        <DrinkSpecFields listId="genres-add" />
        <select name="region_id" required className={inp}>
          <option value="">産地 *</option>
          {regions?.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <textarea name="description" placeholder="説明" rows={3} className={inp} />
        <PhotoInputSection />
        <button type="submit" className={btn}>追加する</button>
      </form>

      <ul className="space-y-2">
        {drinks?.map((d) => (
          <li key={d.id} className="border border-[#0D1B2A]/10 rounded-xl bg-white">
            {editId === d.id ? (
              <form action={updateDrink} className="p-4 space-y-3">
                <p className="text-xs font-semibold text-[#0D1B2A]/50 tracking-wide">編集</p>
                <input type="hidden" name="id" value={d.id} />
                <input name="name" required defaultValue={d.name} className={inp} />
                <input name="name_kana" defaultValue={d.name_kana ?? ""} placeholder="読み仮名" className={inp} />
                <DrinkSpecFields
                  listId="genres-edit"
                  defaultGenre={d.genre}
                  defaultSpecs={d.specs as Record<string, string> | null}
                />
                <select name="region_id" required defaultValue={d.region_id} className={inp}>
                  <option value="">産地 *</option>
                  {regions?.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <textarea name="description" defaultValue={d.description ?? ""} placeholder="説明" rows={3} className={inp} />
                <PhotoInputSection currentUrl={d.photo_url} currentName={d.name} />
                <div className="flex gap-2">
                  <button type="submit" className={btn}>保存</button>
                  <a href="?" className="w-full text-center border border-[#0D1B2A]/20 rounded-lg py-2 text-sm text-[#0D1B2A]/60">キャンセル</a>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {d.photo_url ? (
                    <img src={d.photo_url} alt={d.name} className="h-10 w-8 object-contain rounded flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-8 rounded flex-shrink-0" style={{ background: "repeating-linear-gradient(45deg, #f0ebe4, #f0ebe4 3px, #f8f3ec 3px, #f8f3ec 6px)" }} />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#0D1B2A]">{d.name}</p>
                    <p className="text-xs text-[#0D1B2A]/50 mt-0.5">
                      {d.genre} · {(d.region as { name: string } | null)?.name ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a href={`?edit=${d.id}`} className="text-xs text-[#E8A045] hover:text-[#c87d2e] px-2 py-1">編集</a>
                  <form action={deleteDrink}>
                    <input type="hidden" name="id" value={d.id} />
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

const fileInp = "w-full text-sm text-[#0D1B2A]/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8A045]/10 file:text-[#E8A045] cursor-pointer";
const urlInp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";

function PhotoInputSection({ currentUrl, currentName }: { currentUrl?: string | null; currentName?: string }) {
  return (
    <div>
      <p className="text-xs text-[#0D1B2A]/50 mb-1.5">ボトル画像（任意）</p>
      {currentUrl && (
        <img src={currentUrl} alt={currentName} className="h-16 w-auto object-contain mb-2 rounded opacity-80" />
      )}
      <input name="photo" type="file" accept="image/*" className={fileInp} />
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 h-px bg-[#0D1B2A]/10" />
        <span className="text-xs text-[#0D1B2A]/30">または URL</span>
        <div className="flex-1 h-px bg-[#0D1B2A]/10" />
      </div>
      <input name="photo_url_input" type="url" placeholder="https://..." defaultValue={currentUrl ?? ""} className={urlInp} />
    </div>
  );
}

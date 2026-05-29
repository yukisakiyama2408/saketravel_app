import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminClient } from "@/lib/supabase-admin";
import { ALL_SPEC_KEYS } from "@/lib/drinkSpecs";
import DrinkSpecFields from "@/components/DrinkSpecFields";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";
const btn = "w-full bg-[#E8A045] text-white rounded-lg py-2 text-sm font-semibold";
const label = "text-[11px] font-semibold text-[#0D1B2A]/50";

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
  const editingDrink = drinks?.find((d) => d.id === editId);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-12 md:px-8">
      {editingDrink && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#0D1B2A]/35 px-4 py-8 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl"
            style={{ background: "var(--paper-2)", borderColor: "var(--ink-08)" }}
          >
            <div
              className="flex items-center justify-between gap-4 border-b px-5 py-4"
              style={{ borderColor: "var(--ink-08)", background: "rgba(244,239,230,0.72)" }}
            >
              <div className="min-w-0">
                <p
                  className="mb-1 text-[10px] tracking-wider"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
                >
                  EDIT DRINK
                </p>
                <h2
                  className="truncate text-lg font-bold"
                  style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
                >
                  {editingDrink.name}
                </h2>
              </div>
              <a
                href="/admin/drinks"
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border text-lg leading-none"
                style={{ borderColor: "var(--ink-08)", color: "var(--ink-50)", background: "var(--paper-2)" }}
                aria-label="閉じる"
              >
                ×
              </a>
            </div>

            <form action={updateDrink} className="space-y-3 p-5">
              <input type="hidden" name="id" value={editingDrink.id} />
              <div className="grid gap-3 md:grid-cols-2">
                <Field labelText="銘柄名 *">
                  <input name="name" required defaultValue={editingDrink.name} className={inp} />
                </Field>
                <Field labelText="読み仮名">
                  <input name="name_kana" defaultValue={editingDrink.name_kana ?? ""} placeholder="読み仮名" className={inp} />
                </Field>
              </div>
              <DrinkSpecFields
                listId="genres-edit"
                defaultGenre={editingDrink.genre}
                defaultSpecs={editingDrink.specs as Record<string, string> | null}
              />
              <Field labelText="産地 *">
                <select name="region_id" required defaultValue={editingDrink.region_id} className={inp}>
                  <option value="">選択してください</option>
                  {regions?.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </Field>
              <Field labelText="説明">
                <textarea name="description" defaultValue={editingDrink.description ?? ""} placeholder="説明" rows={3} className={inp} />
              </Field>
              <PhotoInputSection currentUrl={editingDrink.photo_url} currentName={editingDrink.name} />
              <div className="flex gap-2 pt-1">
                <button type="submit" className={btn}>保存</button>
                <a href="/admin/drinks" className="w-full rounded-lg border border-[#0D1B2A]/20 py-2 text-center text-sm text-[#0D1B2A]/60">キャンセル</a>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-6">
        <p
          className="mb-1 text-[11px] tracking-wider"
          style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}
        >
          DRINKS
        </p>
        <h1
          className="text-[30px] font-bold leading-tight"
          style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}
        >
          お酒
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--ink-70)" }}>
          銘柄名、ジャンル、産地、写真、スペックを登録します。
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
        <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
          <div
            className="border-b px-4 py-3"
            style={{ borderColor: "var(--ink-08)", background: "rgba(244,239,230,0.56)" }}
          >
            <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
              新規追加
            </h2>
            <p className="mt-1 text-xs" style={{ color: "var(--ink-50)" }}>
              必須項目を入力して銘柄を登録
            </p>
          </div>

          <form action={addDrink} className="space-y-3 p-4">
            <Field labelText="銘柄名 *">
              <input name="name" required placeholder="例: 甲州きいろ香" className={inp} />
            </Field>
            <Field labelText="読み仮名">
              <input name="name_kana" placeholder="例: こうしゅう きいろか" className={inp} />
            </Field>
            <DrinkSpecFields listId="genres-add" />
            <Field labelText="産地 *">
              <select name="region_id" required className={inp}>
                <option value="">選択してください</option>
                {regions?.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </Field>
            <Field labelText="説明">
              <textarea name="description" placeholder="味わいや背景など" rows={3} className={inp} />
            </Field>
            <PhotoInputSection />
            <button type="submit" className={btn}>追加する</button>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: "var(--ink-08)" }}>
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
                登録済み
              </h2>
              <p className="mt-1 text-xs" style={{ color: "var(--ink-50)" }}>
                {drinks?.length ?? 0}件
              </p>
            </div>
          </div>

          <ul className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {drinks?.map((d) => (
              <li key={d.id}>
                  <div
                    className="flex h-full flex-col rounded-xl border p-3"
                    style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}
                  >
                    <div className="mb-3 grid place-items-center">
                      <div
                        className="flex aspect-[2/3] w-[112px] items-center justify-center overflow-hidden rounded-lg p-1.5"
                        style={{
                          background: "var(--washi)",
                          border: "1px solid var(--ink-04)",
                        }}
                      >
                        {d.photo_url ? (
                          <img src={d.photo_url} alt={d.name} className="h-full w-full object-contain drop-shadow-sm" />
                        ) : (
                          <div className="h-full w-full rounded" style={{ background: "repeating-linear-gradient(45deg, #f0ebe4, #f0ebe4 3px, #f8f3ec 3px, #f8f3ec 6px)", border: "1px solid var(--ink-08)" }} />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2">
                        <p className="truncate text-base font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
                          {d.name}
                        </p>
                        <span
                          className="mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{
                            background: "var(--amber-tint)",
                            border: "1px solid rgba(200,137,61,0.22)",
                            color: "var(--amber-dk)",
                          }}
                        >
                          {d.genre}
                        </span>
                      </div>

                      <p className="truncate text-xs" style={{ color: "var(--ink-50)" }}>
                        産地: {(d.region as { name: string } | null)?.name ?? "—"}
                      </p>
                      {d.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--ink-70)" }}>
                          {d.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <a href={`?edit=${d.id}`} className="flex-1 rounded-full border border-[#0D1B2A]/10 px-3 py-1.5 text-center text-xs font-semibold text-[#0D1B2A]/50">編集</a>
                      <form action={deleteDrink} className="flex-1">
                        <input type="hidden" name="id" value={d.id} />
                        <button type="submit" className="w-full rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500">削除</button>
                      </form>
                    </div>
                  </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

const fileInp = "w-full text-sm text-[#0D1B2A]/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8A045]/10 file:text-[#E8A045] cursor-pointer";
const urlInp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";

function Field({ labelText, children }: { labelText: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={`${label} mb-1.5 block`}>{labelText}</span>
      {children}
    </label>
  );
}

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

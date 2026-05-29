import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase-admin";

const inp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";
const btn = "w-full bg-[#E8A045] text-white rounded-lg py-2 text-sm font-semibold";
const label = "text-[11px] font-semibold text-[#0D1B2A]/50";
const fileInp = "w-full text-sm text-[#0D1B2A]/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8A045]/10 file:text-[#E8A045] cursor-pointer";
const urlInp = "w-full border border-[#0D1B2A]/10 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] bg-[#F8F3EC] outline-none focus:ring-1 focus:ring-[#E8A045] placeholder-[#0D1B2A]/30";

async function uploadPhoto(db: ReturnType<typeof adminClient>, id: string, file: File): Promise<string | null> {
  const { data, error } = await db.storage.from("images").upload(`regions/${id}`, file, { upsert: true });
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

async function addRegion(fd: FormData) {
  "use server";
  const db = adminClient();
  const { data: region } = await db.from("regions").insert({
    name: fd.get("name") as string,
    region_level: fd.get("region_level") as string,
    country: fd.get("country") as string,
    latitude: parseFloat(fd.get("latitude") as string),
    longitude: parseFloat(fd.get("longitude") as string),
    climate: (fd.get("climate") as string) || null,
    food_culture: (fd.get("food_culture") as string) || null,
  }).select("id").single();

  if (region) {
    const photoUrl = await resolvePhotoUrl(db, region.id, fd);
    if (photoUrl) await db.from("regions").update({ photo_url: photoUrl }).eq("id", region.id);
  }
  revalidatePath("/admin/regions");
}

async function updateRegion(fd: FormData) {
  "use server";
  const id = fd.get("id") as string;
  const db = adminClient();
  const photoUrl = await resolvePhotoUrl(db, id, fd);

  await db.from("regions").update({
    name: fd.get("name") as string,
    region_level: fd.get("region_level") as string,
    country: fd.get("country") as string,
    latitude: parseFloat(fd.get("latitude") as string),
    longitude: parseFloat(fd.get("longitude") as string),
    climate: (fd.get("climate") as string) || null,
    food_culture: (fd.get("food_culture") as string) || null,
    ...(photoUrl !== undefined && { photo_url: photoUrl }),
  }).eq("id", id);
  revalidatePath("/admin/regions");
}

async function deleteRegion(fd: FormData) {
  "use server";
  const id = fd.get("id") as string;
  const db = adminClient();
  await db.storage.from("images").remove([`regions/${id}`]);
  await db.from("regions").delete().eq("id", id);
  revalidatePath("/admin/regions");
}

export default async function RegionsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit: editId } = await searchParams;
  const { data: regions } = await adminClient().from("regions").select("*").order("name");
  const editingRegion = regions?.find((r) => r.id === editId);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-12 md:px-8">
      {editingRegion && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-[#0D1B2A]/35 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl" style={{ background: "var(--paper-2)", borderColor: "var(--ink-08)" }}>
            <ModalHeader title={editingRegion.name} kicker="EDIT REGION" />
            <form action={updateRegion} className="space-y-3 p-5">
              <input type="hidden" name="id" value={editingRegion.id} />
              <div className="grid gap-3 md:grid-cols-2">
                <Field labelText="産地名 *"><input name="name" required defaultValue={editingRegion.name} className={inp} /></Field>
                <Field labelText="粒度 *">
                  <select name="region_level" required defaultValue={editingRegion.region_level} className={inp}>
                    <option value="">選択してください</option>
                    <option value="市区町村">市区町村</option>
                    <option value="都道府県">都道府県</option>
                    <option value="国・地域">国・地域</option>
                  </select>
                </Field>
              </div>
              <Field labelText="国名 *"><input name="country" required defaultValue={editingRegion.country} className={inp} /></Field>
              <div className="grid gap-3 md:grid-cols-2">
                <Field labelText="緯度 *"><input name="latitude" required type="number" step="any" defaultValue={editingRegion.latitude} className={inp} /></Field>
                <Field labelText="経度 *"><input name="longitude" required type="number" step="any" defaultValue={editingRegion.longitude} className={inp} /></Field>
              </div>
              <Field labelText="気候・地形"><textarea name="climate" defaultValue={editingRegion.climate ?? ""} rows={3} className={inp} /></Field>
              <Field labelText="食文化"><textarea name="food_culture" defaultValue={editingRegion.food_culture ?? ""} rows={3} className={inp} /></Field>
              <PhotoInputSection currentUrl={editingRegion.photo_url} currentName={editingRegion.name} />
              <div className="flex gap-2 pt-1">
                <button type="submit" className={btn}>保存</button>
                <a href="/admin/regions" className="w-full rounded-lg border border-[#0D1B2A]/20 py-2 text-center text-sm text-[#0D1B2A]/60">キャンセル</a>
              </div>
            </form>
          </div>
        </div>
      )}

      <PageHeader kicker="REGIONS" title="産地" desc="緯度経度、国、気候、食文化を登録します。" />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
        <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
          <PanelHead title="新規追加" desc="地図に表示する産地を登録" />
          <form action={addRegion} className="space-y-3 p-4">
            <Field labelText="産地名 *"><input name="name" required placeholder="例: 山梨県" className={inp} /></Field>
            <Field labelText="粒度 *">
              <select name="region_level" required className={inp}>
                <option value="">選択してください</option>
                <option value="市区町村">市区町村</option>
                <option value="都道府県">都道府県</option>
                <option value="国・地域">国・地域</option>
              </select>
            </Field>
            <Field labelText="国名 *"><input name="country" required placeholder="例: 日本" className={inp} /></Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field labelText="緯度 *"><input name="latitude" required type="number" step="any" placeholder="35.66" className={inp} /></Field>
              <Field labelText="経度 *"><input name="longitude" required type="number" step="any" placeholder="138.56" className={inp} /></Field>
            </div>
            <Field labelText="気候・地形"><textarea name="climate" placeholder="気候・地形" rows={3} className={inp} /></Field>
            <Field labelText="食文化"><textarea name="food_culture" placeholder="食文化" rows={3} className={inp} /></Field>
            <PhotoInputSection />
            <button type="submit" className={btn}>追加する</button>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
          <ListHead title="登録済み" count={regions?.length ?? 0} />
          <ul className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {regions?.map((r) => (
              <li key={r.id}>
                <div className="flex h-full flex-col rounded-xl border p-4" style={{ borderColor: "var(--ink-08)", background: "var(--paper-2)" }}>
                  <div
                    className="mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg"
                    style={{ background: "var(--washi)", border: "1px solid var(--ink-04)" }}
                  >
                    {r.photo_url ? (
                      <img src={r.photo_url} alt={r.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full" style={{ background: "repeating-linear-gradient(45deg, #f0ebe4, #f0ebe4 6px, #f8f3ec 6px, #f8f3ec 12px)" }} />
                    )}
                  </div>
                  <div className="mb-3">
                    <p className="truncate text-base font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{r.name}</p>
                    <span className="mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "var(--amber-tint)", border: "1px solid rgba(200,137,61,0.22)", color: "var(--amber-dk)" }}>{r.region_level}</span>
                  </div>
                  <div className="flex-1 space-y-1 text-xs" style={{ color: "var(--ink-50)" }}>
                    <p>国: {r.country}</p>
                    <p>座標: {r.latitude}, {r.longitude}</p>
                    {r.climate && <p className="line-clamp-2 leading-relaxed" style={{ color: "var(--ink-70)" }}>{r.climate}</p>}
                  </div>
                  <CardActions editHref={`/admin/regions?edit=${r.id}`} deleteAction={deleteRegion} id={r.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function PageHeader({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return (
    <div className="mb-6">
      <p className="mb-1 text-[11px] tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}>{kicker}</p>
      <h1 className="text-[30px] font-bold leading-tight" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--ink-70)" }}>{desc}</p>
    </div>
  );
}

function PanelHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="border-b px-4 py-3" style={{ borderColor: "var(--ink-08)", background: "rgba(244,239,230,0.56)" }}>
      <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{title}</h2>
      <p className="mt-1 text-xs" style={{ color: "var(--ink-50)" }}>{desc}</p>
    </div>
  );
}

function ListHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="border-b px-4 py-3" style={{ borderColor: "var(--ink-08)" }}>
      <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{title}</h2>
      <p className="mt-1 text-xs" style={{ color: "var(--ink-50)" }}>{count}件</p>
    </div>
  );
}

function Field({ labelText, children }: { labelText: string; children: React.ReactNode }) {
  return <label className="block"><span className={`${label} mb-1.5 block`}>{labelText}</span>{children}</label>;
}

function ModalHeader({ title, kicker }: { title: string; kicker: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-5 py-4" style={{ borderColor: "var(--ink-08)", background: "rgba(244,239,230,0.72)" }}>
      <div className="min-w-0">
        <p className="mb-1 text-[10px] tracking-wider" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-50)" }}>{kicker}</p>
        <h2 className="truncate text-lg font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{title}</h2>
      </div>
      <a href="/admin/regions" className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border text-lg leading-none" style={{ borderColor: "var(--ink-08)", color: "var(--ink-50)", background: "var(--paper-2)" }} aria-label="閉じる">×</a>
    </div>
  );
}

function CardActions({ editHref, deleteAction, id }: { editHref: string; deleteAction: (fd: FormData) => Promise<void>; id: string }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <a href={editHref} className="flex-1 rounded-full border border-[#0D1B2A]/10 px-3 py-1.5 text-center text-xs font-semibold text-[#0D1B2A]/50">編集</a>
      <form action={deleteAction} className="flex-1">
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="w-full rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500">削除</button>
      </form>
    </div>
  );
}

function PhotoInputSection({ currentUrl, currentName }: { currentUrl?: string | null; currentName?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-[#0D1B2A]/50">代表画像（任意）</p>
      {currentUrl && (
        <img src={currentUrl} alt={currentName} className="mb-2 h-24 w-full rounded-lg object-cover opacity-90" />
      )}
      <input name="photo" type="file" accept="image/*" className={fileInp} />
      <div className="my-2 flex items-center gap-2">
        <div className="h-px flex-1 bg-[#0D1B2A]/10" />
        <span className="text-xs text-[#0D1B2A]/30">または URL</span>
        <div className="h-px flex-1 bg-[#0D1B2A]/10" />
      </div>
      <input name="photo_url_input" type="url" placeholder="https://..." defaultValue={currentUrl ?? ""} className={urlInp} />
    </div>
  );
}
